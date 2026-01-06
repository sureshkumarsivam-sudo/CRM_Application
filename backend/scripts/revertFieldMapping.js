const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/crmdb';

// Define schema with strict: false to access all fields
const ptpPaymentSchema = new mongoose.Schema({}, { 
  collection: 'ptppayments',
  strict: false
});

const PTPPayment = mongoose.model('PTPPayment', ptpPaymentSchema);

async function revertFieldMapping() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Getting all records to revert field mapping...');
    const allRecords = await PTPPayment.find();
    console.log(`Found ${allRecords.length} total records\n`);

    let reverted = 0;

    console.log('🔧 Reverting mapped fields (removing camelCase duplicates)...\n');

    for (const payment of allRecords) {
      try {
        // Remove the camelCase fields that were added by mapping
        // Keep only the original uppercase/space-separated fields
        const unsetFields = {
          accountNumber: "",
          customerName: "",
          ptpAmount: "",
          status: "",
          ptpDate: "",
          contactNumber: "",
          callerName: "",
          amTl: "",
          process: ""
        };

        await PTPPayment.updateOne(
          { _id: payment._id },
          { $unset: unsetFields }
        );
        
        reverted++;
        
        if (reverted % 50 === 0) {
          console.log(`  Progress: ${reverted}/${allRecords.length} reverted...`);
        }

      } catch (err) {
        console.error(`❌ Error reverting payment ${payment._id}:`, err.message);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Records reverted: ${reverted}`);

    // Verify the revert
    console.log('\n🔍 Verifying reverted data...');
    const verifyRecords = await PTPPayment.find().limit(3);
    console.log('\n📋 Sample of reverted records:');
    verifyRecords.forEach((p, i) => {
      const doc = p._doc || p;
      console.log(`\n  Record ${i + 1}:`);
      console.log(`    Fields present: ${Object.keys(doc).join(', ')}`);
      console.log(`    CUSTOMER NAME: ${doc['CUSTOMER NAME'] || 'N/A'}`);
      console.log(`    ACCOUNT_NUMBER: ${doc['ACCOUNT_NUMBER'] || 'N/A'}`);
      console.log(`    customerName (should be removed): ${doc.customerName || 'REMOVED ✓'}`);
      console.log(`    accountNumber (should be removed): ${doc.accountNumber || 'REMOVED ✓'}`);
    });

    console.log('\n✨ Field mapping reverted successfully!');
    console.log('\n💡 Note: All records now have only the original uppercase/space-separated fields.\n');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

revertFieldMapping();
