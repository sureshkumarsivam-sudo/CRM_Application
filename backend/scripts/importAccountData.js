const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_database';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const Customer = require('../models/Customer');

// Helper to clean field values
const cleanField = (value) => {
  if (!value || value === '-' || value.trim() === '') return null;
  const trimmed = value.trim();
  if (trimmed === '0') return null;
  return trimmed;
};

// Parse date helper
const parseDate = (dateString) => {
  if (!dateString || dateString === '-' || dateString === '0') return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    return null;
  }
};

// Parse number helper
const parseNumber = (value) => {
  if (!value || value === '-') return 0;
  const num = parseFloat(value.toString().replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
};

// Import CSV data
const importAccountData = async (csvFilePath) => {
  const accounts = [];
  let rowNum = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath, { encoding: 'utf8' })
      .pipe(csv({ 
        skipEmptyLines: true,
        mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim() // Remove BOM
      }))
      .on('data', (row) => {
        rowNum++;
        
        if (rowNum === 1) {
          console.log('Column names (first 5):', Object.keys(row).slice(0, 5));
        }
        
        const loanId = row['Loan Account Number'];
        
        if (rowNum <= 3) {
          console.log(`Row ${rowNum} - LoanId: '${loanId}'`);
        }
        
        // Skip empty rows
        if (!loanId || loanId.trim() === '') {
          console.log(`Skipping empty row ${rowNum}`);
          return;
        }
        
        const account = {
          loanId: loanId.trim(),
          parent: cleanField(row['Parent Id']),
          accountName: cleanField(row['Customer Name']),
          productType: cleanField(row['Product Type']) || 'PL',
          
          // Financial Details
          totalOutstanding: parseNumber(row['Total Outstanding']),
          principalOutstanding: parseNumber(row['Principal Outstanding']),
          interestCharges: parseNumber(row['Interest Charges']),
          otherCharges: parseNumber(row['Other Charges (Unpaid due)']),
          loanAmount: parseNumber(row['Loan Amount']),
          rateOfInterest: cleanField(row['Rate of Interest']),
          tenure: parseNumber(row['Tenure']),
          emiAmount: parseNumber(row['EMI Amount']),
          totalRepayableAmount: parseNumber(row['Total Repayable Amount']),
          paidEmiCount: parseNumber(row['Paid Emi count']),
          paidEmiAmount: parseNumber(row['Paid Emi Amount']),
          pendingEmiCount: parseNumber(row['Pending Emi count']),
          pendingEmiAmount: parseNumber(row['Pending Emi amount']),
          
          // Loan Dates
          sanctionDate: parseDate(row['Sanction Date']),
          sanctionAmount: parseNumber(row['Sanction Amount']),
          disbursementDate: parseDate(row['Disbursement Date']),
          disbursementAmount: parseNumber(row['Disbursement Amount']),
          emiStartDate: parseDate(row['EMI start Date']),
          maturityDate: parseDate(row['Maturity Date']),
          lastPaymentDate: parseDate(row['Last Payment Date']),
          lastPaidAmount: parseNumber(row['Last Paid Amount']),
          
          // Account Status
          dpdBucket: cleanField(row['DPD/Bucket']),
          accountStatus: cleanField(row['Account Status']) || 'ACTIVE',
          dateOfNPA: parseDate(row['Date of NPA']),
          
          // Personal Information
          fatherName: cleanField(row['Father Name']),
          motherName: cleanField(row['Mother Name']),
          spouseName: cleanField(row['Spouse Name']),
          dob: parseDate(row['Date of Birth']),
          gender: cleanField(row['Gender']),
          pan: cleanField(row['Pan Number']),
          aadhaarNumber: cleanField(row['Aadhaar number']),
          voterId: cleanField(row['Voter id Number']),
          drivingLicence: cleanField(row['Driving Licence Number']),
          designation: cleanField(row['Designation'] || row['Designation ']),
          
          // Contact Information
          registeredMobile: cleanField(row['Registered Mobile']),
          alternateMobile: cleanField(row['Alternate Mobile']),
          email: cleanField(row['Email ID']),
          
          // Address Details
          residentialAddress: cleanField(row['Residential Address']),
          location: cleanField(row['Location']),
          pin: cleanField(row['Pin code']),
          state: cleanField(row['State']),
          
          // Employer Details
          employerName: cleanField(row['Employer Name'] || row['Employer Name ']),
          employerAddress: cleanField(row['Employer  Address'] || row['Employer Address']),
          officialMailId: cleanField(row['Official  Mail id'] || row['Official  Mail id '] || row['Official Mail id']),
          occupationType: cleanField(row['Occupation type']),
          employmentJobSector: cleanField(row['Employement Job Sector']),
          
          // Allocation & Team
          allocation: cleanField(row['Allocation'] || row['Allocation ']),
          callerName: cleanField(row['Caller Name']),
          teamLeader: cleanField(row['Team Leader']),
          manager: cleanField(row['Manager'] || row['Manager ']),
          
          // Calling Status
          callingStatusCodes: cleanField(row['Calling Status Codes']),
          remarks: cleanField(row['Remarks']),
          lastConnectedDate: parseDate(row['Last Connected date']),
          lastConnectedNumber: cleanField(row['Last connected Connected Number']),
          
          // Field Status
          lastFieldVisitedDate: parseDate(row['Last Field visted Date']),
          fieldStatusCodes: cleanField(row['Field status Codes']),
          fieldRemarks: cleanField(row['Field Remarks']),
          
          // Settlement Information
          settlementType: cleanField(row['SETTLEMENT TYPE']),
          settlementAmount: parseNumber(row['SETTLEMENT AMOUNT']),
          installments: parseNumber(row['INSTALLMENTS']),
          paidAmount: parseNumber(row['PAID AMOUNT']),
          settlementStatus: cleanField(row['SETTLEMENT STATUS']),
          
          // Legacy fields for compatibility
          phoneNo: cleanField(row['Registered Mobile']),
          mobileNo: cleanField(row['Registered Mobile']),
          addressDetails: cleanField(row['Residential Address']),
          city: cleanField(row['Location']),
          status: cleanField(row['Account Status']),
        };
        
        accounts.push(account);
      })
      .on('end', async () => {
        try {
          console.log(`📊 Parsed ${accounts.length} accounts from CSV`);
          
          // Clear existing data
          console.log('🗑️  Clearing existing customer data...');
          const deleteResult = await Customer.deleteMany({});
          console.log(`   Deleted ${deleteResult.deletedCount} existing records`);
          
          // Insert accounts in batches
          console.log('📝 Inserting new records...');
          let inserted = 0;
          let errors = 0;
          const batchSize = 100;
          
          for (let i = 0; i < accounts.length; i += batchSize) {
            const batch = accounts.slice(i, i + batchSize);
            try {
              await Customer.insertMany(batch, { ordered: false });
              inserted += batch.length;
              console.log(`   Inserted batch ${Math.floor(i/batchSize) + 1}: ${inserted}/${accounts.length}`);
            } catch (err) {
              // Handle duplicate key errors
              if (err.writeErrors) {
                inserted += batch.length - err.writeErrors.length;
                errors += err.writeErrors.length;
                console.log(`   Batch had ${err.writeErrors.length} errors`);
              } else {
                errors += batch.length;
                console.error(`   Batch error:`, err.message);
              }
            }
          }
          
          console.log('✅ Import completed!');
          console.log(`   📝 Inserted: ${inserted}`);
          console.log(`   ❌ Errors: ${errors}`);
          
          resolve({ inserted, errors });
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
};

// Run import
const csvPath = process.argv[2] || path.join(__dirname, '../../../Account Management Field Header details_csv.csv');

console.log(`📂 Reading CSV file: ${csvPath}`);

importAccountData(csvPath)
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Import failed:', err);
    process.exit(1);
  });
