// src/controllers/notificationController.ts
import { Request, Response } from "express";
import { Notification } from '../models/Notification';
import { Op } from "sequelize";

// Get all notifications for a user
export const getUserNotifications = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    // Convert each notification to a plain object
    const plainNotifications = notifications.map(n => n.toJSON());


    res.json(plainNotifications);
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark a notification as read
export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ error: "Notification not found" });

    
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err);
    console.log("read error");
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// Create a new notification
export const createNotification = async (userId: number, type: string, title: string, message: string) => {
  try {
    const notification = await Notification.create({
      userId,
      type: type as any,
      title,
      message,
      isRead: false,
    });
    return notification;
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
};

// ✅ Mark ALL notifications as read for a user
export const markAllAsRead = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};

// ✅ Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = await Notification.destroy({ where: { id } });
    if (!deleted)
      return res.status(404).json({ error: "Notification not found" });
    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};
