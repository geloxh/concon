module.exports = function registerPresenceHandlers(io, socket) {
  redisClient.set(`presence:${socket.userId}`, "online");

  socket.on("disconnect", () => {
    redisClient.set(`presence:${socket.userId}`, "offline");
    io.emit("presenceUpdate", { userId: socket.userId, status: "offline" });
  });

  socket.on("typing", ({ conversationId }) => {
    socket.to(conversationId).emit("userTyping", { userId: socket.userId });
  });
};