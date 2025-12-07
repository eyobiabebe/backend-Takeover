// src/models/index.ts
import sequelize from '../config/database';
import { User, initUserModel } from './User';
import { Listing, initListingModel } from './Listing';
import { Message, initMessageModel } from './Message';
import { Conversation, initConversationModel } from './Conversation';
import { UserProfile, initUserProfileModel } from './UserProfile';
import { initTakeoverattemptsModel,Takeoverattempts } from './Takeoverattempts';
import {Notification , initNotificationModel} from './Notification';
import { Favorite, initFavoriteModel } from './Favorite';

// Initialize models with sequelize instance
initUserModel(sequelize);
initListingModel(sequelize);
initMessageModel(sequelize);
initConversationModel(sequelize);
initUserProfileModel(sequelize);
initTakeoverattemptsModel(sequelize);
initNotificationModel(sequelize);
initFavoriteModel(sequelize);

// Define associations
User.hasMany(Listing, { foreignKey: 'userId' });
Listing.belongsTo(User, { foreignKey: 'userId' });

Conversation.belongsTo(User, { foreignKey: 'participant1Id', as: 'participant1' });
Conversation.belongsTo(User, { foreignKey: 'participant2Id', as: 'participant2' });

User.hasMany(Conversation, { foreignKey: 'participant1Id', as: 'landlordConversations' });
User.hasMany(Conversation, { foreignKey: 'participant2Id', as: 'tenantConversations' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasOne(UserProfile, { foreignKey: 'userId' });
UserProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Takeoverattempts, { foreignKey: 'userId' });
Takeoverattempts.belongsTo(User, { foreignKey: 'userId' });

Listing.hasMany(Takeoverattempts, {foreignKey: 'listingId'});
Takeoverattempts.belongsTo(Listing, {foreignKey: 'listingId'});

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// New associations for Favorites
User.hasMany(Favorite, { foreignKey: 'userId' });
Favorite.belongsTo(User, { foreignKey: 'userId' });

Listing.hasMany(Favorite, { foreignKey: 'listingId' });
Favorite.belongsTo(Listing, { foreignKey: 'listingId' });



const db = {
  sequelize,
  User,
  Listing,
  Message,
  Conversation,
  UserProfile,
  Notification,
  Favorite,
};

export default db;
