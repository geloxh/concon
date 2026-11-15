const { Schema, model } = require("mongoose");

const userSchema = new Schema ({
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false }, // never returned unless explicitly selected
    avatar: String,
    status: { type: String, enum: ["online", "offline"], default: "offline" },
    lastSeen: Date,
},
{ timestamps: true });

module.exports = model("User", userSchema);