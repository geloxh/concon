const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/apiError");
const { success } = require("../utils/apiResponse");
const {
  REFRESH_TOKEN_TTL_MS,
  registerUser,
  validateCredentials,
  createSession,
  rotateRefreshToken,
  revokeRefreshToken,
} = require("../services/auth.service");

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/api/v1/auth", // the browser only sends this cookies to the auth routes
});

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, { ...cookieOptions(), maxAge: REFRESH_TOKEN_TTL_MS });
}

// Mobile and desktop apps have no cookie jar to rely on, so they get the refresh token in the body.
// They identify themselves with the header `x-client-platform: mobile | desktop`.
const isNativeClient = (req) => [ "mobile", "desktop" ].includes(req.headers["x-client-platform"]);

function sendSession(req, res, statusCode, user, { accessToken, refreshToken }) {
  setRefreshCookie(res, refreshToken);
  return success(res, statusCode, {
    ...(user && { user: { id: user._id, username: user.username, email: user.email } }),
    accessToken,
    ...(isNativeClient(req) && { refreshToken }),
  });
}

exports.register = catchAsync(async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
  if (existing) throw new ApiError(400, "Email or username already in use. Please try another email.");

  const user = await registerUser({ username, email, password });
  const tokens = await createSession(user._id, req.headers["user-agent"]);

  returnsendSession(req, res, 201, user, tokens);
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await validateCredentials(email, password);
  if (!user) throw new ApiError(401, "Invalid email or password");

  const tokens = await createSession(user._id, req.headers["user-agent"]);

  return sendSession(req, res, 200, user, tokens);
});

exports.refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token missing.");

  const tokens = await rotateRefreshToken(token, req.headers["user-agent"]);

  return sendSession(req, res, 200, null, tokens);
});

exports.logouy = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (token) await revokeRefreshToken(token);

  res.clearCookie("refreshToken", cookieOptions());
  return success(req, 200., { message: "Logged out." });
});






const { jwtRefreshSecret } = require("../config/env");

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days


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