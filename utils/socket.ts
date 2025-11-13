import { io } from "socket.io-client";

export const socket = io("http://172.20.10.3:3000", {
  transports: ["websocket"]
})