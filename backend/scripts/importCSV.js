const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const Customer = require('../models/Customer');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crmdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Helper function to parse date
function parseDate(dateString) {
  if (!dateString || dateString === '0' || dateString.trim() === '') return null;
  
  // Handle different date formats
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

// Helper function to parse number
function parseNumber(numberString) {
  if (!numberString || numberString === '0' || numberString.trim() === '') return 0;
  const num = parseFloat(numberString);
  return isNaN(num) ? 0 : num;
}

// Helper function to clean string
function cleanString(str) {
  if (!str || str === '0') return '';
  return str.toString().trim();
}

// CSV column mapping
function mapCSVToCustomer(row) {
  return {
    loanId: cleanString(row['Loan ID']),
    parent: cleanString(row['Parent']),
    accountName: cleanString(row['Account_Name']),
    dob: parseDate(row['DOB']),
    pan: cleanString(row['PAN']),
    aadhaarNumber: cleanString(row['aadhaar_number']),
    gender: cleanString(row['Gender']) || 'Male',
    occupation: cleanString(row['Occupation']),
    profession: cleanString(row['Profession']),
    educationLevel: cleanString(row['Education_level']),
    nationality: cleanString(row['Nationality']) || 'Indian',
    addressDetails: cleanString(row['Address_Details']),
    city: cleanString(row['City']),
    pin: cleanString(row['Pin']),
    state: cleanString(row['STATE']),
    location: cleanString(row['Location']),
    team: cleanString(row['TEAM']),
    phoneNo: cleanString(row['Phone_No']),
    mobileNo: cleanString(row['Mobile_No']),
    email: cleanString(row['Email ']).toLowerCase(), // Note the space in 'Email '
    employerType: cleanString(row['Employer_Type']),
    employerName: cleanString(row['EmployerName']),
    employerAddress: cleanString(row['Employer_Address']),
    sanctionDate: parseDate(row['Sanction_Date']),
    sanctionAmount: parseNumber(row['Sanction_Amount']),
    disbursementAmount: parseNumber(row['Disbursement_Amount']),
    disbursementDate: parseDate(row['Disbursement_Date']),
    emiStartDate: parseDate(row['EMI_start_Date']),
    emi: parseNumber(row['EMI']),
    tenure: parseNumber(row['Tenure']),
    maturityDate: parseDate(row['Maturity_Date']),
    principalDueOverDue: parseNumber(row['PrincipalDue_OverDue']),
    otherCharges: parseNumber(row['Other_Charges ']), // Note the space
    totalOverDue: parseNumber(row['Total_Over_due']),
    dateOfNPA: parseDate(row['Date_of_NPA']),
    interestRate: parseNumber(row['Interest_rate']),
    status: 'Active' // Default status
  };
}

async function importCSV() {
  const csvFilePath = path.join(__dirname, '../../../FULL_DUMP.csv');
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('❌ CSV file not found at:', csvFilePath);
    process.exit(1);
  }

  console.log('📊 Starting CSV import...');
  console.log('📁 CSV file path:', csvFilePath);

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing customer data...');
  await Customer.deleteMany({});
  console.log('✅ Existing data cleared');

  const customers = [];
  let processedCount = 0;
  let errorCount = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const customer = mapCSVToCustomer(row);
          
          // Basic validation
          if (!customer.loanId || !customer.accountName || !customer.phoneNo) {
            console.warn(`⚠️  Skipping invalid row: Missing required fields for ${customer.accountName || 'Unknown'}`);
            errorCount++;
            return;
          }

          customers.push(customer);
          processedCount++;

          // Log progress every 1000 records
          if (processedCount % 1000 === 0) {
            console.log(`📈 Processed ${processedCount} records...`);
          }

        } catch (error) {
          console.error('❌ Error processing row:', error.message);
          errorCount++;
        }
      })
      .on('end', async () => {
        try {
          console.log(`📊 Total records processed: ${processedCount}`);
          console.log(`❌ Errors encountered: ${errorCount}`);
          console.log('💾 Inserting customers into database...');

          // Insert in batches to avoid memory issues
          const batchSize = 500;
          const batches = [];
          
          for (let i = 0; i < customers.length; i += batchSize) {
            batches.push(customers.slice(i, i + batchSize));
          }

          let insertedCount = 0;
          let batchErrors = 0;

          for (let i = 0; i < batches.length; i++) {
            try {
              const result = await Customer.insertMany(batches[i], { 
                ordered: false, // Continue on individual errors
                rawResult: true
              });
              insertedCount += result.insertedCount || batches[i].length;
              console.log(`✅ Batch ${i + 1}/${batches.length} completed (${result.insertedCount || batches[i].length} records)`);
            } catch (error) {
              console.error(`❌ Batch ${i + 1} error:`, error.message);
              
              // Count successful inserts even with some failures
              if (error.result && error.result.insertedCount) {
                insertedCount += error.result.insertedCount;
              }
              batchErrors++;
            }
          }

          console.log('🎉 Import completed!');
          console.log(`✅ Successfully imported: ${insertedCount} customers`);
          console.log(`❌ Batch errors: ${batchErrors}`);
          console.log(`📊 Total records in database: ${await Customer.countDocuments()}`);

          resolve();

        } catch (error) {
          console.error('❌ Database insertion error:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ CSV parsing error:', error);
        reject(error);
      });
  });
}

// Run the import
importCSV()
  .then(() => {
    console.log('🎉 CSV import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });