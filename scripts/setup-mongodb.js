// ============================================================================
// MONGODB SETUP SCRIPT - Development Environment
// ============================================================================

const { MongoClient } = require('mongodb');

async function setupMongoDB() {
  console.log('🔧 Setting up MongoDB for PRISM development...');
  
  // Default development connection (no auth)
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.MONGODB_DB || 'prism';
  
  try {
    // Connect without authentication first
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db(dbName);
    const adminDb = client.db('admin');
    
    // Create admin user if it doesn't exist
    try {
      const adminUser = {
        user: "prismAdmin",
        pwd: "prismDev2025",
        roles: [
          { role: "userAdminAnyDatabase", db: "admin" },
          { role: "dbAdminAnyDatabase", db: "admin" },
          { role: "readWriteAnyDatabase", db: "admin" },
          { role: "clusterAdmin", db: "admin" }
        ]
      };
      
      await adminDb.command({ createUser: adminUser.user, pwd: adminUser.pwd, roles: adminUser.roles });
      console.log('✅ Admin user created successfully');
    } catch (error) {
      if (error.code === 51003) {
        console.log('ℹ️  Admin user already exists');
      } else {
        console.log('⚠️  Admin user creation failed:', error.message);
      }
    }
    
    // Create application user for PRISM
    try {
      const appUser = {
        user: "prismApp",
        pwd: "prismApp2025",
        roles: [
          { role: "readWrite", db: dbName },
          { role: "dbAdmin", db: dbName }
        ]
      };
      
      await db.command({ createUser: appUser.user, pwd: appUser.pwd, roles: appUser.roles });
      console.log('✅ Application user created successfully');
    } catch (error) {
      if (error.code === 51003) {
        console.log('ℹ️  Application user already exists');
      } else {
        console.log('⚠️  Application user creation failed:', error.message);
      }
    }
    
    // Create collections and indexes
    console.log('🗂️  Creating collections and indexes...');
    
    // Users collection
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await usersCollection.createIndex({ role: 1 });
    await usersCollection.createIndex({ isCreator: 1 });
    await usersCollection.createIndex({ createdAt: -1 });
    console.log('✅ Users collection indexes created');
    
    // Content collection
    const contentCollection = db.collection('content');
    await contentCollection.createIndex({ creatorId: 1 });
    await contentCollection.createIndex({ status: 1 });
    await contentCollection.createIndex({ category: 1 });
    await contentCollection.createIndex({ tags: 1 });
    await contentCollection.createIndex({ createdAt: -1 });
    await contentCollection.createIndex({ views: -1 });
    console.log('✅ Content collection indexes created');
    
    // Advanced Media collection
    const advancedMediaCollection = db.collection('advancedMedia');
    await advancedMediaCollection.createIndex({ creatorId: 1 });
    await advancedMediaCollection.createIndex({ type: 1 });
    await advancedMediaCollection.createIndex({ status: 1 });
    await advancedMediaCollection.createIndex({ 'metadata.duration': 1 });
    await advancedMediaCollection.createIndex({ 'analytics.views': -1 });
    await advancedMediaCollection.createIndex({ createdAt: -1 });
    console.log('✅ Advanced Media collection indexes created');
    
    // Comments collection
    const commentsCollection = db.collection('comments');
    await commentsCollection.createIndex({ contentId: 1 });
    await commentsCollection.createIndex({ userId: 1 });
    await commentsCollection.createIndex({ parentId: 1 });
    await commentsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Comments collection indexes created');
    
    // Likes collection
    const likesCollection = db.collection('likes');
    await likesCollection.createIndex({ contentId: 1, userId: 1 }, { unique: true });
    await likesCollection.createIndex({ userId: 1 });
    await likesCollection.createIndex({ createdAt: -1 });
    console.log('✅ Likes collection indexes created');
    
    // Direct Messages collection
    const messagesCollection = db.collection('directMessages');
    await messagesCollection.createIndex({ conversationId: 1 });
    await messagesCollection.createIndex({ senderId: 1 });
    await messagesCollection.createIndex({ receiverId: 1 });
    await messagesCollection.createIndex({ createdAt: -1 });
    console.log('✅ Direct Messages collection indexes created');
    
    // Social Relationships collection
    const relationshipsCollection = db.collection('socialRelationships');
    await relationshipsCollection.createIndex({ userId: 1, relationshipType: 1 });
    await relationshipsCollection.createIndex({ targetUserId: 1, relationshipType: 1 });
    await relationshipsCollection.createIndex({ strength: -1 });
    await relationshipsCollection.createIndex({ lastInteraction: -1 });
    console.log('✅ Social Relationships collection indexes created');
    
    // Creator Tips collection
    const tipsCollection = db.collection('creatorTips');
    await tipsCollection.createIndex({ fanId: 1 });
    await tipsCollection.createIndex({ creatorId: 1 });
    await tipsCollection.createIndex({ amount: -1 });
    await tipsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Creator Tips collection indexes created');
    
    // Fan Club Memberships collection
    const membershipsCollection = db.collection('fanClubMemberships');
    await membershipsCollection.createIndex({ fanId: 1 });
    await membershipsCollection.createIndex({ creatorId: 1 });
    await membershipsCollection.createIndex({ tier: 1 });
    await membershipsCollection.createIndex({ status: 1 });
    await membershipsCollection.createIndex({ joinedAt: -1 });
    console.log('✅ Fan Club Memberships collection indexes created');
    
    // User Influence collection
    const influenceCollection = db.collection('userInfluence');
    await influenceCollection.createIndex({ userId: 1 }, { unique: true });
    await influenceCollection.createIndex({ overallScore: -1 });
    await influenceCollection.createIndex({ category: 1, score: -1 });
    console.log('✅ User Influence collection indexes created');
    
    // Community Clusters collection
    const clustersCollection = db.collection('communityClusters');
    await clustersCollection.createIndex({ members: 1 });
    await clustersCollection.createIndex({ category: 1, size: -1 });
    console.log('✅ Community Clusters collection indexes created');
    
    // Follows collection
    const followsCollection = db.collection('follows');
    await followsCollection.createIndex({ followerId: 1 });
    await followsCollection.createIndex({ followingId: 1 });
    await followsCollection.createIndex({ followerId: 1, followingId: 1 }, { unique: true });
    await followsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Follows collection indexes created');
    
    // Content Interactions collection
    const interactionsCollection = db.collection('contentInteractions');
    await interactionsCollection.createIndex({ userId: 1, contentId: 1 });
    await interactionsCollection.createIndex({ contentId: 1, interactionType: 1 });
    await interactionsCollection.createIndex({ createdAt: -1 });
    console.log('✅ Content Interactions collection indexes created');
    
    await client.close();
    
    console.log('\n🎉 MongoDB setup completed successfully!');
    console.log('\n📋 Database Configuration:');
    console.log(`   Database: ${dbName}`);
    console.log(`   Connection URI: ${uri}`);
    console.log('\n👤 User Accounts Created:');
    console.log('   Admin User: prismAdmin / prismDev2025');
    console.log('   App User: prismApp / prismApp2025');
    console.log('\n🔧 Environment Variables:');
    console.log(`   MONGODB_URI=${uri}`);
    console.log(`   MONGODB_DB=${dbName}`);
    console.log('   MONGODB_USER=prismApp');
    console.log('   MONGODB_PASSWORD=prismApp2025');
    
  } catch (error) {
    console.error('❌ MongoDB setup failed:', error);
    throw error;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupMongoDB()
    .then(() => {
      console.log('\n✅ Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { setupMongoDB };
