// Debounce map so we don't spam "stopped typing" events on every keystroke
const typingTimeouts = new Map();

module.exports = function registerTypingHandlers(io, socket) {
  socket.on("typing", ({ conversationId }) => {
    socket.to(conversationId).emit("userTyping", {
      userId: socket.userId,
      conversationId,
    });

    const key = `${socket.userId}:${conversationId}`;
    clearTimeout(typingTimeouts.get(key));

    const timeout = setTimeout(() => {
      socket.to(conversationId).emit("userStoppedTyping", {
        userId: socket.userId,
        conversationId,
      });
      typingTimeouts.delete(key);
    }, 3000);

    typingTimeouts.set(key, timeout);
  });

  socket.on("stopTyping", ({ conversationId }) => {
    const key = `${socket.userId}:${conversationId}`;
    clearTimeout(typingTimeouts.get(key));
    typingTimeouts.delete(key);

    socket.to(conversationId).emit("userStoppedTyping", {
      userId: socket.userId,
      conversationId,
    });
  });
};