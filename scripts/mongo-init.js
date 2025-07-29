// ============================================================================
// MONGODB INITIALIZATION SCRIPT - Docker Setup
// ============================================================================

// Switch to the prism database
db = db.getSiblingDB('prism');

// Create application user with necessary permissions
db.createUser({
  user: 'prismApp',
  pwd: 'prismApp2025',
  roles: [
    {
      role: 'readWrite',
      db: 'prism'
    },
    {
      role: 'dbAdmin',
      db: 'prism'
    }
  ]
});

print('✅ Created prismApp user');

// Create collections and indexes
print('🗂️ Creating collections and indexes...');

// Users collection
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isCreator: 1 });
db.users.createIndex({ createdAt: -1 });
print('✅ Users collection created with indexes');

// Content collection
db.createCollection('content');
db.content.createIndex({ creatorId: 1 });
db.content.createIndex({ status: 1 });
db.content.createIndex({ category: 1 });
db.content.createIndex({ tags: 1 });
db.content.createIndex({ createdAt: -1 });
db.content.createIndex({ views: -1 });
print('✅ Content collection created with indexes');

// Advanced Media collection
db.createCollection('advancedMedia');
db.advancedMedia.createIndex({ creatorId: 1 });
db.advancedMedia.createIndex({ type: 1 });
db.advancedMedia.createIndex({ status: 1 });
db.advancedMedia.createIndex({ 'metadata.duration': 1 });
db.advancedMedia.createIndex({ 'analytics.views': -1 });
db.advancedMedia.createIndex({ createdAt: -1 });
print('✅ Advanced Media collection created with indexes');

// Comments collection
db.createCollection('comments');
db.comments.createIndex({ contentId: 1 });
db.comments.createIndex({ userId: 1 });
db.comments.createIndex({ parentId: 1 });
db.comments.createIndex({ createdAt: -1 });
print('✅ Comments collection created with indexes');

// Likes collection
db.createCollection('likes');
db.likes.createIndex({ contentId: 1, userId: 1 }, { unique: true });
db.likes.createIndex({ userId: 1 });
db.likes.createIndex({ createdAt: -1 });
print('✅ Likes collection created with indexes');

// Direct Messages collection
db.createCollection('directMessages');
db.directMessages.createIndex({ conversationId: 1 });
db.directMessages.createIndex({ senderId: 1 });
db.directMessages.createIndex({ receiverId: 1 });
db.directMessages.createIndex({ createdAt: -1 });
print('✅ Direct Messages collection created with indexes');

// Social Relationships collection
db.createCollection('socialRelationships');
db.socialRelationships.createIndex({ userId: 1, relationshipType: 1 });
db.socialRelationships.createIndex({ targetUserId: 1, relationshipType: 1 });
db.socialRelationships.createIndex({ strength: -1 });
db.socialRelationships.createIndex({ lastInteraction: -1 });
print('✅ Social Relationships collection created with indexes');

// Creator Tips collection
db.createCollection('creatorTips');
db.creatorTips.createIndex({ fanId: 1 });
db.creatorTips.createIndex({ creatorId: 1 });
db.creatorTips.createIndex({ amount: -1 });
db.creatorTips.createIndex({ createdAt: -1 });
print('✅ Creator Tips collection created with indexes');

// Fan Club Memberships collection
db.createCollection('fanClubMemberships');
db.fanClubMemberships.createIndex({ fanId: 1 });
db.fanClubMemberships.createIndex({ creatorId: 1 });
db.fanClubMemberships.createIndex({ tier: 1 });
db.fanClubMemberships.createIndex({ status: 1 });
db.fanClubMemberships.createIndex({ joinedAt: -1 });
print('✅ Fan Club Memberships collection created with indexes');

// User Influence collection
db.createCollection('userInfluence');
db.userInfluence.createIndex({ userId: 1 }, { unique: true });
db.userInfluence.createIndex({ overallScore: -1 });
db.userInfluence.createIndex({ category: 1, score: -1 });
print('✅ User Influence collection created with indexes');

// Community Clusters collection
db.createCollection('communityClusters');
db.communityClusters.createIndex({ members: 1 });
db.communityClusters.createIndex({ category: 1, size: -1 });
print('✅ Community Clusters collection created with indexes');

// Follows collection
db.createCollection('follows');
db.follows.createIndex({ followerId: 1 });
db.follows.createIndex({ followingId: 1 });
db.follows.createIndex({ followerId: 1, followingId: 1 }, { unique: true });
db.follows.createIndex({ createdAt: -1 });
print('✅ Follows collection created with indexes');

// Content Interactions collection
db.createCollection('contentInteractions');
db.contentInteractions.createIndex({ userId: 1, contentId: 1 });
db.contentInteractions.createIndex({ contentId: 1, interactionType: 1 });
db.contentInteractions.createIndex({ createdAt: -1 });
print('✅ Content Interactions collection created with indexes');

print('🎉 MongoDB initialization completed successfully!');
print('📋 Database Configuration:');
print('   Database: prism');
print('   User: prismApp');
print('   Password: prismApp2025');
print('   Collections: ' + db.getCollectionNames().length + ' created');
