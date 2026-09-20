const { createClient } = require("redis");
const logger = require("../utils/logger");

const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.on("error", (err) => logger.error("Redis error", { err }));
redisClient.on("connect", () => logger.info("Redis connected"));

async function connectRedis() {
  if (!redisClient.isOpen) await redisClient.connect();
}

module.exports = redisClient;
module.exports.connectRedis = connectRedis;