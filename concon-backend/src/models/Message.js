const { Schema, model } = require("mongoose");

const contentSchema = new Schema ({
    text: String,
    url: String, // public URL of an uploaded file
    key: String, // S3 object key of an uploaded file
    mimeType: String,
    size: Number,
    thumbnailUrl: String, // filled in later by the media-processing job
},
    {
    _id: false
});

const messageSchema = new Schema ({
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: contentSchema, required: true },
    contentType: { type: String, enum: ["text", "image", "file", "video"], default: "text" },
    readBy: [{ _id: false, userId: { type: Schema.Types.ObjectId, ref: "User" }, readAt: Date }, ],
},
{ timeStamps: true });

// Cursor pagination: newest first within a conversation
messageSchema.index({ conversationId: 1, _id: -1 });

module.exports = model("Message", messageSchema);