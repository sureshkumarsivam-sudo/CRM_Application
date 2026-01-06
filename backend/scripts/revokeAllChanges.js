const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/crmdb';

// Define schema with strict: false to access all fields
const ptpPaymentSchema = new mongoose.Schema({}, { 
  collection: 'ptppayments',
  strict: false
});

const PTPPayment = mongoose.model('PTPPayment', ptpPaymentSchema);

async function revokeAllChanges() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Getting all records to revoke changes...');
    const allRecords = await PTPPayment.find();
    console.log(`Found ${allRecords.length} total records\n`);

    let revoked = 0;

    console.log('🔄 Removing all camelCase fields (accountNumber, customerName, etc.)...\n');

    for (const payment of allRecords) {
      try {
        // Remove ALL camelCase fields that were added
        await PTPPayment.updateOne(
          { _id: payment._id },
          { 
            $unset: {
              accountNumber: '',
              customerName: '',
              ptpAmount: '',
              status: '',
              paymentDate: '',
              ptpDate: '',
              contactNumber: '',
              callerName: '',
              amAndTL: '',
              amTl: '',
              process: ''
            }
          }
        );
        
        revoked++;
        
        if (revoked % 50 === 0) {
          console.log(`  Progress: ${revoked}/${allRecords.length} revoked...`);
        }

      } catch (err) {
        console.error(`❌ Error revoking payment ${payment._id}:`, err.message);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Records revoked: ${revoked}`);

    // Verify the revoke
    console.log('\n🔍 Verifying revoked data...');
    const verifyRecords = await PTPPayment.find().limit(3);
    console.log('\n📋 Sample of revoked records:');
    verifyRecords.forEach((p, i) => {
      const doc = p._doc || p;
      console.log(`\n  Record ${i + 1}:`);
      console.log(`    Fields present: ${Object.keys(doc).join(', ')}`);
      console.log(`    CUSTOMER NAME: ${doc['CUSTOMER NAME'] || 'MISSING'}`);
      console.log(`    ACCOUNT_NUMBER: ${doc['ACCOUNT_NUMBER'] || 'MISSING'}`);
      console.log(`    Has camelCase fields? ${doc.customerName ? 'YES ❌' : 'NO ✓'}`);
    });

    console.log('\n✨ All changes revoked successfully!');
    console.log('\n💡 Note: All records now have only the original uppercase/space-separated fields.\n');
    console.log('⚠️  WARNING: The backend will NOT work with these field names.');
    console.log('   The model expects camelCase fields (customerName, accountNumber, etc.)\n');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

revokeAllChanges();
