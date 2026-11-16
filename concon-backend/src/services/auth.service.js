const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const ApiError = require("../utils/apiError");
const { jwtSecret, jwtRefreshSecret } = require("../config/env");

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Refresh tokens are stored hashed, so a database leak doesn't hand out live sessions
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

async function registerUser({ username, email, password }) {
  const passwordHash = await bcrypt.hash(password, 12);
  return User.create({ username, email, passwordHash });
}

async function validateCredentials(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}

function generateTokens(userId) {
  const sub = String(userId);
  const accessToken = jwt.sign({ sub }, jwtSecret, { expiresIn: "15m" });
  // jti makes every refresh token unique, even if two are issued in the same second
  const refreshToken = jwt.sign({ sub, jti: crypto.randomUUID() }, jwtRefreshSecret, { expiresIn: "30d" });
  return { accessToken, refreshToken };
}

async function createSession(userId, userAgent) {
  const tokens = generateTokens(userId);
  await RefreshToken.create({
    userId,
    token: hashToken(tokens.refreshToken),
    userAgent,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });
  return tokens;
}

// Rotates a refresh token. Presenting an already-used token means it may have been stolen,
// so every session of that user is revoked.
async function rotateRefreshToken(rawToken, userAgent) {
  let payload;
  try {
    payload = jwt.verify(rawToken, jwtRefreshSecret);
  } catch {
    throw new ApiError(401, "Expired or invalid refresh token");
  }

  const hash = hashToken(rawToken);
  const stored = await RefreshToken.findOneAndUpdate({ token: hash, revoked: false }, { revoked: true });

  if (!stored) {
    const reused = await RefreshToken.exists({ token: hash });
    if (reused) await RefreshToken.updateMany({ userId: payload.sub }, { revoked: true });
    throw new ApiError(401, "Invalid refresh token");
  }

  const userExists = await User.exists({ _id: payload.sub });
  if (!userExists) throw new ApiError(401, "User no longer exists");

  return createSession(payload.sub, userAgent);
}

async function revokeRefreshToken(rawToken) {
  await RefreshToken.updateOne({ token: hashToken(rawToken) }, { revoked: true });
}

module.exports = {
  REFRESH_TOKEN_TTL_MS,
  registerUser,
  validateCredentials,
  generateTokens,
  createSession,
  rotateRefreshToken,
  revokeRefreshToken,
};
