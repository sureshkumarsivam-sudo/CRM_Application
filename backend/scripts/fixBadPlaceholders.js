const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/crmdb';

// PTP Payment Schema
const ptpPaymentSchema = new mongoose.Schema({
  accountNumber: String,
  customerName: String,
  status: String,
  ptpDate: Date,
  ptpAmount: Number,
  actualPaidAmount: Number,
  actualPaidDate: Date,
  createdAt: Date,
  updatedAt: Date
}, { 
  collection: 'ptppayments',
  timestamps: true,
  strict: false
});

const PTPPayment = mongoose.model('PTPPayment', ptpPaymentSchema);

// Customer Schema
const customerSchema = new mongoose.Schema({
  loanId: { type: String, unique: true },
  customerName: String,
  contactNumber: String,
  email: String,
  loanAmount: Number,
  outstandingBalance: Number
}, {
  collection: 'customers',
  timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);

async function fixBadPlaceholders() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all records with "Customer_undefined" or similar bad placeholders
    const badRecords = await PTPPayment.find({
      $or: [
        { customerName: 'Customer_undefined' },
        { customerName: /^Customer_undefined$/i }
      ]
    });

    console.log(`\n📊 Found ${badRecords.length} records with bad placeholder names`);

    if (badRecords.length === 0) {
      console.log('✅ No bad placeholders found!');
      process.exit(0);
    }

    // Inspect a few records to understand the data structure
    console.log('\n🔍 Inspecting first 5 records to understand data:');
    for (let i = 0; i < Math.min(5, badRecords.length); i++) {
      const p = badRecords[i];
      const allFields = Object.keys(p._doc || p);
      console.log(`\nRecord ${i + 1}:`);
      console.log(`  _id: ${p._id}`);
      console.log(`  accountNumber: ${p.accountNumber || 'MISSING'}`);
      console.log(`  customerName: ${p.customerName}`);
      console.log(`  status: ${p.status}`);
      console.log(`  ptpDate: ${p.ptpDate}`);
      console.log(`  ptpAmount: ${p.ptpAmount}`);
      console.log(`  All fields (${allFields.length}): ${allFields.slice(0, 10).join(', ')}...`);
    }

    // Check if there are any customers in the database
    const customerCount = await Customer.countDocuments();
    console.log(`\n👥 Found ${customerCount} customers in the database`);

    if (customerCount > 0) {
      // Show a few sample customers
      const sampleCustomers = await Customer.find().limit(3);
      console.log('\n📋 Sample customers:');
      sampleCustomers.forEach((c, i) => {
        console.log(`  ${i + 1}. loanId: ${c.loanId}, Name: ${c.customerName}`);
      });
    }

    let updated = 0;
    let notFound = 0;

    console.log('\n🔧 Processing records...');

    for (const payment of badRecords) {
      try {
        let customerName = null;
        
        // Try multiple strategies to find or generate a customer name
        
        // Strategy 1: Try to find by accountNumber if it exists
        if (payment.accountNumber && payment.accountNumber !== 'undefined' && payment.accountNumber.trim() !== '') {
          const customer = await Customer.findOne({ 
            loanId: payment.accountNumber 
          });

          if (customer && customer.customerName) {
            customerName = customer.customerName;
            updated++;
          } else {
            customerName = `Account_${payment.accountNumber}`;
            notFound++;
          }
        } 
        // Strategy 2: Check if there's any other identifier field
        else if (payment.loanId) {
          const customer = await Customer.findOne({ 
            loanId: payment.loanId 
          });

          if (customer && customer.customerName) {
            customerName = customer.customerName;
            updated++;
          } else {
            customerName = `Loan_${payment.loanId}`;
            notFound++;
          }
        }
        // Strategy 3: Use _id for a unique identifier
        else {
          customerName = `PTP_${payment._id.toString().substring(18, 24)}`;
          notFound++;
        }

        // Update the record
        await PTPPayment.updateOne(
          { _id: payment._id },
          { $set: { customerName: customerName } }
        );

        if (updated % 50 === 0 || notFound % 50 === 0) {
          console.log(`  Progress: ${updated + notFound}/${badRecords.length} processed...`);
        }

      } catch (err) {
        console.error(`❌ Error updating payment ${payment._id}:`, err.message);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Updated with real customer names: ${updated}`);
    console.log(`   ⚠️  Set placeholder names: ${notFound}`);
    console.log(`   📊 Total processed: ${updated + notFound}`);

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const stillBad = await PTPPayment.countDocuments({
      customerName: 'Customer_undefined'
    });

    if (stillBad === 0) {
      console.log('✅ All bad placeholders have been fixed!');
    } else {
      console.log(`⚠️  ${stillBad} records still have bad placeholders`);
    }

    // Show some sample results
    console.log('\n📋 Sample of fixed records:');
    const samples = await PTPPayment.find().limit(5);
    samples.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.customerName} - Status: ${p.status} - Amount: ${p.ptpAmount}`);
    });

    console.log('\n✨ Fix complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

fixBadPlaceholders();
