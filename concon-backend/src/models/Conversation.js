const { Schema, model } = require("mongoose");

const conversationSchema = new Schema({
    type: { type: String, enum: ["direct", "group"], required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    groupName: String,
    admin: { type: Schema.Types.ObjectId, ref: "User" },
    lastMessage: {
        text: String,
        sender: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: Date,
    },
},
{ timestamps: true });

module.exports = model("Conversation", conversationSchema);