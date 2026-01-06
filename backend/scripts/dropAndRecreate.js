const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_database';

const dropAndRecreate = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('🗑️  Dropping customers collection...');
    
    // Drop the entire collection
    await mongoose.connection.db.dropCollection('customers').catch(() => {
      console.log('   Collection does not exist or already dropped');
    });
    
    console.log('✅ Collection dropped successfully!');
    console.log('📝 Collection will be recreated automatically on next insert');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

// Run the script
dropAndRecreate();
