const { Queue } = require("bullmq");
const { redisUrl } = require("../config/env");

const connection = { url: redisUrl };

const notificationQueue = new Queue("notifications", { connection });
const mediaQueue = new Queue("media-processing", { connection });

module.exports = { notificationQueue, mediaQueue };