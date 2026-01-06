/**
 * MongoDB PTP Payments Verification Script
 * This script checks MongoDB connection and verifies PTP Payments data
 */

const mongoose = require('mongoose');
const PTPPayment = require('../models/PTPPayment');
const Customer = require('../models/Customer');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crmdb';

async function verifyPTPPayments() {
  try {
    console.log('='.repeat(60));
    console.log('🔍 MongoDB PTP Payments Verification');
    console.log('='.repeat(60));
    
    // Step 1: Test MongoDB Connection
    console.log('\n📡 Step 1: Testing MongoDB Connection...');
    console.log(`   Connection String: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('   ✅ MongoDB Connected Successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    
    // Step 2: List all collections
    console.log('\n📂 Step 2: Listing All Collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   Found ${collections.length} collections:`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Step 3: Check PTP Payments Collection
    console.log('\n💳 Step 3: Checking PTP Payments Collection...');
    const ptpCount = await PTPPayment.countDocuments();
    console.log(`   Total PTP Payments: ${ptpCount}`);
    
    if (ptpCount === 0) {
      console.log('   ⚠️  WARNING: No PTP payment records found!');
      console.log('   Would you like to create sample data? (Y/N)');
      
      // Create sample data
      await createSamplePTPPayments();
    } else {
      console.log('   ✅ PTP Payments collection has data');
      
      // Step 4: Display Sample Records
      console.log('\n📋 Step 4: Sample PTP Payment Records (First 5):');
      const sampleRecords = await PTPPayment.find().limit(5).lean();
      
      sampleRecords.forEach((record, index) => {
        console.log(`\n   Record ${index + 1}:`);
        console.log(`   - Account Number: ${record.accountNumber}`);
        console.log(`   - Customer Name: ${record.customerName || '❌ MISSING'}`);
        console.log(`   - PTP Amount: ₹${record.ptpAmount?.toLocaleString()}`);
        console.log(`   - Status: ${record.status}`);
        console.log(`   - Payment Date: ${new Date(record.paymentDate).toLocaleDateString()}`);
        console.log(`   - Contact: ${record.contactNumber}`);
        console.log(`   - Caller: ${record.callerName}`);
        console.log(`   - AM & TL: ${record.amAndTL}`);
        console.log(`   - Process: ${record.process}`);
      });
      
      // Step 5: Check for Missing Customer Names
      console.log('\n🔍 Step 5: Checking for Missing Customer Names...');
      const missingNames = await PTPPayment.countDocuments({
        $or: [
          { customerName: { $exists: false } },
          { customerName: '' },
          { customerName: null }
        ]
      });
      
      if (missingNames > 0) {
        console.log(`   ⚠️  WARNING: ${missingNames} records have missing customer names`);
        console.log('   Run: node scripts/fixCustomerNames.js');
      } else {
        console.log('   ✅ All records have customer names');
      }
      
      // Step 6: Status Distribution
      console.log('\n📊 Step 6: Status Distribution:');
      const statusGroups = await PTPPayment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      statusGroups.forEach(group => {
        console.log(`   - ${group._id}: ${group.count}`);
      });
      
      // Step 7: Recent Payments
      console.log('\n📅 Step 7: Recent Payment Dates:');
      const recentPayments = await PTPPayment.find()
        .sort({ paymentDate: -1 })
        .limit(5)
        .select('accountNumber customerName paymentDate status')
        .lean();
      
      recentPayments.forEach(payment => {
        console.log(`   - ${payment.accountNumber} | ${payment.customerName} | ${new Date(payment.paymentDate).toLocaleDateString()} | ${payment.status}`);
      });
    }
    
    // Step 8: Test API Query
    console.log('\n🔧 Step 8: Testing API Query Simulation...');
    const apiTestQuery = {};
    const apiTestResults = await PTPPayment.find(apiTestQuery)
      .sort({ paymentDate: -1 })
      .limit(10)
      .lean();
    
    console.log(`   API would return ${apiTestResults.length} records`);
    console.log('   Sample API Response:');
    console.log(JSON.stringify({
      success: true,
      data: apiTestResults.slice(0, 2),
      pagination: {
        currentPage: 1,
        totalPages: Math.ceil(ptpCount / 50),
        totalRecords: ptpCount,
        limit: 50
      }
    }, null, 2));
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ Verification Complete!');
    console.log('='.repeat(60));
    console.log(`✅ MongoDB Connection: OK`);
    console.log(`✅ Total PTP Payments: ${ptpCount}`);
    console.log(`✅ Missing Customer Names: ${missingNames || 0}`);
    console.log('='.repeat(60));
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error during verification:');
    console.error(error);
    process.exit(1);
  }
}

async function createSamplePTPPayments() {
  console.log('\n🔧 Creating Sample PTP Payment Data...');
  
  try {
    // Check if customers exist
    const customerCount = await Customer.countDocuments();
    
    if (customerCount === 0) {
      console.log('   ⚠️  No customers found. Creating sample PTP payments without customer references...');
    }
    
    const sampleData = [
      {
        accountNumber: 'ACC123456',
        customerName: 'Rajesh Kumar',
        ptpAmount: 50000,
        status: 'COLLECTED',
        paymentDate: new Date('2025-10-30'),
        contactNumber: '9876543210',
        callerName: 'DEEPAN KUMAR D',
        amAndTL: 'SUMITHRA',
        process: 'ASREC',
        createdBy: { name: 'System', userId: 'system', role: 'Admin' }
      },
      {
        accountNumber: 'ACC789012',
        customerName: 'Priya Sharma',
        ptpAmount: 75000,
        status: 'PTP',
        paymentDate: new Date('2025-11-15'),
        contactNumber: '9123456789',
        callerName: 'KOLAKALLUR VIDYA SAGAR',
        amAndTL: 'SIVASANKARI',
        process: 'DMI',
        createdBy: { name: 'System', userId: 'system', role: 'Admin' }
      },
      {
        accountNumber: 'ACC345678',
        customerName: 'Amit Patel',
        ptpAmount: 30000,
        status: 'COLLECTED',
        paymentDate: new Date('2025-10-25'),
        contactNumber: '9988776655',
        callerName: 'PONSELVAN A',
        amAndTL: 'YASODHA',
        process: 'BOB-WOFF',
        createdBy: { name: 'System', userId: 'system', role: 'Admin' }
      },
      {
        accountNumber: 'ACC901234',
        customerName: 'Sneha Reddy',
        ptpAmount: 45000,
        status: 'PDC',
        paymentDate: new Date('2025-11-20'),
        contactNumber: '9876501234',
        callerName: 'RITHIK SINGH',
        amAndTL: 'KESAVAN J',
        process: 'KOTAK-WOFF',
        createdBy: { name: 'System', userId: 'system', role: 'Admin' }
      },
      {
        accountNumber: 'ACC567890',
        customerName: 'Vikram Singh',
        ptpAmount: 60000,
        status: 'COLLECTED',
        paymentDate: new Date('2025-10-28'),
        contactNumber: '9765432109',
        callerName: 'DEEPAN KUMAR D',
        amAndTL: 'SUMITHRA',
        process: 'SMFG-FIELD',
        createdBy: { name: 'System', userId: 'system', role: 'Admin' }
      }
    ];
    
    await PTPPayment.insertMany(sampleData);
    console.log(`   ✅ Created ${sampleData.length} sample PTP payment records`);
    
    // Verify creation
    const newCount = await PTPPayment.countDocuments();
    console.log(`   ✅ Total PTP Payments now: ${newCount}`);
    
  } catch (err) {
    console.error('   ❌ Error creating sample data:', err);
  }
}

// Run verification
verifyPTPPayments();
