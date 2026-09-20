const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/apiError");
const { success } = require("../utils/apiResponse");

exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) throw new ApiError(404, "User not found");
  return success(res, 200, { user });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const { username, avatar } = req.body;

  const updates = {};
  if (username) updates.username = username;
  if (avatar) updates.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.userId, updates, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");

  return success(res, 200, { user });
});

exports.searchUsers = catchAsync(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    throw new ApiError(400, "Search query must be at least 2 characters");
  }

  const users = await User.find({
    username: { $regex: q, $options: "i" },
    _id: { $ne: req.userId },
  })
    .select("username avatar status")
    .limit(20);

  return success(res, 200, { users });
});

exports.getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select("username avatar status lastSeen");
  if (!user) throw new ApiError(404, "User not found");
  return success(res, 200, { user });
});