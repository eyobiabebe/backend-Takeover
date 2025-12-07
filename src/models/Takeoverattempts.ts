// src/models/Listing.ts
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface ListingAttributes {
  id: number;
  userId: number;
  listingId: number;// amount seller offers to take over lease
  status?: string;
  paymentData?: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type TakeoverattemptsAttributes = Optional<
  ListingAttributes,
  | 'id'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
>;

export class Takeoverattempts
  extends Model<ListingAttributes, TakeoverattemptsAttributes>
  implements ListingAttributes
{
  public id!: number;
  public userId!: number;
  public listingId!: number;
  public status?: string | undefined;
  public paymentData?: Record<string, any> | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initTakeoverattemptsModel = (sequelize: Sequelize) => {
  Takeoverattempts.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      listingId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('talking', 'proceeding', 'accepted', 'rejected', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'talking',
      },
      paymentData: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    
    {
      sequelize,
      modelName: 'Takeoverattempts',
      tableName: 'takeoverattempts',
      timestamps: true,  
    }
  );
};
