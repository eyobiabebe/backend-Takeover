// src/models/Listing.ts
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface ListingAttributes {
  id: number;
  userId: number;
  title: string;
  description?: string;
  type: 'apartment' | 'car';
  monthlyPrice: number;
  lat: number;
  lng: number;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  incentive?: number;
  images: Record<string, string[]>; // Sectioned images

  // Car-specific fields
  currentMiles?: number;
  remainingMiles?: number;
  milesPerMonth?: number;
  saleId?: string;
  vin_no?: string;
  leasingCompany?: { name: string | null; email: string | null };

  // Apartment-specific fields
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  landlordInfo: { name: string | null; email: string | null; phone: string | null };

  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type ListingCreationAttributes = Optional<
  ListingAttributes,
  | 'id'
  | 'description'
  | 'startDate'
  | 'endDate'
  | 'incentive'
  | 'images'
  | 'currentMiles'
  | 'remainingMiles'
  | 'milesPerMonth'
  | 'saleId'
  | 'vin_no'
  | 'leasingCompany'
  | 'bedrooms'
  | 'bathrooms'
  | 'sqft'
  | 'status'
  | 'createdAt'
  | 'updatedAt'
>;

export class Listing
  extends Model<ListingAttributes, ListingCreationAttributes>
  implements ListingAttributes
{
  public id!: number;
  public userId!: number;
  public title!: string;
  public description?: string;
  public type!: 'apartment' | 'car';
  public monthlyPrice!: number;
  public lat!: number;
  public lng!: number;
  public location?: string;
  public startDate!: Date;
  public endDate?: Date;
  public incentive?: number;
  public images!: Record<string, string[]>; // Sectioned images

  // Car fields
  public currentMiles?: number;
  public remainingMiles?: number;
  public milesPerMonth?: number;
  public saleId?: string;
  public vin_no?: string;
  public leasingCompany?: { name: string | null; email: string | null };

  // Apartment fields
  public bedrooms?: number;
  public bathrooms?: number;
  public sqft?: number;
  public landlordInfo!: { name: string | null; email: string | null; phone: string | null };

  public status?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initListingModel = (sequelize: Sequelize) => {
  Listing.init(
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
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.TEXT,
      type: {
        type: DataTypes.ENUM('apartment', 'car'),
        allowNull: false,
      },
      monthlyPrice: { 
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      lat: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      lng: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      incentive: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      images: {
        type: DataTypes.JSONB,
        defaultValue: {},

      },
      status: {
        type: DataTypes.ENUM('draft', 'active', 'completed', 'archived'),
        allowNull: true,
        defaultValue: 'draft',
      },

      // Car-specific
      saleId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vin_no: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      currentMiles: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      remainingMiles: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      milesPerMonth: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      leasingCompany: {
        type: DataTypes.JSONB,
        defaultValue: { name: null, email: null },
      },

      // Apartment-specific
      bedrooms: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      bathrooms: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sqft: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      landlordInfo: {
        type: DataTypes.JSONB,
        defaultValue: { name: null, email: null, phone: null },
      },
    },
    {
      sequelize,
      modelName: 'Listing',
      tableName: 'listings',
      timestamps: true, // adds createdAt & updatedAt
    }
  );
}; 
