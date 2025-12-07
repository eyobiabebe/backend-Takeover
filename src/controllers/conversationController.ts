import { Request, Response } from "express";
import { Conversation } from "../models/Conversation";
import { User } from "../models/User";
import { Op } from "sequelize";
import { Listing } from "../models/Listing";
import { Takeoverattempts } from "../models/Takeoverattempts";

/**
 * Create or retrieve a conversation between current user and another user for a listing
 */
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const { listingId, senderId, receiverId } = req.body;

    if (!listingId || !senderId || !receiverId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    let conversationsWithListing = {};

    let conversation = await Conversation.findOne({
      where: {
        listingId,
        participant1Id: senderId,
        participant2Id: receiverId,
      },
      include: [
        { model: User, as: "participant1", attributes: ["id", "name", "email"] },
        { model: User, as: "participant2", attributes: ["id", "name", "email"] },
      ],
    });

    if (!conversation) {
      conversation = await Conversation.findOne({
        where: {
          listingId,
          participant1Id: receiverId,
          participant2Id: senderId,
        },
        include: [
          { model: User, as: "participant1", attributes: ["id", "name", "email"] },
          { model: User, as: "participant2", attributes: ["id", "name", "email"] },
        ],
      });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        listingId,
        participant1Id: senderId,
        participant2Id: receiverId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await Takeoverattempts.create({ userId: senderId, listingId: listingId });

      conversation = await Conversation.findByPk(conversation.id, {
        include: [
          { model: User, as: "participant1", attributes: ["id", "name", "email"] },
          { model: User, as: "participant2", attributes: ["id", "name", "email"] },
        ],
      });
    }

    const listing = await Listing.findByPk(conversation?.listingId);

    conversationsWithListing = {
      id: conversation?.id,
      listing: { id: listing?.id, title: listing?.title, userId: listing?.userId },
      participant1: { id: conversation?.participant1?.id, name: conversation?.participant1?.name },
      participant2: { id: conversation?.participant2?.id, name: conversation?.participant2?.name },
    }

    return res.status(200).json(conversationsWithListing);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all conversations for the current user
 */
export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.body.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: [
        { model: User, as: "participant1", attributes: ["id", "name", "email"] },
        { model: User, as: "participant2", attributes: ["id", "name", "email"] },
      ],
      order: [["updatedAt", "DESC"]],
    });

    const getListingInfo = async (conversation: Conversation) => {
      const listing = await Listing.findByPk(conversation.listingId);

      return { id: listing?.id, title: listing?.title, userId: listing?.userId };
    }

    const conversationsWithListing = await Promise.all(conversations.map(async conversation => ({
      id: conversation.id,
      listing: { id: (await getListingInfo(conversation)).id, title: (await getListingInfo(conversation)).title, userId: (await getListingInfo(conversation)).userId },
      participant1: { id: conversation.participant1?.id, name: conversation.participant1?.name },
      participant2: { id: conversation.participant2?.id, name: conversation.participant2?.name },
    })))

    return res.status(200).json(conversationsWithListing);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
