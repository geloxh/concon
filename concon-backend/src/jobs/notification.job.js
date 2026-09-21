const { Worker } = require("bullmq");
const { redisUrl } = require("../config/env");
const logger = require("../utils/logger");

// Placeholder push logic — swap in FCM (mobile) / web push here
async function sendPushNotification({ userId, title, body }) {
  logger.info(`[push] -> user ${userId}: ${title} - ${body}`);
  // e.g. await admin.messaging().send({ token: deviceToken, notification: { title, body } });
}

const notificationWorker = new Worker(
  "notifications",
  async (job) => {
    const { userId, title, body } = job.data;
    await sendPushNotification({ userId, title, body });
  },
  { connection: { url: redisUrl } }
);

notificationWorker.on("failed", (job, err) => {
  logger.error(`Notification job ${job.id} failed`, { err: err.message });
});

module.exports = notificationWorker;