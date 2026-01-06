const mongoose = require('mongoose');
const CallerFeedbackStatusCode = require('../models/CallerFeedbackStatusCode');
const FieldExecutiveFeedbackStatusCode = require('../models/FieldExecutiveFeedbackStatusCode');
require('dotenv').config();

// Caller Feedback Status Codes data from the provided document
const callerFeedbackStatusCodes = [
  { code: '01', statusName: 'CALL BACK', description: 'Customer requested to be called later', nextActionTrigger: 'Auto schedule next call' },
  { code: '02', statusName: 'PROMISE TO PAY (PTP)', description: 'Customer promised payment on specific date', nextActionTrigger: 'Create PTP entry & reminder' },
  { code: '03', statusName: 'SETTLEMENT REQUEST', description: 'Customer requested settlement offer', nextActionTrigger: 'Trigger approval flow to TL' },
  { code: '04', statusName: 'PAID', description: 'Payment confirmed by customer', nextActionTrigger: 'Move to verification stage' },
  { code: '05', statusName: 'PARTIAL PAYMENT', description: 'Customer paid partial amount', nextActionTrigger: 'Record & follow-up balance' },
  { code: '06', statusName: 'DISPUTE RAISED', description: 'Customer disputed balance or charges', nextActionTrigger: 'Escalate to TL/Manager' },
  { code: '07', statusName: 'WRONG NUMBER', description: 'Contact not customer', nextActionTrigger: 'Mark invalid contact' },
  { code: '08', statusName: 'SWITCHED OFF / NOT REACHABLE', description: 'Call attempt failed', nextActionTrigger: 'Reschedule callback' },
  { code: '09', statusName: 'CUSTOMER REFUSED TO PAY', description: 'Customer unwilling to pay', nextActionTrigger: 'Flag for escalation' },
  { code: '10', statusName: 'LEGAL NOTICE REQUIRED', description: 'Customer non-cooperative, initiate legal', nextActionTrigger: 'Send to Legal queue' },
  { code: '11', statusName: 'SETTLED & CLOSED', description: 'Account settled', nextActionTrigger: 'Mark closure & generate NOC/NDC' },
  { code: '12', statusName: 'TRANSFER TO FIELD VISIT', description: 'Escalated to field visit for physical contact', nextActionTrigger: 'Notify field team' },
  { code: '13', statusName: 'UNCONTACTED / NEW', description: 'New account, not yet attempted', nextActionTrigger: 'Include in next call batch' },
  { code: '14', statusName: 'SKIP / OUT OF SERVICE', description: 'Temporary skip', nextActionTrigger: 'Recheck after 3 days' },
  { code: '15', statusName: 'CUSTOMER DECEASED', description: 'Mark account for special handling', nextActionTrigger: 'Notify manager/legal' },
  { code: '16', statusName: 'FRAUD / ESCALATION REQUIRED', description: 'Fraud suspected', nextActionTrigger: 'Send to compliance team' },
  { code: '17', statusName: 'ALREADY PAID', description: 'Customer claims paid', nextActionTrigger: 'Send for verification' },
  { code: '18', statusName: 'DOCUMENT REQUESTED', description: 'Customer asked for statement/NOC', nextActionTrigger: 'Trigger document request' },
  { code: '19', statusName: 'FOLLOW-UP REQUIRED', description: 'Follow-up pending', nextActionTrigger: 'Add to reminder queue' },
  { code: '20', statusName: 'CLOSED', description: 'Account successfully closed', nextActionTrigger: 'Archive record' }
];

// Field Executive Feedback Status Codes data from the provided document
const fieldExecutiveFeedbackStatusCodes = [
  { code: 'F01', statusName: 'VISITED - CONTACTED', description: 'Customer met and discussed', nextActionTrigger: 'Update remarks' },
  { code: 'F02', statusName: 'VISITED - PAYMENT COLLECTED', description: 'Cash/cheque collected', nextActionTrigger: 'Verify & mark payment' },
  { code: 'F03', statusName: 'VISITED - CUSTOMER NOT AVAILABLE', description: 'Address visited but no response', nextActionTrigger: 'Schedule revisit' },
  { code: 'F04', statusName: 'WRONG ADDRESS', description: 'Address invalid', nextActionTrigger: 'Escalate to TL' },
  { code: 'F05', statusName: 'FOLLOW-UP VISIT REQUIRED', description: 'Customer asked for another visit', nextActionTrigger: 'Schedule follow-up' },
  { code: 'F06', statusName: 'SETTLEMENT DISCUSSED', description: 'Settlement discussed during visit', nextActionTrigger: 'Send proposal to TL' },
  { code: 'F07', statusName: 'SKIPPED / UNABLE TO VISIT', description: 'Unable to visit due to time/location', nextActionTrigger: 'Reschedule' },
  { code: 'F08', statusName: 'PAID DIRECTLY TO BANK', description: 'Customer deposited directly', nextActionTrigger: 'Verify with finance' },
  { code: 'F09', statusName: 'ADDRESS LOCKED / SHIFTED', description: 'Unable to meet due to location', nextActionTrigger: 'Update system' },
  { code: 'F10', statusName: 'LEGAL ACTION ADVISED', description: 'Case needs legal follow-up', nextActionTrigger: 'Escalate' },
  { code: 'F11', statusName: 'ACCOUNT CLOSED', description: 'Fully paid and confirmed', nextActionTrigger: 'Update closure' },
  { code: 'F12', statusName: 'DECEASED / FAMILY MET', description: 'Customer deceased', nextActionTrigger: 'Update legal' },
  { code: 'F13', statusName: 'COMPANY / OFFICE VISIT DONE', description: 'Met at workplace', nextActionTrigger: 'Record discussion outcome' },
  { code: 'F14', statusName: 'REFUSED TO PAY', description: 'Customer denied payment', nextActionTrigger: 'Escalate to TL' },
  { code: 'F15', statusName: 'DOCUMENTS COLLECTED', description: 'Docs collected for verification', nextActionTrigger: 'Upload copies' }
];

async function seedStatusCodes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crmdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await CallerFeedbackStatusCode.deleteMany({});
    await FieldExecutiveFeedbackStatusCode.deleteMany({});
    
    console.log('🧹 Cleared existing status codes');

    // Insert Caller Feedback Status Codes
    await CallerFeedbackStatusCode.insertMany(callerFeedbackStatusCodes);
    console.log(`✅ Inserted ${callerFeedbackStatusCodes.length} Caller Feedback Status Codes`);

    // Insert Field Executive Feedback Status Codes
    await FieldExecutiveFeedbackStatusCode.insertMany(fieldExecutiveFeedbackStatusCodes);
    console.log(`✅ Inserted ${fieldExecutiveFeedbackStatusCodes.length} Field Executive Feedback Status Codes`);

    console.log('🎉 Status codes seeding completed successfully!');
    
    // Display summary
    const callerCount = await CallerFeedbackStatusCode.countDocuments();
    const fieldCount = await FieldExecutiveFeedbackStatusCode.countDocuments();
    
    console.log('\n📊 Summary:');
    console.log(`📞 Caller Feedback Status Codes: ${callerCount}`);
    console.log(`🏃 Field Executive Feedback Status Codes: ${fieldCount}`);

  } catch (error) {
    console.error('❌ Error seeding status codes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding
if (require.main === module) {
  seedStatusCodes();
}

module.exports = { seedStatusCodes };