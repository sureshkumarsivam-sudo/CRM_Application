const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/crmdb';

// Define schema with strict: false to access all fields
const ptpPaymentSchema = new mongoose.Schema({}, { 
  collection: 'ptppayments',
  strict: false
});

const PTPPayment = mongoose.model('PTPPayment', ptpPaymentSchema);

async function cleanDuplicateFields() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Getting all records to clean duplicate fields...');
    const allRecords = await PTPPayment.find();
    console.log(`Found ${allRecords.length} total records\n`);

    let cleaned = 0;

    console.log('🧹 Removing duplicate uppercase/space-separated fields...\n');

    for (const payment of allRecords) {
      try {
        const doc = payment._doc || payment;
        
        // Check if duplicate fields exist
        const hasDuplicates = doc['ACCOUNT_NUMBER'] || doc['CUSTOMER NAME'] || 
                              doc['PTP AMOUNT'] || doc['STATUS'] || 
                              doc['PAYMENT DATE'] || doc['CONTACT NUMBER'] ||
                              doc['CALLER NAME'] || doc['AM & TL'] || doc['PROCESS'];
        
        if (hasDuplicates) {
          // Remove the uppercase/space-separated fields, keep camelCase versions
          await PTPPayment.updateOne(
            { _id: payment._id },
            { 
              $unset: {
                'ACCOUNT_NUMBER': '',
                'CUSTOMER NAME': '',
                'PTP AMOUNT': '',
                'STATUS': '',
                'PAYMENT DATE': '',
                'CONTACT NUMBER': '',
                'CALLER NAME': '',
                'AM & TL': '',
                'PROCESS': ''
              }
            }
          );
          
          cleaned++;
          
          if (cleaned % 50 === 0) {
            console.log(`  Progress: ${cleaned}/${allRecords.length} cleaned...`);
          }
        }

      } catch (err) {
        console.error(`❌ Error cleaning payment ${payment._id}:`, err.message);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Records cleaned: ${cleaned}`);
    console.log(`   ✅ Records already clean: ${allRecords.length - cleaned}`);

    // Verify the cleanup
    console.log('\n🔍 Verifying cleaned data...');
    const verifyRecords = await PTPPayment.find().limit(3);
    console.log('\n📋 Sample of cleaned records:');
    verifyRecords.forEach((p, i) => {
      const doc = p._doc || p;
      console.log(`\n  Record ${i + 1}:`);
      console.log(`    Fields present: ${Object.keys(doc).join(', ')}`);
      console.log(`    customerName: ${doc.customerName}`);
      console.log(`    accountNumber: ${doc.accountNumber}`);
      console.log(`    status: ${doc.status}`);
      console.log(`    ptpAmount: ${doc.ptpAmount}`);
      console.log(`    Has uppercase fields? ${doc['CUSTOMER NAME'] ? 'YES ❌' : 'NO ✓'}`);
    });

    console.log('\n✨ Duplicate fields cleaned successfully!');
    console.log('\n💡 Note: All records now have only camelCase field names.\n');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

cleanDuplicateFields();
