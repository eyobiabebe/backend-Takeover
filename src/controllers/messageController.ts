import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { User } from "../models/User";
import { Op } from "sequelize";
import { emitMessage } from "../socket";

// Utility to find the receiver in a conversation
function getReceiverId(conversation: any, senderId: string) {
  return conversation.participant1Id === senderId
    ? conversation.participant2Id
    : conversation.participant1Id;
}


export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.body?.id;

    if (!conversationId || !content) {
      return res.status(400).json({ error: "Missing conversationId or content." });
    }

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) return res.status(404).json({ error: "Conversation not found." });

    if (conversation.participant1Id !== senderId && conversation.participant2Id !== senderId) {
      return res.status(403).json({ error: "You are not a participant in this conversation." });
    }

    // Save message to DB
    const message = await Message.create({
      conversationId,
      senderId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const sender = await User.findByPk(senderId, { attributes: ["id", "name"] });

    const messageWithSender = {
      ...message.toJSON(),
      sender: { id: sender?.id, name: sender?.name },
      conversationId,
    };

    // Emit message to conversation room via socket
    emitMessage(conversationId, messageWithSender);

    const receiverId = getReceiverId(conversation, senderId);

    return res.status(201).json({ message: messageWithSender, receiverId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

  /**
   * Get all messages for a conversation (only accessible by participants)
   */
export const  getMessagesForConversation = async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const userId = req.body.id;

      if (!conversationId) {
        return res.status(400).json({ error: "conversationId parameter is required." });
      }

      const conversation = await Conversation.findByPk(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found." });
      }

      if (
        conversation.participant1Id !== userId &&
        conversation.participant2Id !== userId
      ) {
        return res.status(403).json({ error: "You are not authorized to view these messages." });
      }

      const messages = await Message.findAll({
        where: { conversationId },
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      return res.status(200).json({ messages });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

  /**
   * Get all conversations for a user (with last message and participants)
   */
export const getConversationsForUser = async (req: Request, res: Response) => {
    try {
      const userId = req.params.user_id || req.body.id;

      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [
            { participant1Id: userId },
            { participant2Id: userId },
          ],
        },
        include: [
          {
            model: Message,
            limit: 1,
            order: [["createdAt", "DESC"]],
            separate: true,
            include: [
              {
                model: User,
                as: "sender",
                attributes: ["id", "name"],
              },
            ],
          },
          {
            model: User,
            as: "participant1",
            attributes: ["id", "name"],
          },
          {
            model: User,
            as: "participant2",
            attributes: ["id", "name"],
          },
        ],
        order: [["updatedAt", "DESC"]],
      });

      return res.status(200).json({ conversations });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error." });
    }
  };

