import { MongoClient } from 'mongodb';

// Check for MongoDB URI with better error message
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  console.error('📝 Please create a .env.local file with your MongoDB connection string');
  console.error('🔗 Example: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI". Please check your .env.local file.');
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 5, // Reduced for production
  minPoolSize: 0, // Start with 0 for serverless
  maxIdleTimeMS: 30000, // 30 seconds
  serverSelectionTimeoutMS: 15000, // 15 seconds
  socketTimeoutMS: 30000, // 30 seconds
  connectTimeoutMS: 15000, // 15 seconds
  retryWrites: true,
  retryReads: true,
  w: 'majority' as const,
  heartbeatFrequencyMS: 10000, // 10 seconds
  serverApi: {
    version: '1' as const,
    strict: true,
    deprecationErrors: true,
  },
  monitorCommands: process.env.NODE_ENV === 'development',
  writeConcern: {
    w: 'majority' as const,
    j: true,
    wtimeout: 10000
  },
  // Simplified SSL configuration for production
  ssl: true,
  sslValidate: true,
  // Remove complex SSL options that might cause issues
  directConnection: false,
};

let client: MongoClient | undefined;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client for each request
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Add connection monitoring
if (client) {
  client.on('connected', () => {
    console.log('MongoDB client connected');
  });

  client.on('disconnected', () => {
    console.log('MongoDB client disconnected');
  });

  client.on('error', (error) => {
    console.error('MongoDB client error:', error);
  });

  client.on('timeout', () => {
    console.warn('MongoDB client timeout');
  });

  client.on('close', () => {
    console.log('MongoDB client connection closed');
  });

  client.on('reconnect', () => {
    console.log('MongoDB client reconnected');
  });
}

// Robust connection utility with improved retry logic
export async function getMongoClient(maxRetries = 3, retryDelay = 1000): Promise<MongoClient> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`MongoDB connection attempt ${attempt}/${maxRetries}...`);
      
      // Create a new client for each attempt
      const client = new MongoClient(uri, options);
      
      const connectedClient = await Promise.race([
        client.connect(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('MongoDB connection timeout')), 15000)
        )
      ]);
      
      // Test the connection with a ping
      await connectedClient.db().admin().ping();
      console.log(`MongoDB connection successful on attempt ${attempt}`);
      return connectedClient;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown connection error');
      console.warn(`MongoDB connection attempt ${attempt} failed:`, lastError.message);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retryDelay = Math.min(retryDelay * 2, 5000);
      }
    }
  }
  
  throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}

// Helper function to safely close connections
export async function closeMongoClient(client: MongoClient): Promise<void> {
  try {
    await client.close();
    console.log('MongoDB connection closed successfully');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}

export default clientPromise;

// Admin user type
export interface AdminUser {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

// Collection names
export const COLLECTIONS = {
  ASSESSMENTS: 'assessments',
  ADMIN_USERS: 'admin_users',
} as const; 