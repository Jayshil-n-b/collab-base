import { io } from "socket.io-client";

const socketInit = () => {
  const options = {
    "force new connection": true,
    reconnectionAttempt: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };
  return io("http://localhost:5501", options);
};

export default socketInit;
