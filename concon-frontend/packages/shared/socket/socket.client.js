import { io } from "socket.io-client";
import { getAccessToken } from "../utils/tokenStorage";

let socket = null;

export function connectSocket() {
  if (socket?.connected) return socket;

  socket = io(process.env.SOCKET_URL || "http://localhost:5000", {
    auth: { token: getAccessToken() },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket connection error:", err.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}