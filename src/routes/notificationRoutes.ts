// src/routes/notificationRoutes.ts
import { Router } from "express";
import { getUserNotifications, markAsRead ,markAllAsRead, deleteNotification,} from "../controllers/notificationController";
import { authMiddleware } from "../middleware/authMiddlware";

const router = Router();

// Get all notifications for a user
router.get("/:userId",authMiddleware, getUserNotifications);

// Mark a notification as read
router.patch("/read/:id", authMiddleware ,markAsRead);

router.put("/:userId/read-all",authMiddleware, markAllAsRead);
router.delete("/:id", authMiddleware,deleteNotification);

export default router;
