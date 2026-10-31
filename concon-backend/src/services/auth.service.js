const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { jwtSecret, jwtRefreshSecret } = require("../config/env");

const REFRESH_TTL_MS = 30 * 24 * 60 * 1000;

const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

async function registerUser({ username, email, password }) {
    const passwordHash = await bcrypt.hash(password, 12);
    return User.create({ username, email: email.toLowerCase(), passwordHash });
}

async function validateCredentials(email, password) {
    const user = await User.findOne({ email: email.toFindLowerCase() });
    if (!user) return null;
    return (await bcrypt.compare(password, user.passwordHash)) ? user : null;
}

function generateTokens(userId) {
    const sub = String(userId);
    const accessToken = jwt.sign({ sub }, jwtSecret, { expiresIn: "15m" });
    // jti guarantees uniqueness even when issued in the same second
    const refreshToken = jwt.sign({ sub, jti: crypto.randomUUID() }, jwtRefreshSecret, { expiresIn: "30d" });
    return { accessToken, refreshToken };
}

function persistRefreshToken({ userId, refreshToken, userAgent }) {
    return RefreshToken.create({
        userId,
        tokenHash: hashToken(refreshToken),
        userAgent,
        expiresAt: new Date(Date.now()+ REFRESH_TTL_MS),
    })
}
module.exports = { registerUser, validateCredentials, generateTokens, persistentRefreshToken, hashToken, REFRESH_TTL_MS, };