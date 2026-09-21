const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");
const socketAuth = require("./socketAuth.middleware");
const registerMessageHandlers = require("./handlers/message.handler");
const registerPresenceHandlers = require("./handlers/presence.handler");
const registerTypingHandlers = require("./handlers/typing.handler");


async function initSocket(httpServer) {
  const io = new Server(httpServer, { cors: { origin: "*" } });

  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.connect(), subClient.connect()]);
  io.adapter(createAdapter(pubClient, subClient));

  io.use(socketAuth); // verifies JWT from handshake.auth.token

  io.on("connection", (socket) => {
    registerPresenceHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerTypingHandlers(io, socket);

    socket.on("disconnect", () => {
      // update presence in redis, notify contacts
    });
  });

  return io;
}

module.exports = initSocket;