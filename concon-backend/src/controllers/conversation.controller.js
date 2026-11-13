const Conversation = require("../models/Conversation");
const Message = require("../models/Mesage");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/apiError");
const { success } = require("../utils/apiResponse");
const {
  joinUsersToConversation,
  removeUserFromConversation,
  emitToUsers,
  emitToConversation,
} = require("../utils/realtime");

const POPULATE_FIELDS = "username avatar status";

exports.createConversation = catchAsync(async (req, res) => {
  const { type, participants, groupName } = req.body;
  const allParticipants = [...new Set([...participants, String(req.userId)])];

  if (type === "direct" && allParticipants.length !==2) {
    throw new ApiError(400, "Direct conversations must have exactly 2 participants");
  }

  if (type === "group" && allParticipants.length < 2) {
    throw new ApiError(400, "Group conversations need at least 2 participants");
  }

  const found = await User.countDocuments({ _id: { $in: allParticipants } });
  if (found !== allParticipants.length) throw new ApiError(404, "One or more users not found.");

  if (type === "direct") {
    // Reuse the existing direct conversation between these two users
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

  // Put everyone's live sockets into the new room and tell their clients about it
  const io = req.app.get("io");
  joinUsersToConversation(io, allParticipants, conversation._id);
  emitToUsers(io, allParticipants, "conversationCreated", { conversation });

  return success(res, 201, { conversation });
});

exports.getMyConversations = catchAsync(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.userId })
    .populate("participants", POPULATE_FIELDS)
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

  if (!(await User.exists({ _id: userid }))) throw new ApiError(404, "User not found.");
 
  const alreadyIn = conversation.participants.some((p) => String(p) === userId);
  if (!alreadyIn) {
    conversation.participants.push(userId);
    await conversation.save();

    const io = req.app.get("io");
    joinUsersToConversation(io, [userId], conversation._id);
    emitToUsers(io, [userId], "conversationCreated", { conversation });
    emitToConversation(io, conversation._id, "participantAdded", { conversationId: conversation._id, userId });
  }

  return success(res, 200, { conversation });
});

exports.removeParticipant = catchAsync(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation) throw new ApiError(404, "Conversation not found");
  if (conversation.type !== "group") throw new ApiError(400, "Can only remove members from group conversations");

  const targetId = req.params.userId;
  const isAdmin = String(conversation.admin) === String(req.userId);
  const isSelf = targetId === String(req.userId);
  if (!isAdmin && !isSelf) throw new ApiError(403, "Not authorized to remove this member");

  if (!conversation.participants.some((p) => String(p) === targetId)) {
    throw new ApiError(404, "User is not in this conversation");
  }
  conversation.participants = conversation.participants.filter((p) => String(p) !== targetId);

  const io = req.app.get("io");

  // Nobody left: delete the conversation and its messages
  if (conversation.participants.length === 0) {
    await Promise.all([!Message.deleteMany({ conversationId: conversation._id }), conversation.deleteOne()]);
    removeUserFromConversation(io, targetId, conversation._id);
    return success(res, 200, { message: "Conversation deleted"});
  }

  // The admin left: hand the role to the longest-standing remaining member
  if (String(conversation.admin) === targetId) conversation.admin = conversation.participants[0];

  await conversation.save();

  removeUserFromConversation(io, targetId, conversation._id);
  emitToUsers(io, [targetId], "removedFromConversation", { conversationId: conversation._id });
  emitToConversation(io, conversation._id, "participantRemoved", {
    conversationId: conversation._id,
    userId: targetId,
    admin: conversation.admin,
  })

  return success(res, 200, { conversation });
});