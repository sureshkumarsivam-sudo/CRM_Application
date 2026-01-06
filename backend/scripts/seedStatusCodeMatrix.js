const mongoose = require('mongoose');
const StatusCodeMatrix = require('../models/StatusCodeMatrix');
require('dotenv').config();

// Comprehensive Status Code Matrix from CRM STATUS CODE MATRIX PDF
const statusCodes = [
  // CALLER Status Codes
  {
    code: 'NC',
    statusName: 'Not Connected',
    description: 'Phone not reachable or network issue',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Retry call after 2 hours',
    priority: 10,
    color: '#FFE0B2',
    isActive: true
  },
  {
    code: 'RNR',
    statusName: 'Ringing No Response',
    description: 'Phone ringing but customer not answering',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Retry call after 2 hours',
    priority: 9,
    color: '#FFF9C4',
    isActive: true
  },
  {
    code: 'CB',
    statusName: 'Customer Busy',
    description: 'Customer line is busy',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Retry call after 1 hour',
    priority: 8,
    color: '#FFE082',
    isActive: true
  },
  {
    code: 'SWO',
    statusName: 'Switched Off',
    description: 'Customer phone is switched off',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Retry call after 4 hours',
    priority: 7,
    color: '#FFCDD2',
    isActive: true
  },
  {
    code: 'PDC',
    statusName: 'Promise to Pay Confirmed',
    description: 'Customer confirmed payment promise with date',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Follow up on promised date',
    priority: 50,
    color: '#C8E6C9',
    isActive: true
  },
  {
    code: 'PTP',
    statusName: 'Promise to Pay',
    description: 'Customer promised to pay but date not confirmed',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Follow up after 2 days',
    priority: 45,
    color: '#A5D6A7',
    isActive: true
  },
  {
    code: 'NI',
    statusName: 'Not Interested',
    description: 'Customer not interested in payment or settlement',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Escalate to manager',
    priority: 15,
    color: '#FFAB91',
    isActive: true
  },
  {
    code: 'DND',
    statusName: 'Do Not Disturb',
    description: 'Customer requested not to call',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Mark for email/SMS only',
    priority: 5,
    color: '#EF9A9A',
    isActive: true
  },
  {
    code: 'WN',
    statusName: 'Wrong Number',
    description: 'Phone number does not belong to customer',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Update contact information',
    priority: 3,
    color: '#BCAAA4',
    isActive: true
  },
  {
    code: 'LM',
    statusName: 'Left Message',
    description: 'Message left with family/colleague',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Follow up after 24 hours',
    priority: 20,
    color: '#B0BEC5',
    isActive: true
  },
  {
    code: 'CB_REQ',
    statusName: 'Callback Requested',
    description: 'Customer requested to call back later',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Call at requested time',
    priority: 30,
    color: '#90CAF9',
    isActive: true
  },
  {
    code: 'DISPUTE',
    statusName: 'Dispute Raised',
    description: 'Customer disputes the outstanding amount',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Escalate to dispute team',
    priority: 40,
    color: '#CE93D8',
    isActive: true
  },
  {
    code: 'SETTLEMENT',
    statusName: 'Settlement Discussed',
    description: 'Settlement options discussed with customer',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Send settlement proposal',
    priority: 48,
    color: '#80CBC4',
    isActive: true
  },
  {
    code: 'PAYMENT',
    statusName: 'Payment Made',
    description: 'Customer made full payment',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Verify payment and update ledger',
    priority: 60,
    color: '#4CAF50',
    isActive: true
  },
  {
    code: 'PARTIAL_PAYMENT',
    statusName: 'Partial Payment',
    description: 'Customer made partial payment',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Follow up for balance amount',
    priority: 55,
    color: '#81C784',
    isActive: true
  },
  {
    code: 'BROKEN_PTP',
    statusName: 'Promise Broken',
    description: 'Customer did not honor payment promise',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Escalate and call immediately',
    priority: 25,
    color: '#FF8A65',
    isActive: true
  },
  {
    code: 'LEGAL',
    statusName: 'Legal Action',
    description: 'Case escalated to legal department',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Legal team to handle',
    priority: 35,
    color: '#E57373',
    isActive: true
  },
  
  // FIELD EXECUTIVE Status Codes
  {
    code: 'FV_DONE',
    statusName: 'Field Visit Completed',
    description: 'Field executive completed visit successfully',
    applicableFor: 'FIELD_EXECUTIVE',
    nextActionTrigger: 'Update visit report with findings',
    priority: 50,
    color: '#66BB6A',
    isActive: true
  },
  {
    code: 'ADDRESS_NOT_FOUND',
    statusName: 'Address Not Found',
    description: 'Unable to locate customer address',
    applicableFor: 'FIELD_EXECUTIVE',
    nextActionTrigger: 'Verify address details from records',
    priority: 10,
    color: '#FFB74D',
    isActive: true
  },
  {
    code: 'HOUSE_LOCKED',
    statusName: 'House Locked',
    description: 'Customer house found locked, no one available',
    applicableFor: 'FIELD_EXECUTIVE',
    nextActionTrigger: 'Retry visit after 2 days',
    priority: 15,
    color: '#FFA726',
    isActive: true
  },
  {
    code: 'CUSTOMER_ABSCONDED',
    statusName: 'Customer Absconded',
    description: 'Customer has left the address permanently',
    applicableFor: 'FIELD_EXECUTIVE',
    nextActionTrigger: 'Trace customer new location',
    priority: 20,
    color: '#FF7043',
    isActive: true
  },
  {
    code: 'MET_CUSTOMER',
    statusName: 'Met Customer',
    description: 'Field executive met customer in person',
    applicableFor: 'FIELD_EXECUTIVE',
    nextActionTrigger: 'Record discussion details and outcome',
    priority: 45,
    color: '#9CCC65',
    isActive: true
  },
  {
    code: 'MET_FAMILY',
    statusName: 'Met Family Member',
    description: 'Met customer family member at residence',
    applicableFor: 'FIELD_EXECUTIVE',
    nextActionTrigger: 'Request customer contact information',
    priority: 35,
    color: '#AED581',
    isActive: true
  },
  {
    code: 'PROPERTY_SEIZED',
    statusName: 'Property Seized',
    description: 'Assets seized as per legal process',
    applicableFor: 'FIELD_EXECUTIVE',
    nextActionTrigger: 'Update legal team with seizure details',
    priority: 55,
    color: '#EF5350',
    isActive: true
  },
  {
    code: 'FIELD_VISIT',
    statusName: 'Field Visit Required',
    description: 'Customer case requires field visit',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Assign to field executive team',
    priority: 40,
    color: '#42A5F5',
    isActive: true
  },
  {
    code: 'OFFICE_VISIT',
    statusName: 'Customer Visited Office',
    description: 'Customer visited office for payment/discussion',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Process payment or record discussion',
    priority: 58,
    color: '#26A69A',
    isActive: true
  },
  {
    code: 'DECEASED',
    statusName: 'Customer Deceased',
    description: 'Customer has passed away',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Contact legal heirs for settlement',
    priority: 12,
    color: '#78909C',
    isActive: true
  },
  {
    code: 'MEDICAL_EMERGENCY',
    statusName: 'Medical Emergency',
    description: 'Customer facing serious medical emergency',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Grant temporary relief period',
    priority: 18,
    color: '#FFB300',
    isActive: true
  },
  {
    code: 'RELOCATED',
    statusName: 'Customer Relocated',
    description: 'Customer moved to different city/location',
    applicableFor: 'FIELD_EXECUTIVE',
    nextActionTrigger: 'Update address and assign to new zone',
    priority: 22,
    color: '#8D6E63',
    isActive: true
  },
  {
    code: 'UNEMPLOYED',
    statusName: 'Currently Unemployed',
    description: 'Customer lost job or currently unemployed',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Offer restructuring or settlement options',
    priority: 28,
    color: '#FF8A65',
    isActive: true
  },
  {
    code: 'BUSINESS_LOSS',
    statusName: 'Business Loss',
    description: 'Customer facing significant business losses',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Discuss settlement or payment plan',
    priority: 32,
    color: '#FFAB40',
    isActive: true
  },
  {
    code: 'LANGUAGE_BARRIER',
    statusName: 'Language Barrier',
    description: 'Communication difficult due to language',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Assign caller with matching language',
    priority: 6,
    color: '#B39DDB',
    isActive: true
  },
  {
    code: 'CALLBACK_LATER',
    statusName: 'Call Back Later',
    description: 'Customer requested callback at specific time',
    applicableFor: 'CALLER',
    nextActionTrigger: 'Schedule callback as per customer time',
    priority: 27,
    color: '#64B5F6',
    isActive: true
  },
  {
    code: 'PAID_ALREADY',
    statusName: 'Already Paid - Verification',
    description: 'Customer claims payment already made',
    applicableFor: 'BOTH',
    nextActionTrigger: 'Verify payment in system',
    priority: 42,
    color: '#4DD0E1',
    isActive: true
  }
];

