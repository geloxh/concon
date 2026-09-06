const Message = require("../models/Message");
const catchAsync = require("../utils/catchAsync");

exports.getMessages = catchAsync(async (req, res) => {
    const { conversationId } = req.params;
    const { cursor, limit = 30 } = req.query;

    const filter = { conversationId };
    if (cursor) filter._id = { $lt: cursor };

    const messages = await Message.find(filter)
        .sort({ _id: -1 })
        .limit(Number(limit));

    res.json({ data: messages.reverse(), nextCursor: messages[0]?._id || null });
});

exports.sendMessage = catchAsync(async (req, res) => { 
    const { conversationId, content, contentType } = req.body;

    const message = await Message.create({
        conversationId,
        sender: req.userId,
        content,
        contentType,
    });

    await conversationId.findByIdAndUpdate(conversationId, {
        lastMessage: { text: content, sender: req.userId, createdAt: new Date() },
    });

    res.status(201).json({ data: message });
});