const Conversation = require("../models/Conversation");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/apiError");
const { success } = require("../utils/apiResponse");

exports.createConversation = catchAsync(async (req, res) => {
  const { type, participants, groupName } = req.body;
  const allParticipants = [...new Set([...participants, req.userId.toString()])];

  if (type === "direct") {
    if (allParticipants.length !== 2) {
      throw new ApiError(400, "Direct conversations must have exactly 2 participants");
    }

    // Reuse existing direct conversation if one already exists between these two users
    const existing = await Conversation.findOne({
      type: "direct",
      participants: { $all: allParticipants, $size: 2 },
    });
    if (existing) return success(res, 200, { conversation: existing });
  }

  const conversation = await Conversation.create({
    type,
    participants: allParticipants,
    groupName: type === "group" ? groupName : undefined,
    admin: type === "group" ? req.userId : undefined,
  });

  return success(res, 201, { conversation });
});

exports.getMyConversations = catchAsync(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.userId })
    .populate("participants", "username avatar status")
    .sort({ updatedAt: -1 });

  return success(res, 200, { conversations });
});

exports.getConversationById = catchAsync(async (req, res) => {
  const conversation = await Conversation.findOne({
    _id: req.params.id,
    participants: req.userId,
  }).populate("participants", "username avatar status");

  if (!conversation) throw new ApiError(404, "Conversation not found");
  return success(res, 200, { conversation });
});

exports.addParticipant = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) throw new ApiError(404, "Conversation not found");
  if (conversation.type !== "group") throw new ApiError(400, "Can only add members to group conversations");
  if (String(conversation.admin) !== String(req.userId)) throw new ApiError(403, "Only the admin can add members");

  if (!conversation.participants.includes(userId)) {
    conversation.participants.push(userId);
    await conversation.save();
  }

  return success(res, 200, { conversation });
});

exports.removeParticipant = catchAsync(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) throw new ApiError(404, "Conversation not found");
  if (conversation.type !== "group") throw new ApiError(400, "Can only remove members from group conversations");

  const isAdmin = String(conversation.admin) === String(req.userId);
  const isSelf = req.params.userId === req.userId.toString();
  if (!isAdmin && !isSelf) throw new ApiError(403, "Not authorized to remove this member");

  conversation.participants = conversation.participants.filter(
    (p) => p.toString() !== req.params.userId
  );
  await conversation.save();

  return success(res, 200, { conversation });
});