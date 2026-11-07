const required = [ "MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "REDIS_URL" ];
required.forEach((key) => {
    if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
});

const nodeEnv = process.env.NODE_ENV || "development";
const clientOrigins = (process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

// Allowed origins for CORS and Socker.IO.
// - explicit list when CLIENT_ORIGINS is set
// - reflect any origin in dev/test (so localhost ports "just work")
// - block cross-origin browser access in production if nothing is configured
const corsOrigin = clientOrigins.length ? clientOrigins : nodeEnv === "production" ? false : true;

module.exports = {
    nodeEnv,
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    redisUrl: process.env.REDIS_URL,
    clientOrigins,
    corsOrigin,
    aws: {
        region: process.env.AWS_REGION,
        bucket: process.env.AWS_BUCKET_NAME,
        publicBasicUrl: process.env.AWS_PUBLIC_BASE_URL,
    },
};