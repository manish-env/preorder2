import { MongoClient } from 'mongodb';

// MongoDB connection
let client = null;
let db = null;

export async function initializeDatabase(env) {
  try {
    console.log('Initializing MongoDB connection...');
    
    if (!client) {
      const mongoUri = 'mongodb+srv://next2mexyz_db_user:3THcLF4vEtKV4UZo@cluster0.yxugfxh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
      client = new MongoClient(mongoUri);
      await client.connect();
      db = client.db('preorder_db');
      console.log('MongoDB connected successfully');
    }

    // Create indexes for better performance
    console.log('Creating MongoDB indexes...');
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: 1 });
    
    // Sessions collection indexes
    await db.collection('user_sessions').createIndex({ sessionId: 1 }, { unique: true });
    await db.collection('user_sessions').createIndex({ expiresAt: 1 });
    await db.collection('user_sessions').createIndex({ userId: 1 });
    
    // Stores collection indexes
    await db.collection('stores').createIndex({ storeUrl: 1 }, { unique: true });
    await db.collection('stores').createIndex({ userId: 1 });
    
    // Preorder settings collection indexes
    await db.collection('preorder_settings').createIndex({ userId: 1 });
    await db.collection('preorder_settings').createIndex({ storeUrl: 1 });
    await db.collection('preorder_settings').createIndex({ productHandle: 1 });
    
    console.log('MongoDB indexes created successfully');
    return true;
  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    return false;
  }
}

export function getDatabase() {
  return db;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
