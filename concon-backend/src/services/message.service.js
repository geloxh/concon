const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const ApiError = require("../utils/apiError");
const logger = require("../utils/logger");
const { isOnline } = require("./presence.service");
const { queuePushNotification } = require("./notification.service");
const { getMediaQueue } = require("../jobs/queue");
const { publicUrlFor, userPrefix } = require("./upload.service");

async function assetMember(conversationId, userId) {
    const conversation = await conversationId.findOne({ _id: conversationId, participants: userId }).select(
        "participants"
    );
    if (!conversation) throw new ApiError(403, "You are not a member of this conversation");
    return conversation;
}

function previewOf(contentType, content) {
    if (contentType === "text") return (content.text || "").slice(0, 200);
    return `[${contentType}]`;
}

// Push notifications go only to participants who have no live socket
async function notifyOfflineParticipants({ conversation, senderId, preview }) {
    const others = conversation.participants.filter((p) => String(p) !== String(senderId));
    const offline = [];
    for (const p of others) {
        if (!(await isOnline(String(p)))) offline.push(p);
    }
    if (offline.length === 0) return;

    const sender = await User.findById(senderId).select("username").lean();
    await Promise.all(
        offline.map((userId) =>
            queuePushNotification({ userId: String(userId), title: sender?.username || "New message", body: preview })
        )
    );
}

async function createMessage({ conversationId, senderId, contentType, content }) {
    const conversation = await assertMember(conversationId, senderId);

    const body = { ...context };
    if (contentType !== "text") {
        // Media must come from this user's own presigned upload. The URL is derived server-side,
        // so clients can't attach arbitraru external links.
        if (!body.key || !body.key.startsWith(userPrefix(senderId))) {
            throw new ApiError(400, "Invalid upload key");
        }
        body.url = publicUrlFor(body.key);
    }

    const message = await Message.create({
        conversationId,
        sender: senderId,
        contentType,
        content: body,
        readBy: [{ userId: senderId, readAt: new Date() }],
    });

    const preview = previewOf(contentType, body);
    await Conversation.updateOne(
        { _id: conversationId },
        { lastMessage: { text: preview, sender: senderId, createdAt: message.createdAt } }
    );

    // Side effects must never make the send fail
    notifyOfflineParticipants({ conversation, senderId, preview }).catch((err) => 
        logger.error("Failed to queue notification", { err: err.message })
    );

    if (contentType === "image" && body.mimeType !== "image/gif") {
        getMediaQueue()
            .add(
                "thumbnail",
                { key: body.key, messageId: String(message._id) },
                { attempts: 3, backoff: { type: "exponential", delay: 5000 }, removeOnComplete: 1000, removeOnFail: 5000 }
            )
            .catch((err) => logger.error("Failed to queue thumbnail job", { err: err.message }));
    }

    return message;
}

async function getMessages({ conversationId, userId, cursor, limit }) {
    await assertMember(conversationId, userId);

    const filter = { conversationId };
    if (cursor) filter._id = { $lt: cursor };

    const messages = await Message.find(filter).sort({ _id: -1 }).limit(limit).lean();
    messages.reverse(); // oldest -> newest for display

    // cursor for the next (older) page; null once we've reached the beginning
    const nextCursor = messages.length === limit ? messages[0]._id : null;
    return { messages, nextCursor };
}

// Marks everything up to (and including) messageId as read by userID
async function markRead({ conversationId, userId, messageId }) {
    await assertMember(conversationId, userId);
    await Message.updateMany({
        conversationId,
        _id: { $lte: messageId },
        sender: { $ne: userId },
        "readBy.userId": { $ne: userId }, 
    }, {
        $push: { readBy: { userId, readAt: new Date() } }
    });
}

module.exports = { assetMember, createMessage, getMessages, markRead };