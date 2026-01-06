const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/crmdb';

// Define schema with strict: false to access fields with any name
const ptpPaymentSchema = new mongoose.Schema({}, { 
  collection: 'ptppayments',
  strict: false
});

const PTPPayment = mongoose.model('PTPPayment', ptpPaymentSchema);

const customerSchema = new mongoose.Schema({}, {
  collection: 'customers',
  strict: false
});

const Customer = mongoose.model('Customer', customerSchema);

async function fixFieldMapping() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all PTP payment records
    const allPayments = await PTPPayment.find().limit(5);
    
    console.log('🔍 Analyzing field structure of first record:');
    if (allPayments.length > 0) {
      const firstRecord = allPayments[0];
      const doc = firstRecord._doc || firstRecord;
      console.log('Fields found:');
      Object.keys(doc).forEach(key => {
        console.log(`  - "${key}": ${doc[key]}`);
      });
    }

    console.log('\n📊 Getting all records for field mapping...');
    const allRecords = await PTPPayment.find();
    console.log(`Found ${allRecords.length} total records\n`);

    let updated = 0;
    let withNames = 0;
    let withAccounts = 0;

    console.log('🔧 Processing records to map fields correctly...\n');

    for (const payment of allRecords) {
      try {
        const doc = payment._doc || payment;
        
        // Map the actual field names to the expected ones
        const updates = {};
        
        // Map ACCOUNT_NUMBER → accountNumber
        if (doc['ACCOUNT_NUMBER']) {
          updates.accountNumber = doc['ACCOUNT_NUMBER'];
          withAccounts++;
        }
        
        // Map CUSTOMER NAME → customerName
        if (doc['CUSTOMER NAME']) {
          updates.customerName = doc['CUSTOMER NAME'];
          withNames++;
        }
        
        // Map PTP AMOUNT → ptpAmount
        if (doc['PTP AMOUNT']) {
          updates.ptpAmount = doc['PTP AMOUNT'];
        }
        
        // Map STATUS → status
        if (doc['STATUS']) {
          updates.status = doc['STATUS'];
        }
        
        // Map PAYMENT DATE → ptpDate
        if (doc['PAYMENT DATE']) {
          updates.ptpDate = doc['PAYMENT DATE'];
        }
        
        // Map CONTACT NUMBER → contactNumber
        if (doc['CONTACT NUMBER']) {
          updates.contactNumber = doc['CONTACT NUMBER'];
        }
        
        // Map CALLER NAME → callerName
        if (doc['CALLER NAME']) {
          updates.callerName = doc['CALLER NAME'];
        }
        
        // Map AM & TL → amTl
        if (doc['AM & TL']) {
          updates.amTl = doc['AM & TL'];
        }
        
        // Map PROCESS → process
        if (doc['PROCESS']) {
          updates.process = doc['PROCESS'];
        }

        // Only update if we have something to update
        if (Object.keys(updates).length > 0) {
          await PTPPayment.updateOne(
            { _id: payment._id },
            { $set: updates }
          );
          updated++;
          
          if (updated % 50 === 0) {
            console.log(`  Progress: ${updated}/${allRecords.length} mapped...`);
          }
        }

      } catch (err) {
        console.error(`❌ Error updating payment ${payment._id}:`, err.message);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Records updated with field mapping: ${updated}`);
    console.log(`   👤 Records with CUSTOMER NAME field: ${withNames}`);
    console.log(`   🔢 Records with ACCOUNT_NUMBER field: ${withAccounts}`);

    // Verify the fix
    console.log('\n🔍 Verifying mapped data...');
    const verifyRecords = await PTPPayment.find().limit(5);
    console.log('\n📋 Sample of mapped records:');
    verifyRecords.forEach((p, i) => {
      const doc = p._doc || p;
      console.log(`\n  Record ${i + 1}:`);
      console.log(`    customerName: ${doc.customerName || 'N/A'}`);
      console.log(`    accountNumber: ${doc.accountNumber || 'N/A'}`);
      console.log(`    status: ${doc.status || 'N/A'}`);
      console.log(`    ptpAmount: ${doc.ptpAmount || 'N/A'}`);
      console.log(`    ptpDate: ${doc.ptpDate || 'N/A'}`);
    });

    console.log('\n✨ Field mapping complete!');
    console.log('\n💡 Note: The frontend should now display customer names correctly.');
    console.log('   If names still appear as placeholders, check the original data source.\n');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

fixFieldMapping();
