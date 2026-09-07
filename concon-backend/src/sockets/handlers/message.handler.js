const Message = require("../../models/Message");

module.exports = function registerMessageHandlers(io, socket) {
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("sendMessage", async ({ conversationId, content, contentType }, ack) => {
    const message = await Message.create({
      conversationId,
      sender: socket.userId,
      content,
      contentType,
    });

    io.to(conversationId).emit("newMessage", message);
    ack?.({ status: "ok", messageId: message._id });
  });
};