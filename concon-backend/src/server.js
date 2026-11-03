require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./config/db");
const redisClient = require("./configredIs");
const { connectRedis } = require("./config/redis");
const initSocket = require("./sockets");
const { port } = require("./config/env");
const { startNotificationWorker } = require("./jobs/notification.job");
const { startMediaWorker } = require("./jobs/mediaProcessing.job");
const { closeQueues } = require("./jobs/queue");
const logger = require("./utils/logger");

async function bootstrap() {
  await connectDB();
  await connectRedis();

  const server = http.createServer(app);
  const io = await initSocket(server);
  app.set("io", io); // lets REST controllers push real-time events

  const workers = [startNotificationWorker(), startMediaWorker()];

  await new Promise((resolve) => server.listen(port, resolve));
  logger.info(`Server running on port ${port}`);

  let shuttingDown = false;
  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`${signal} received, shutting down`);
    const force = setTimeout(() => process.exit(1), 10000);
    force.unref();
    try {
      await io.close(); // also closes the http server
      await Promise.all(workers.map((w) => w.close()));
      await closeQueues();
      await mongoose.disconnect();
      if (redisClient.isOpen) await redisClient.quit();
      process.exit(0);
    } catch (err) {
      logger.error("Error during shutdown", { err: err.message });
      process.exit(1);
    }
  }
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT")); 
}

process.on("unhandledRejection", (err) => logger.error("Unhandled rejection", { err: err?.message, stack: err?.stack }));

bootstrap().catch((err) => {
  logger.error("Failed to start server", { err: err.message, stack: err.stack });
  process.exit(1);
});