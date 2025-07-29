const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  let client = null;
  
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    // Check environment variables
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not configured');
      process.exit(1);
    }
    
    console.log('✅ MONGODB_URI is configured');
    console.log('🔗 Connecting to MongoDB...');
    
    // Connection options with improved settings
    const options = {
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      heartbeatFrequencyMS: 30000,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      monitorCommands: true,
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 30000
      }
    };
    
    client = new MongoClient(process.env.MONGODB_URI, options);
    
    // Test connection with timeout
    const connectionPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 45000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    console.log('✅ Connected to MongoDB successfully');
    
    // Test database operations
    const db = client.db();
    const collection = db.collection('assessments');
    
    console.log('🧪 Testing database operations...');
    
    // Test ping
    await db.admin().ping();
    console.log('✅ Database ping successful');
    
    // Test collection count
    const count = await collection.countDocuments();
    console.log(`✅ Collection count successful: ${count} documents`);
    
    // Test a simple query
    const sample = await collection.findOne({});
    console.log('✅ Sample query successful');
    
    console.log('🎉 All MongoDB tests passed!');
    
  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    if (client) {
      try {
        await client.close();
        console.log('🔌 Connection closed successfully');
      } catch (closeError) {
        console.error('⚠️ Error closing connection:', closeError.message);
      }
    }
  }
}

async function testWriteOperation() {
  let client = null;
  
  try {
    console.log('\n🧪 Testing write operations...');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not configured');
      return;
    }
    
    client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 60000,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
      w: 'majority',
      heartbeatFrequencyMS: 30000,
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 30000
      }
    });
    
    await client.connect();
    console.log('✅ Connected for write test');
    
    const db = client.db();
    const collection = db.collection('test_connection');
    
    // Test insert
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Connection test document'
    };
    
    const insertResult = await collection.insertOne(testDoc);
    console.log('✅ Insert test successful:', insertResult.insertedId);
    
    // Test find
    const foundDoc = await collection.findOne({ _id: insertResult.insertedId });
    console.log('✅ Find test successful');
    
    // Test update
    const updateResult = await collection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { updated: true } }
    );
    console.log('✅ Update test successful:', updateResult.modifiedCount);
    
    // Test delete
    const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Delete test successful:', deleteResult.deletedCount);
    
    console.log('🎉 All write operations passed!');
    
  } catch (error) {
    console.error('❌ Write operation test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (client) {
      try {
        await client.close();
        console.log('🔌 Write test connection closed');
      } catch (closeError) {
        console.error('⚠️ Error closing write test connection:', closeError.message);
      }
    }
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting MongoDB connection tests...\n');
  
  await testConnection();
  await testWriteOperation();
  
  console.log('\n✨ All tests completed!');
  process.exit(0);
}

runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
}); 