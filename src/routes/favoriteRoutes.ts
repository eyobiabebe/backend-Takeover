// src/routes/favoriteRoutes.ts
import express from "express";
import { toggleFavorite, getUserFavorites } from "../controllers/favoriteController";
import { authMiddleware } from "../middleware/authMiddlware";

const router = express.Router();

// Add/remove favorite
router.post("/",authMiddleware, toggleFavorite);

// Get all favorites of a user
router.get("/:userId",authMiddleware, getUserFavorites);

export default router;