async function seedStatusCodeMatrix() {
  try {
    console.log('🚀 Starting Status Code Matrix seeding...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crmdb';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB\n');

    // Optional: Clear existing status codes (comment out to preserve existing)
    // const deleted = await StatusCodeMatrix.deleteMany({});
    // console.log(`🗑️  Cleared ${deleted.deletedCount} existing status codes\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const codeData of statusCodes) {
      try {
        const existing = await StatusCodeMatrix.findOne({ code: codeData.code });
        
        if (existing) {
          console.log(`⏭️  ${codeData.code.padEnd(20)} - Skipped (already exists)`);
          skipped++;
        } else {
          await StatusCodeMatrix.create(codeData);
          console.log(`✅ ${codeData.code.padEnd(20)} - ${codeData.statusName}`);
          created++;
        }
      } catch (error) {
        console.error(`❌ ${codeData.code.padEnd(20)} - Error: ${error.message}`);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`   ✅ Created:  ${created}`);
    console.log(`   ⏭️  Skipped:  ${skipped}`);
    console.log(`   ❌ Errors:   ${errors}`);
    console.log(`   📝 Total:    ${statusCodes.length}`);
    console.log('='.repeat(60));

    // Display breakdown by category
    const allCodes = await StatusCodeMatrix.find({ isActive: true }).sort({ priority: -1 });
    const callerCodes = allCodes.filter(c => c.applicableFor === 'CALLER');
    const fieldCodes = allCodes.filter(c => c.applicableFor === 'FIELD_EXECUTIVE');
    const bothCodes = allCodes.filter(c => c.applicableFor === 'BOTH');
    
    console.log('\n📋 Status Codes in Database:');
    console.log(`   📞 Caller Codes:          ${callerCodes.length}`);
    console.log(`   🚗 Field Executive Codes: ${fieldCodes.length}`);
    console.log(`   🔄 Both (Common):         ${bothCodes.length}`);
    console.log(`   📊 Total Active:          ${allCodes.length}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    console.log('🎉 Seeding completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Error seeding status codes:', error);
    process.exit(1);
  }
}

// Run the seed function
if (require.main === module) {
  seedStatusCodeMatrix();
}

module.exports = { seedStatusCodeMatrix, statusCodes };
