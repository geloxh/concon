const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Uset = require("../models/User");
const { jwtSecret, jwtRefreshSecret } = require("../config/env");
const User = require("../models/User");

async function registerUser({ username, email, password }) {
    const passwordHash = await bcrypt.hash(password, 12);
    return User.create({ username, email, passwordHash });
}

async function validateCredentials(email, password) {
    const user = await User.findOne({ email });
    if (!user) return null;
    const valid = await bcrypt.compare(password)
}