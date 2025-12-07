// src/models/Favorite.ts
import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export interface FavoriteAttributes {
  id: number;
  userId: number;
  listingId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type FavoriteCreationAttributes = Optional<FavoriteAttributes, "id" | "createdAt" | "updatedAt">;

export class Favorite
  extends Model<FavoriteAttributes, FavoriteCreationAttributes>
  implements FavoriteAttributes
{
  public id!: number;
  public userId!: number;
  public listingId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initFavoriteModel = (sequelize: Sequelize) => {
  Favorite.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      listingId: { type: DataTypes.INTEGER, allowNull: false },
    },
    { sequelize, modelName: "Favorite", tableName: "favorites", underscored: true }
  );
};
