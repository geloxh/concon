const rateLimit = require("express-rate-limit");
const rlr = require("rate-limit-redis");
const redisClient = require("../config/redis");

const RedisStore = rlr.RedisStore || rlr.default || rlr;
const isTest = process.env.NODE_ENV === "test";

function createRateLimiter({ name, windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    message: { success: false, message: message || "Too many requests, try again later" },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isTest, // no Redis in unit tests
    // Redis store so limits are shared across server instances; each limiter needs its own prefix
    ...RedisStore(isTest
      ? {}
      : {
          store: new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
            prefix: `rl:${name}:`,
          }),
        }),
  });
}

const authLimiter = createRateLimiter({
  name: "auth",
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: "Too many auth attempts, please try again in 15 minutes",
});

const messageLimiter = createRateLimiter({
  name: "message",
  windowMs: 60 * 1000, // 1 min
  max: 60,
  message: "You're sending messages too fast",
});

const generalLimiter = createRateLimiter({
  name: "general",
  windowMs: 15 * 60 * 1000,
  max: 300,
});

module.exports = { authLimiter, messageLimiter, generalLimiter };