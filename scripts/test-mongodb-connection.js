const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    return;
  }

  console.log('🔍 Testing MongoDB connection...');
  console.log('📋 Environment:', process.env.NODE_ENV || 'development');
  console.log('🔗 URI (masked):', uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

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
    monitorCommands: process.env.NODE_ENV === 'development',
    writeConcern: {
      w: 'majority',
      j: true,
      wtimeout: 30000
    },
    // SSL/TLS Configuration
    ssl: true,
    sslValidate: process.env.NODE_ENV === 'production',
    sslCA: process.env.MONGODB_SSL_CA,
    sslCert: process.env.MONGODB_SSL_CERT,
    sslKey: process.env.MONGODB_SSL_KEY,
    sslPass: process.env.MONGODB_SSL_PASS,
    // TLS Configuration for newer MongoDB versions
    tls: true,
    tlsAllowInvalidCertificates: process.env.NODE_ENV !== 'production',
    tlsAllowInvalidHostnames: process.env.NODE_ENV !== 'production',
    tlsInsecure: process.env.NODE_ENV !== 'production',
    // Connection string options for SSL
    directConnection: false,
    // Add connection string parameters for SSL
    ...(process.env.NODE_ENV !== 'production' && {
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
    })
  };

  console.log('⚙️  Connection options:', JSON.stringify(options, null, 2));

  let client;
  try {
    console.log('🔄 Attempting to connect...');
    client = new MongoClient(uri, options);
    
    await client.connect();
    console.log('✅ MongoDB connection successful!');
    
    // Test the connection with a ping
    await client.db().admin().ping();
    console.log('✅ Database ping successful!');
    
    // List databases
    const adminDb = client.db('admin');
    const databases = await adminDb.admin().listDatabases();
    console.log('📊 Available databases:', databases.databases.map(db => db.name));
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('🔍 Error details:', error);
    
    // Try with more permissive SSL settings
    console.log('🔄 Retrying with permissive SSL settings...');
    try {
      const permissiveOptions = {
        ...options,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        tlsInsecure: true,
        sslValidate: false
      };
      
      const permissiveClient = new MongoClient(uri, permissiveOptions);
      await permissiveClient.connect();
      console.log('✅ Connection successful with permissive SSL settings!');
      await permissiveClient.close();
    } catch (permissiveError) {
      console.error('❌ Connection still failed with permissive settings:', permissiveError.message);
    }
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed');
    }
  }
}

testConnection().catch(console.error); 