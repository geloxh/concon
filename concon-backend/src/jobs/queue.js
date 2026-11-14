const { Queue } = require("bullmq");
const { createBullConnection } = require("../config/bullmq");

// Queues are created lazily so importing a service never opens a Redis connection
// (keeps unit tests and scripts clean).
let notificationQueue = null;
let mediaQueue = null;

function getNotificationQueue() {
    if (!notificationQueue) notificationQueue = new Queue("notifications", { connection: createBullConnection() });
    return notificationQueue;
}

function getMediaQueue() {
    if (!mediaQueue) mediaQueue = new Queue("media-processing", {connection: createBullConnection() });
    return mediaQueue;
}

async function closeQueues() {
    await Promise.all([notificationQueue?.close(), mediaQueue.close()]);
}

module.exports = { getNotificationQueue, getMediaQueue, closeQueues };