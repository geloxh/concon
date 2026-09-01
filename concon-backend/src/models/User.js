const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    passwordMatch: { type: String, required: true },
    avatar: String,
    status: { type: String, default: "offline" },
    lastSeen: Date,
},
{ timestamps: true });

module.exports = model("User", userSchema);