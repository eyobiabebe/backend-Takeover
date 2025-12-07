import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from './User';

interface MessageAttributes {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

type MessageCreationAttributes = Optional<MessageAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public conversationId!: number;
  public senderId!: number;
  public content!: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Association
  public sender?: User;
}

export const initMessageModel = (sequelize: Sequelize) => {
  Message.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'conversation_id',
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'sender_id',
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'Message',
      tableName: 'messages',
      underscored: true,
      timestamps: false,
    }
  );
};
