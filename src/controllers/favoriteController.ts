// src/controllers/favoriteController.ts
import { Request, Response } from "express";
import { Favorite} from "../models/Favorite";
import { Listing} from "../models/Listing";

export const toggleFavorite = async (req: Request, res: Response) => {
  const { listingId, userId } = req.body;
  console.log("Received:", userId, listingId);

  if (!userId || !listingId)
    return res.status(400).json({ message: "Missing userId or listingId" });

  try {
    const existing = await Favorite.findOne({ where: { userId, listingId } });

    if (existing) {
      await existing.destroy();
      return res.json({ message: "Removed from favorites", favorited: false });
    }

    await Favorite.create({ userId, listingId });
    return res.json({ message: "Added to favorites", favorited: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserFavorites = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  try {
    const favorites = await Favorite.findAll({
      where: { userId },
      include: [Listing], // include the related listing
    });

    res.json(favorites);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ message: "Server error" });
  }
};