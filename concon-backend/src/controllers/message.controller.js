const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/apiResponse");
const messageService = require("../services/message.service");
const { emitToConversation } = require("../utils/realtime");

exports.getMessages = catchAsync(async (req, res) => {
    const { conversationId } = req.params;
    const { cursor, limit } = req.query;

    const { messages, nextCursor } = await messageService.getMessages({
        conversationId,
        userId: req.userId,
        cursor,
        limit,
    });

    // `data` is the page of messages; `nextCursor` is passed back as ?cursor= to load older ones
    res.json({ success: true, data: messages, nextCursor });
});

exports.sendMessage = catchAsync(async (req, res) => { 
    const { conversationId, contentType, content, } = req.body;

    const message = await messageService.createMessage({
        conversationId,
        senderId: req.userId,
        contentType,
        content,
    });

    // Same real-time event the socket path emits, so REST-sent messages show up live too
    emitToConversation(req.app.get("io"), conversationId, "newMessage", message);

    return success(res, 201, { message });
});

exports.markRead = catchAsync(async (req, res) => {
    const { conversationId } = req.params;
    const { messageId } = req.body;

    await messageService.markRead({ conversationId, userId: req.userId, messageId });
    emitToConversation(req.app.get("io"), conversationId, "messageStatusUpdate", {
        conversationId,
        messageId,
        userId: String(req.userId),
        status: "read",
    });

    return success(res, 200, { message: "Marked as read" });
})