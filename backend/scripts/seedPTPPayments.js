const mongoose = require('mongoose');
const PTPPayment = require('../models/PTPPayment');
const Customer = require('../models/Customer');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/crm_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const samplePTPPayments = [
  {
    accountNumber: 'B.6025E+13',
    customerName: 'KARTHIK B 260',
    ptpAmount: 48928,
    status: 'W-SETT',
    paymentDate: new Date('2025-10-30'),
    contactNumber: '9733215843',
    callerName: 'DEEPAN KUMAR D',
    amAndTL: 'SUMITHRA',
    process: 'SMFG-FIELD'
  },
  {
    accountNumber: 'DMI00270002D',
    customerName: 'VENKAT N 231',
    ptpAmount: 35969,
    status: 'COLLECTED',
    paymentDate: new Date('2025-10-30'),
    contactNumber: '07264486567',
    callerName: 'KOLAKALLUR VIDYA SAGAR',
    amAndTL: 'SIVASANKARI',
    process: 'ASREC'
  },
  {
    accountNumber: 'B.4151E+13',
    customerName: 'ANAND K 202',
    ptpAmount: 20672,
    status: 'PTP',
    paymentDate: new Date('2025-10-30'),
    contactNumber: '9220177180',
    callerName: 'PONSELVAN A',
    amAndTL: 'YASODHA',
    process: 'DMI'
  },
  {
    accountNumber: 'DMI00270001/2',
    customerName: 'RAJESH M 173',
    ptpAmount: 12488,
    status: 'PDC',
    paymentDate: new Date('2025-10-30'),
    contactNumber: '9658500691',
    callerName: 'RITHIK SINGH',
    amAndTL: 'KESAVAN J',
    process: 'BOB-WOFF'
  },
  {
    accountNumber: 'B.2172E+13',
    customerName: 'DEEPA S 144',
    ptpAmount: 20264,
    status: 'PART-PAYMENT',
    paymentDate: new Date('2025-10-30'),
    contactNumber: '9270323425',
    callerName: 'TADSETTI BALA SIVA CHARAN',
    amAndTL: 'SUMITHRA',
    process: 'KOTAK-WOFF'
  },
  {
    accountNumber: 'DMI00270001I4',
    customerName: 'LAKSHMI T 115',
    ptpAmount: 21621,
    status: 'W-SETT',
    paymentDate: new Date('2025-10-30'),
    contactNumber: '9942127579',
    callerName: 'CHARUMATH S',
    amAndTL: 'SIVASANKARI',
    process: 'SMFG-FIELD'
  },
  {
    accountNumber: 'B.9696E+13',
    customerName: 'LAKSHMI T 232',
    ptpAmount: 25200,
    status: 'PTP',
    paymentDate: new Date('2025-10-30'),
    contactNumber: '9820218919',
    callerName: 'DEEPAN KUMAR D',
    amAndTL: 'SUMITHRA',
    process: 'ASREC'
  },
  {
    accountNumber: 'B.549E+13',
    customerName: 'KARTHIK B 186',
    ptpAmount: 23254,
    status: 'COLLECTED',
    paymentDate: new Date('2025-10-31'),
    contactNumber: '9703713561',
    callerName: 'DEEPAN KUMAR D',
    amAndTL: 'SUMITHRA',
    process: 'ASREC'
  },
  {
    accountNumber: 'B.3625E+13',
    customerName: 'ANAND K 58',
    ptpAmount: 32676,
    status: 'PDC',
    paymentDate: new Date('2025-10-30'),
    contactNumber: '9878099819',
    callerName: 'PONSELVAN A',
    amAndTL: 'YASODHA',
    process: 'BOB-WOFF'
  },
  {
    accountNumber: 'DMI00270002G',
    customerName: 'PRIYA R 194',
    ptpAmount: 24138,
    status: 'PTP',
    paymentDate: new Date('2025-10-30'),
    contactNumber: '9102245011',
    callerName: 'ROBI CHETRY',
    amAndTL: 'YASODHA',
    process: 'KOTAK-WOFF'
  }
];

async function seedPTPPayments() {
  try {
    // Check if data already exists
    const count = await PTPPayment.countDocuments();
    
    if (count > 0) {
      console.log(`ℹ️  ${count} PTP payment records already exist. Skipping seed.`);
      console.log('💡 To re-seed, delete existing records first.');
      process.exit(0);
    }

    // Get some customers to link
    const customers = await Customer.find().limit(10);
    
    // Insert sample PTP payments
    const ptpPaymentsWithCustomers = samplePTPPayments.map((ptp, index) => {
      const customer = customers[index % customers.length];
      return {
        ...ptp,
        customerId: customer?._id,
        createdBy: {
          name: 'System',
          userId: 'system',
          role: 'Admin'
        }
      };
    });

    await PTPPayment.insertMany(ptpPaymentsWithCustomers);

    console.log(`✅ Successfully seeded ${samplePTPPayments.length} PTP payment records`);
    console.log('📊 Sample data includes:');
    console.log('   - Various statuses: PTP, COLLECTED, PDC, PART-PAYMENT, W-SETT');
    console.log('   - Multiple processes: ASREC, DMI, BOB-WOFF, KOTAK-WOFF, SMFG-FIELD');
    console.log('   - Different callers and team leaders');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding PTP payments:', error);
    process.exit(1);
  }
}

// Run the seed function
seedPTPPayments();
