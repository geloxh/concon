const { Worker } = require("bullmq");
const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");
const { createBullConnection } = require("../config/bullmq");
const s3Client = require("../config/s3");
const { aws } = require("../config/env");
const { publicUrlFor } = require("../services/upload.service");
const Message = require("../models/Message");
const logger = require("../utils/logger");

// Downloads the uploaded image, makes a 320px WebP thumbnail, uploads it, and records its URL on the message
async function generateThumbnail({ key, messageId }) {
  const object = await s3Client.send(new GetObjectCommand({ Bucket: aws.bucket, Key: key }));
  const original = Buffer.from(await object.Body.transformToByteArray());

  const thumbnail = await sharp(original)
    .rotate() // respect EXIF orientation
    .resize(320, 320, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const thumbKey = `thumbnails/${key.replace(/\.[^/.]+$/, "")}.webp`;
  await s3Client.send(
    new PutObjectCommand({ Bucket: aws.bucket, Key: thumbKey, Body: thumbnail, ContentType: "image/webp" })
  );

  await Message.updateOne({ _id: messageId }, { "content.thumbnailUrl": publicUrlFor(thumbKey) });
  logger.info(`[media] thumbnail created for message ${messageId}`);
}

function startMediaWorker() {
  const worker = new Worker(
    "media-processing",
    async (job) => generateThumbnail(job.data),
    { connection: createBullConnection(), concurrency: 3 }
  );

  worker.on("failed", (job, err) => {
    logger.error(`Media job ${job?.id} failed`, { err: err.message });
  });

  return worker;
}

module.exports = { startMediaWorker, generateThumbnail };