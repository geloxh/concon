require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const initSocket = require("./sockets");
const { port } = require("./config/env");
const logger = require("./utils/logger");

// Import workers so they start listening for jobs
require("./jobs/notification.job");
require("./jobs/mediaProcessing.job");

async function bootstrap() {
  await connectDB();
  await connectRedis();

  const server = http.createServer(app);
  await initSocket(server);

  server.listen(port, () => logger.info(`Server running on port ${port}`));
}

bootstrap().catch((err) => {
  logger.error("Failed to start server", { err });
  process.exit(1);
});