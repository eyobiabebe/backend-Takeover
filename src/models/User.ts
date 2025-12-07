// src/models/User.ts
import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string | null;
  emailVerified: boolean;
  emailVerificationToken: string | null;   // ✅ Added to interface
  image?: string | null;
  provider?: string | null;
  providerId?: string | null;
  googleSub?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

// Fields that can be null when creating a user
type UserCreationAttributes = Optional<
  UserAttributes,
  | 'id'
  | 'password'
  | 'image'
  | 'provider'
  | 'providerId'
  | 'googleSub'
  | 'passwordResetToken'
  | 'passwordResetExpires'
  | 'emailVerificationToken'     // ✅ Added here
  | 'createdAt'
  | 'updatedAt'
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string | null;
  public emailVerified!: boolean;
  public emailVerificationToken!: string | null;
  public image?: string | null;
  public provider?: string | null;
  public providerId?: string | null;
  public googleSub?: string | null;
  public passwordResetToken?: string | null;
  public passwordResetExpires?: number | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

export const initUserModel = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // social login allowed
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true, // used until user verifies email
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      providerId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      googleSub: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
      },
      passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passwordResetExpires: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
    }
  );
};
