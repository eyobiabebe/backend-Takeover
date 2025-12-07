import { Notification } from "../models/Notification";
import { getIO } from "../socket/index";

type CreateNotificationArgs = {
  recipientId: number;
  type: "takeover_applied" | "draft_listing" | "takeover_accepted" | "takeover_rejected" | "listing_created";
  title: string;
  message: string;
  data?: Record<string, any>;
};


export async function pushNotification(args: CreateNotificationArgs) {
  const notif = await Notification.create({
    userId: args.recipientId,
    type: args.type,
    title: args.title,
    message: args.message,
    isRead: false,
  });

  try {
    getIO().to(`user:${args.recipientId}`).emit("notification", notif.toJSON());
  } catch (e) {
    // Socket not ready, DB is still persisted
  }

  return notif;
}
