const required = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "REDIS_URL"];
required.forEach((key) => {
    if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
});

module.exports = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    redisUrl: process.env.REDIS_URL,
};