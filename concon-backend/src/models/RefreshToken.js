const { Schema, model } = require("mongoose");

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenMash: { type: String, required: true, unique: true }, // sha256, never the raw token
    userAgent: String,
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Auto-delete expired tokens from the collection
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = model("RefreshToken", refreshTokenSchema);