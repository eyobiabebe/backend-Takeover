// src/socket.ts
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { Message } from "./models/Message";
import { User } from "./models/User";
import { Conversation } from "./models/Conversation";

let io: Server | undefined;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "http://localhost:19006"], // update with your frontend origins
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    // Join a conversation room
    socket.on("joinRoom", (conversationId: number | string) => {
      const room = conversationId.toString();
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // sendMessage event: server saves the message and broadcasts it to the room
    socket.on(
      "sendMessage",
      async (data: { conversationId: number; senderId: number; content: string }) => {
        try {
          const { conversationId, senderId, content } = data;

          // Optional: validate conversation and participants
          const conversation = await Conversation.findByPk(conversationId);
          if (!conversation) {
            console.warn("sendMessage: conversation not found", conversationId);
            return;
          }

          // Save to DB
          const message = await Message.create({
            conversationId,
            senderId,
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Attach sender info
          const sender = await User.findByPk(senderId, { attributes: ["id", "name", "email"] });

          const messageWithSender = {
            ...message.toJSON(),
            sender: { id: sender?.id, name: sender?.name },
          };

          // Emit to everyone in the conversation room
          io?.to(conversationId.toString()).emit("receiveMessage", messageWithSender);
        } catch (err) {
          console.error("Socket sendMessage error:", err);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

// Optional helper to emit programmatically from controllers/services
export const emitMessage = (conversationId: number | string, message: any) => {
  if (!io) throw new Error("Socket.io not initialized");
  io.to(conversationId.toString()).emit("receiveMessage", message);
};
