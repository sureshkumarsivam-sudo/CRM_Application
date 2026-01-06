/**
 * Payment Monitoring Setup Verification Script
 * Run this to verify that all components are properly configured
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Test imports
let allImportsSuccessful = true;

console.log('\n🔍 Payment Monitoring Setup Verification\n');
console.log('=' .repeat(50));

// 1. Test Model Import
console.log('\n1️⃣  Testing Model Import...');
try {
  const SettlementProposal = require('./models/SettlementProposal');
  console.log('   ✅ SettlementProposal model loaded successfully');
  
  // Check for new fields
  const schema = SettlementProposal.schema.paths;
  const requiredFields = ['statusMessage', 'completedDate', 'initiatedBy', 'managerId'];
  requiredFields.forEach(field => {
    if (schema[field]) {
      console.log(`   ✅ Field '${field}' exists in schema`);
    } else {
      console.log(`   ❌ Field '${field}' missing from schema`);
      allImportsSuccessful = false;
    }
  });
} catch (error) {
  console.log('   ❌ Error loading SettlementProposal model:', error.message);
  allImportsSuccessful = false;
}

// 2. Test Service Import
console.log('\n2️⃣  Testing Service Import...');
try {
  const paymentMonitoringService = require('./services/paymentMonitoringService');
  console.log('   ✅ paymentMonitoringService loaded successfully');
  
  // Check for required functions
  const requiredFunctions = ['checkAllPayments', 'getMonitoringData', 'markInstallmentPaid'];
  requiredFunctions.forEach(func => {
    if (typeof paymentMonitoringService[func] === 'function') {
      console.log(`   ✅ Function '${func}' exists`);
    } else {
      console.log(`   ❌ Function '${func}' missing`);
      allImportsSuccessful = false;
    }
  });
} catch (error) {
  console.log('   ❌ Error loading paymentMonitoringService:', error.message);
  allImportsSuccessful = false;
}

// 3. Test Routes Import
console.log('\n3️⃣  Testing Routes Import...');
try {
  const paymentMonitoringRoutes = require('./routes/paymentMonitoring');
  console.log('   ✅ paymentMonitoring routes loaded successfully');
} catch (error) {
  console.log('   ❌ Error loading paymentMonitoring routes:', error.message);
  allImportsSuccessful = false;
}

// 4. Test Email Service Import
console.log('\n4️⃣  Testing Email Service Import...');
try {
  const emailService = require('./services/emailService');
  console.log('   ✅ emailService loaded successfully');
  
  if (typeof emailService.sendEmail === 'function') {
    console.log('   ✅ sendEmail function exists');
  } else {
    console.log('   ⚠️  sendEmail function not found (emails may not work)');
  }
} catch (error) {
  console.log('   ❌ Error loading emailService:', error.message);
  allImportsSuccessful = false;
}

// 5. Test Environment Variables
console.log('\n5️⃣  Testing Environment Variables...');
const requiredEnvVars = ['MONGODB_URI'];
const optionalEnvVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar} is set`);
  } else {
    console.log(`   ❌ ${envVar} is NOT set (required)`);
    allImportsSuccessful = false;
  }
});

optionalEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar} is set`);
  } else {
    console.log(`   ⚠️  ${envVar} is NOT set (emails may not work)`);
  }
});

// 6. Test Database Connection (Optional)
console.log('\n6️⃣  Testing Database Connection...');
if (process.argv.includes('--db-test')) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crmdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('   ✅ Connected to MongoDB successfully');
    
    // Test query
    const SettlementProposal = require('./models/SettlementProposal');
    const count = await SettlementProposal.countDocuments();
    console.log(`   ✅ Found ${count} settlement proposals in database`);
    
    mongoose.disconnect();
    printSummary();
  })
  .catch(err => {
    console.log('   ❌ MongoDB connection error:', err.message);
    allImportsSuccessful = false;
    printSummary();
  });
} else {
  console.log('   ⏭️  Skipped (use --db-test flag to test database connection)');
  printSummary();
}

function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('\n📋 Summary\n');
  
  if (allImportsSuccessful) {
    console.log('✅ All components loaded successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Start the backend server: npm start');
    console.log('   2. Navigate to Settlements → Approvals → Payment Monitoring');
    console.log('   3. Test the payment monitoring dashboard');
    console.log('   4. Set up cron job for automatic payment checks');
    console.log('\n📚 Documentation: See PAYMENT_MONITORING_COMPLETE_GUIDE.md');
  } else {
    console.log('❌ Some components failed to load. Please check the errors above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure all files are in correct locations');
    console.log('   2. Run: npm install date-fns');
    console.log('   3. Check .env file for required variables');
    console.log('   4. Review PAYMENT_MONITORING_COMPLETE_GUIDE.md');
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  process.exit(allImportsSuccessful ? 0 : 1);
}
