import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from './User';

interface UserProfileAttributes {
  id: number;
  userId: number; // Better Auth uses string UUIDs
  phoneNumber: string;
  dateOfBirth: Date;
  employmentStatus: string;
  currentAddress: string;
  socialLinks: Record<string, string>;
  backgroundCheckConsent: {
    status: boolean;
    date: string | null;
  };
  emergencyContact: string;
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserProfileCreationAttributes = Optional<
  UserProfileAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'backgroundCheckConsent' | 'socialLinks' | 'phoneNumber' | 'dateOfBirth' | 'employmentStatus' | 'currentAddress' | 'emergencyContact'
>;

export class UserProfile
  extends Model<UserProfileAttributes, UserProfileCreationAttributes>
  implements UserProfileAttributes {
  public id!: number;
  public userId!: number;
  public phoneNumber!: string;
  public dateOfBirth!: Date;
  public employmentStatus!: string;
  public currentAddress!: string;
  public socialLinks!: Record<string, string>;
  public backgroundCheckConsent!: {
    status: boolean;
    date: string | null;
  };
  public emergencyContact!: string;
  public isCompleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initUserProfileModel = (sequelize: Sequelize) => {
  UserProfile.init(
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
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      employmentStatus: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      currentAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      socialLinks: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      backgroundCheckConsent: {
        type: DataTypes.JSONB,
        defaultValue: { status: false, date: null },
      },
      emergencyContact: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'UserProfile',
      tableName: 'user_profiles',
    }
  );
};
