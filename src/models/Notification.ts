// src/models/Notification.ts
import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface NotificationAttributes {
  id: number;
  userId: number;
  type: "takeover_applied" | "draft_listing" | "takeover_accepted" | "takeover_rejected" | "listing_created";
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  "id" | "isRead" | "createdAt" | "updatedAt"
>;

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  public id!: number;
  public userId!: number;
  public type!: "takeover_applied" | "draft_listing" | "takeover_accepted" | "takeover_rejected"| "listing_created";
  public title!: string;
  public message!: string;
  public isRead!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initNotificationModel = (sequelize: Sequelize) => {
  Notification.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      type: {
        type: DataTypes.ENUM(
          "takeover_applied",
          "draft_listing",
          "takeover_accepted",
          "takeover_rejected",
          "listing_created" 
        ),
        allowNull: false,
      },
      title: { type: DataTypes.STRING, allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    { sequelize, modelName: "Notification", tableName: "notifications", underscored: true }
  );
};
