const IORedis = require("ioredis");
const { redisUrl } = require(".env");

module.exports = new IORedis(redisUrl, { maxRetriesPerRequest: null });