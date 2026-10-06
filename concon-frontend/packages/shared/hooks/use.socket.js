import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { connectSocket, disconnectSocket } from "../socket/socketClient";
import { messageReceived, messageStatusUpdated } from "../store/messageSlice";

export function useSocket() {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = connectSocket();

    socket.on("newMessage", (message) => dispatch(messageReceived(message)));
    socket.on("messageStatusUpdate", (payload) => dispatch(messageStatusUpdated(payload)));

    return () => {
      socket.off("newMessage");
      socket.off("messageStatusUpdate");
      disconnectSocket();
    };
  }, [dispatch]);
}