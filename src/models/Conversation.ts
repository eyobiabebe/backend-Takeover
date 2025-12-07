import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from './User';

interface ConversationAttributes {
  id: number;
  listingId: number;
  participant1Id: number;
  participant2Id: number;
  createdAt: Date;
  updatedAt: Date;
}

type ConversationCreationAttributes = Optional<ConversationAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  public id!: number;
  public listingId!: number;
  public participant1Id!: number;
  public participant2Id!: number;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Optional associations
  public participant1?: User;
  public participant2?: User;
}

export const initConversationModel = (sequelize: Sequelize) => {
  Conversation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      listingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'listing_id',
      },
      participant1Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'participant_1_id',
      },
      participant2Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'participant_2_id',
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
      modelName: 'Conversation',
      tableName: 'conversations',
      underscored: true,
      timestamps: false,
    }
  );
};
