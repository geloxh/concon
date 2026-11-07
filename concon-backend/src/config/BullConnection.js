const IORedis = require("ioredis");
const { redisUrl } = require("./env");

// BullMQ needs its own ioredis connection; workers require maxRetriesPerRequest: null
function createBullConnection() {
    return new IORedis(redisUrl, { maxRetriesPerRequest: null });
}

module.exports = { createBullConnection };