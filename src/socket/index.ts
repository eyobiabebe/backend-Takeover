import { Server } from "socket.io";
import type { Server as HttpServer } from "http";

let io: Server | null = null;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    // Client should send their userId once connected
    socket.on("register", (userId: string) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => { /* noop */ });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
