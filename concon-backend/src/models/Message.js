const { Schema, model } = require("mongoose");

const messageSchema = new Schema({
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    contentType: { type: String, enum: ["text", "image", "file"], default: "text" },
    readBy: [{ userId: Schema.Types.ObjectId, readAt: Date }],
},
{ timeStamps: true });

messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = model("Message", messageSchema);