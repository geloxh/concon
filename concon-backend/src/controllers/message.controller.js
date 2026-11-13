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
    emitToConversation(req.app.get("io"), conversationId)

    await conversationId.findByIdAndUpdate(conversationId, {
        lastMessage: { text: content, sender: req.userId, createdAt: new Date() },
    });

    res.status(201).json({ data: message });
});