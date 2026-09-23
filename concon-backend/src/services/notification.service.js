const { notificationQueue } = require("../jobs/queue");

async function queuePushNotification({ userId, title, body }) {
  await notificationQueue.add("push", { userId, title, body }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  });
}

module.exports = { queuePushNotification };