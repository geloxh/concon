const { Worker } = require("bullmq");
const { redisUrl } = require("../config/env");
const logger = require("../utils/logger");
const Message = require("../models/Message");

// Placeholder — plug in sharp/ffmpeg or an S3->Lambda thumbnail pipeline here
async function generateThumbnail({ key, messageId }) {
  logger.info(`[media] generating thumbnail for ${key}`);
  const thumbnailUrl = `https://your-bucket.s3.amazonaws.com/thumbnails/${key}`;

  await Message.findByIdAndUpdate(messageId, {
    "content.thumbnailUrl": thumbnailUrl,
  });
}

const mediaWorker = new Worker(
  "media-processing",
  async (job) => {
    const { key, messageId } = job.data;
    await generateThumbnail({ key, messageId });
  },
  { connection: { url: redisUrl } }
);

mediaWorker.on("failed", (job, err) => {
  logger.error(`Media job ${job.id} failed`, { err: err.message });
});

module.exports = mediaWorker;