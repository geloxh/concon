const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const redisClient = require("../config/redis");

function createRateLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message: message || "Too many requests, try again later" },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix: "rl:",
    }),
  });
}

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: "Too many auth attempts, please try again in 15 minutes",
});

const messageLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 min
  max: 60,
  message: "You're sending messages too fast",
});

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

module.exports = { authLimiter, messageLimiter, generalLimiter };