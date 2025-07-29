console.log('🔍 Checking environment variables...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('SMTP_HOST:', process.env.SMTP_HOST ? 'SET' : 'NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL ? 'SET' : 'NOT SET');
console.log('TO_EMAIL:', process.env.TO_EMAIL ? 'SET' : 'NOT SET');

if (!process.env.MONGODB_URI) {
  console.log('❌ MONGODB_URI is not set. Please check your environment variables.');
} else {
  console.log('✅ MONGODB_URI is configured');
} 