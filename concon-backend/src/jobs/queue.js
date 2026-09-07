const { Queue } = require("bullmq");
const notificationQueue = new Queue("notifications", { connection: { url: process.env.REDIS_URL } });
module.exports = { notificationQueue };