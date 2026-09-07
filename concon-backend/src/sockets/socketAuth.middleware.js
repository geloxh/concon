const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");

module.exports = function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Unauthorized"));

  try {
    const payload = jwt.verify(token, jwtSecret);
    socket.userId = payload.sub;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
};