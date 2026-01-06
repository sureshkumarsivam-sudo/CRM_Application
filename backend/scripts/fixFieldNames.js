const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/crmdb';

// Define schema with strict: false
const ptpPaymentSchema = new mongoose.Schema({}, { 
  collection: 'ptppayments',
  strict: false
});

const PTPPayment = mongoose.model('PTPPayment', ptpPaymentSchema);

async function fixFieldNames() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Getting all records to fix field names...');
    const allRecords = await PTPPayment.find();
    console.log(`Found ${allRecords.length} total records\n`);

    let fixed = 0;

    console.log('🔧 Fixing field names: amTl → amAndTL, ptpDate → paymentDate...\n');

    for (const payment of allRecords) {
      try {
        const doc = payment._doc || payment;
        const updates = {};
        const unset = {};
        
        // Fix amTl → amAndTL
        if (doc.amTl) {
          updates.amAndTL = doc.amTl;
          unset.amTl = '';
        }
        
        // Fix ptpDate → paymentDate
        if (doc.ptpDate) {
          updates.paymentDate = doc.ptpDate;
          unset.ptpDate = '';
        }
        
        if (Object.keys(updates).length > 0 || Object.keys(unset).length > 0) {
          const updateQuery = {};
          if (Object.keys(updates).length > 0) updateQuery.$set = updates;
          if (Object.keys(unset).length > 0) updateQuery.$unset = unset;
          
          await PTPPayment.updateOne({ _id: payment._id }, updateQuery);
          fixed++;
          
          if (fixed % 50 === 0) {
            console.log(`  Progress: ${fixed}/${allRecords.length} fixed...`);
          }
        }

      } catch (err) {
        console.error(`❌ Error fixing payment ${payment._id}:`, err.message);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Records fixed: ${fixed}`);

    // Verify the fix
    console.log('\n🔍 Verifying fixed data...');
    const verifyRecords = await PTPPayment.find().limit(3);
    console.log('\n📋 Sample of fixed records:');
    verifyRecords.forEach((p, i) => {
      const doc = p._doc || p;
      console.log(`\n  Record ${i + 1}:`);
      console.log(`    Fields: ${Object.keys(doc).join(', ')}`);
      console.log(`    customerName: ${doc.customerName}`);
      console.log(`    accountNumber: ${doc.accountNumber}`);
      console.log(`    amAndTL: ${doc.amAndTL || 'MISSING'}`);
      console.log(`    paymentDate: ${doc.paymentDate}`);
      console.log(`    status: ${doc.status}`);
      console.log(`    ptpAmount: ${doc.ptpAmount}`);
    });

    console.log('\n✨ Field names fixed successfully!\n');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

fixFieldNames();
