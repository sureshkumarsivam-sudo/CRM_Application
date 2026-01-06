const mongoose = require('mongoose');
const PTPPayment = require('../models/PTPPayment');

const MONGODB_URI = 'mongodb://localhost:27017/crmdb';

async function createSampleData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing empty records
    console.log('🧹 Clearing existing empty records...');
    await PTPPayment.deleteMany({});
    console.log('✅ Cleared\n');

    console.log('📝 Creating sample PTP payment records...');

    const statuses = ['PTP', 'COLLECTED', 'PDC', 'PART-PAYMENT', 'W-SETT'];
    const processes = ['ASREC', 'DMI', 'BOB-WOFF', 'KOTAK-WOFF', 'SMFG-FIELD'];
    const teamLeaders = ['RATHNARAJ', 'YASODHA', 'SUMITHRA', 'SIVASANKARI', 'KESAVAN J'];
    const callers = ['GOLLA PRAKASH', 'DURGADEVI K', 'DEEPAN KUMAR D', 'PONSELVAN A', 'RITHIK SINGH'];
    
    const customerNames = [
      'GOWRI P', 'Dipankar Deka', 'Mukesh Gupta', 'VENKATASURESH MATCHA', 'SENTHILKUMAR C',
      'KATCHUMYDEEN', 'JAVEED SHAIK', 'Rajesh Kumar', 'Priya Sharma', 'Amit Patel',
      'Sanjay Singh', 'Neha Verma', 'Rahul Reddy', 'Lakshmi Rao', 'Vijay Krishna',
      'Anita Desai', 'Suresh Babu', 'Meera Iyer', 'Kiran Kumar', 'Pooja Nair'
    ];

    const sampleData = [];
    
    // Create 100 sample records with varied dates
    for (let i = 0; i < 100; i++) {
      const statusIndex = Math.floor(Math.random() * statuses.length);
      const isCollected = statusIndex === 1; // COLLECTED
      
      // Generate dates - mix of past, today, and future
      const daysOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() + daysOffset);
      
      const record = {
        accountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        customerName: customerNames[i % customerNames.length],
        ptpAmount: Math.floor(Math.random() * 50000) + 1000,
        status: statuses[statusIndex],
        paymentDate: paymentDate,
        contactNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        callerName: callers[Math.floor(Math.random() * callers.length)],
        amAndTL: teamLeaders[Math.floor(Math.random() * teamLeaders.length)],
        process: processes[Math.floor(Math.random() * processes.length)],
        createdBy: {
          name: 'System',
          userId: 'system',
          role: 'Admin'
        }
      };
      
      sampleData.push(record);
    }

    // Insert all records
    const result = await PTPPayment.insertMany(sampleData);
    console.log(`✅ Created ${result.length} sample PTP payment records\n`);

    // Display summary
    const total = await PTPPayment.countDocuments();
    const collected = await PTPPayment.countDocuments({ status: 'COLLECTED' });
    const ptp = await PTPPayment.countDocuments({ status: 'PTP' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayPTP = await PTPPayment.countDocuments({
      paymentDate: { $gte: today, $lt: tomorrow }
    });

    console.log('📊 Summary:');
    console.log(`   Total Records: ${total}`);
    console.log(`   Collected: ${collected}`);
    console.log(`   PTP (Pending): ${ptp}`);
    console.log(`   Today PTP: ${todayPTP}`);

    // Show sample records
    console.log('\n📋 Sample records:');
    const samples = await PTPPayment.find().limit(5).lean();
    samples.forEach((s, i) => {
      console.log(`\n   ${i + 1}. ${s.customerName} (${s.accountNumber})`);
      console.log(`      Amount: ₹${s.ptpAmount} | Status: ${s.status}`);
      console.log(`      Date: ${s.paymentDate.toISOString().split('T')[0]}`);
      console.log(`      Caller: ${s.callerName} | Process: ${s.process}`);
    });

    console.log('\n✨ Sample data created successfully!');
    console.log('\n💡 You can now:');
    console.log('   1. Refresh the Collections page to see the data');
    console.log('   2. Upload your actual PTP payment Excel file');
    console.log('   3. The backend API is now working correctly\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

createSampleData();
