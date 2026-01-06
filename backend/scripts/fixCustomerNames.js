const mongoose = require('mongoose');
const PTPPayment = require('../models/PTPPayment');
const Customer = require('../models/Customer');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crmdb';

async function fixCustomerNames() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all PTP payments without customerName or with empty customerName
    const paymentsWithoutNames = await PTPPayment.find({
      $or: [
        { customerName: { $exists: false } },
        { customerName: '' },
        { customerName: null }
      ]
    });

    console.log(`\n📊 Found ${paymentsWithoutNames.length} PTP payments without customer names`);

    if (paymentsWithoutNames.length === 0) {
      console.log('✅ All PTP payments already have customer names!');
      process.exit(0);
    }

    // Check first few records to understand the data
    console.log('\n🔍 Inspecting first 3 records:');
    for (let i = 0; i < Math.min(3, paymentsWithoutNames.length); i++) {
      const p = paymentsWithoutNames[i];
      console.log(`   Record ${i + 1}:`);
      console.log(`     - _id: ${p._id}`);
      console.log(`     - accountNumber: ${p.accountNumber || 'MISSING'}`);
      console.log(`     - customerName: ${p.customerName || 'MISSING'}`);
      console.log(`     - status: ${p.status}`);
      console.log(`     - All fields: ${Object.keys(p._doc || p).join(', ')}`);
    }

    let updated = 0;
    let notFound = 0;
    let fixed = 0;

    console.log('\n🔧 Processing records...');

    for (const payment of paymentsWithoutNames) {
      try {
        let customerName = null;
        
        // Check if accountNumber exists and is valid
        if (payment.accountNumber && payment.accountNumber !== 'undefined' && payment.accountNumber.trim() !== '') {
          // Try to find customer by accountNumber/loanId
          const customer = await Customer.findOne({ 
            loanId: payment.accountNumber 
          });

          if (customer && customer.customerName) {
            customerName = customer.customerName;
            console.log(`✅ Found: ${payment.accountNumber} → ${customerName}`);
            updated++;
          } else {
            // Set descriptive placeholder
            customerName = `Account_${payment.accountNumber}`;
            console.log(`⚠️  No match for ${payment.accountNumber}, using placeholder`);
            notFound++;
          }
        } else {
          // AccountNumber is missing or undefined - generate a unique placeholder
          customerName = `Unknown_Customer_${payment._id.toString().substring(0, 8)}`;
          console.log(`⚠️  Missing account number for record ${payment._id}, using: ${customerName}`);
          notFound++;
        }

        // Update the record with the customer name
        await PTPPayment.updateOne(
          { _id: payment._id },
          { $set: { customerName: customerName } }
        );
        fixed++;

      } catch (err) {
        console.error(`❌ Error updating payment ${payment._id}:`, err.message);
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Updated with real customer names: ${updated}`);
    console.log(`   ⚠️  Set placeholder names: ${notFound}`);
    console.log(`   📊 Total fixed: ${fixed}`);
    console.log(`   ❌ Failed: ${paymentsWithoutNames.length - fixed}`);

    // Verify the fix
    console.log('\n🔍 Verifying fix...');
    const stillMissing = await PTPPayment.countDocuments({
      $or: [
        { customerName: { $exists: false } },
        { customerName: '' },
        { customerName: null }
      ]
    });

    if (stillMissing === 0) {
      console.log('✅ All records now have customer names!');
    } else {
      console.log(`⚠️  ${stillMissing} records still missing customer names`);
    }

    console.log('\n✨ Migration complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the fix
fixCustomerNames();
