const { Worker } = require("bullmq");
const { createBullConnection } = require("../config/bullqm");
const logger = require("../utils/logger");

// TODO: plug in a real provider. Needs a device-token store (e.g. a DeviceToken model with
// POST /users/me/devices) and FCM / APNs / web-push credentials.
async function sendPushNotification({ userId, title, body }) {
  logger.info(`[push] -> user ${userId}: ${title} - ${body}`);
  // e.g. await admin.messaging().sendEachForMulticast({ tokens: notification: { title, body } });
}

function startNotificationWorker() {
  const worker = new Worker(
    "notifications",
    async (job) => {
      const { userId, title, body } = job.data;
      await sendPushNotification({ userId, title, body });
    },
    { connection: createBullConnection(), concurrency: 10 }
  );

  worker.on("failed", (job, err) => {
    logger.error(`Notification job ${job?.id} failed`, { err: err.message });
  });

  return worker;
};

module.exports = { startNotificationWorker };