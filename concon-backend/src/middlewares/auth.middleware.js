const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const ApiError = require("../utils/apiError");

function authenticate(req, res, next) {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

    if (!token) return next(new ApiError(401, "Not authenticated"));

    try {
        const payload = jwt.verify(token, jwtSecret);
        req.userId = payload.sub;
        next();
    } catch {
        next(new ApiError(401, "Invalid or expired token"));
    }
}

module.exports = authenticate;