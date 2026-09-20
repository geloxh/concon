const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/apiError");
const { success } = require("../utils/apiResponse");
const {
  registerUser,
  validateCredentials,
  generateTokens,
} = require("../services/auth.service");
const { jwtRefreshSecret } = require("../config/env");

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
}

exports.register = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) throw new ApiError(409, "Email or username already in use");

  const user = await registerUser({ username, email, password });
  const { accessToken, refreshToken } = generateTokens(user._id);

  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    userAgent: req.headers["user-agent"],
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  setRefreshCookie(res, refreshToken);

  return success(res, 201, {
    user: { id: user._id, username: user.username, email: user.email },
    accessToken,
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await validateCredentials(email, password);
  if (!user) throw new ApiError(401, "Invalid email or password");

  const { accessToken, refreshToken } = generateTokens(user._id);

  await RefreshToken.create({
    userId: user._id,
    token: refreshToken,
    userAgent: req.headers["user-agent"],
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  user.status = "online";
  user.lastSeen = new Date();
  await user.save();

  setRefreshCookie(res, refreshToken);

  return success(res, 200, {
    user: { id: user._id, username: user.username, email: user.email },
    accessToken,
  });
});

exports.refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token missing");

  const stored = await RefreshToken.findOne({ token, revoked: false });
  if (!stored) throw new ApiError(401, "Invalid refresh token");

  let payload;
  try {
    payload = jwt.verify(token, jwtRefreshSecret);
  } catch {
    throw new ApiError(401, "Expired or invalid refresh token");
  }

  // Rotate: revoke old, issue new
  stored.revoked = true;
  await stored.save();

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload.sub);

  await RefreshToken.create({
    userId: payload.sub,
    token: newRefreshToken,
    userAgent: req.headers["user-agent"],
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  setRefreshCookie(res, newRefreshToken);

  return success(res, 200, { accessToken });
});

exports.logout = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (token) {
    await RefreshToken.updateOne({ token }, { revoked: true });
  }

  if (req.userId) {
    await User.findByIdAndUpdate(req.userId, { status: "offline", lastSeen: new Date() });
  }

  res.clearCookie("refreshToken");
  return success(res, 200, { message: "Logged out" });
});