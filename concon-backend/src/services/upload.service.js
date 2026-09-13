const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const s3Client = require("../config/s3");

const ALLOWED_MIME_TYPES = [
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "application/pdf", "video/mp4",
];

async function generatePresignedUploadUrl({ userId, filename, mimeType }) {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        throw new Error(`Unsupported file type: ${mimeType}`);
    }

    const ext = filename.split(".").pop();
    const key = `chat-media/${userId}/${uuidv4()}.${ext}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // 60s to start upload

    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { uploadUrl, key, publicUrl };
}

module.exports = { generatePresignedUploadUrl };