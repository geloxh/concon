const { S3Client } = require("@aws-sdk/client-s3");
const { aws } = require("./env");

// Credentials come from the default AWS provider chain
// (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars, IAM role, etc.)
module.exports = new S3Client({ region: aws.region || "us-east-1" });