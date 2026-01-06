const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
require('dotenv').config();

// Import the Employee model
const Employee = require('./models/Employee');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm-system')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    processCompleteDataset();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Helper function to convert Excel date serial to JavaScript Date
function excelDateToJSDate(excelDate) {
  if (!excelDate || isNaN(excelDate)) return null;
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return isNaN(date) ? null : date;
}

// Helper function to process salary string  
function processSalary(salaryStr) {
  if (!salaryStr) return null;
  
  const cleanStr = String(salaryStr).replace(/[^\d.%]/g, '');
  
  if (cleanStr.includes('%')) {
    const percentage = parseFloat(cleanStr.replace('%', ''));
    return `Variable ${percentage}%`;
  }
  
  const numericValue = parseFloat(cleanStr);
  return isNaN(numericValue) ? null : numericValue;
}

async function processCompleteDataset() {
  try {
    // Create complete employee dataset from your attachment
    const employeeData = [
      {
        "S.No": 1,
        "Emp Code": "083198",
        "Branch": "Chennai", 
        "DOJ": 45810,
        "Reporting Manager": "Suresh Kumar",
        "Name": "SURYA KUMARI K",
        "Company": "Vaishnavi Management Pvt Ltd",
        "Status": "Confirmed",
        "Experience": "Experience",
        "Employment Status": "Working",
        "Gender": "FEMALE",
        "DOB": 33752,
        "Department": "Collection", 
        "Designation": "Executive- Customer Service",
        "Qualification": "BCA",
        "Salary Offered": "VARIABLE 10%",
        "Annual": "",
        "Contact No.": "6383518874",
        "Martial Status": "Married",
        "PanCard No": "ODLPS7456A", 
        "Aadhar Card No": "500592903362",
        "Bank Account No.": "029101000029492",
        "IFSC Code": "IOBA0000291",
        "Bank Name": "INDIAN OVERSEAS BANK",
        "Bank Branch": "0291 DR. R.K SALAI",
        "Official Email Id": "",
        "Personal Email Id": "surya.thejusri19@gmail.com",
        "Current Address": "NO.13,DAWARAKA NAGAR,2ND STREET,TRIPLICANE,CHENNAI - 600 005",
        "Permanent Address": "NO.13,DAWARAKA NAGAR,2ND STREET,TRIPLICANE,CHENNAI - 600 005", 
        "Emergency Contact No.": "9551996336",
        "Emergency Contact Name": "RAJKUMAR",
        "Relationship": "HUSBAND"
      },
      {
        "S.No": 2,
        "Emp Code": "083199", 
        "Branch": "Chennai",
        "DOJ": 45819,
        "Reporting Manager": "Suresh Kumar",
        "Name": "VIGNESH S",
        "Company": "Vaishnavi Management Pvt Ltd", 
        "Status": "Confirmed",
        "Experience": "Fresher", 
        "Employment Status": "Working",
        "Gender": "MALE",
        "DOB": 37297,
        "Department": "Collection",
        "Designation": "Executive- Customer Service", 
        "Qualification": "B.SC (VISCOM)",
        "Salary Offered": "13500",
        "Annual": "162000",
        "Contact No.": "7305581023", 
        "Martial Status": "UNMARRIED",
        "PanCard No": "CLJPV5393K",
        "Aadhar Card No": "516110616920",
        "Bank Account No.": "43645356262",
        "IFSC Code": "SBIN0000777", 
        "Bank Name": "STATE BANK OF INDIA",
        "Bank Branch": "TIRUTTANI",
        "Official Email Id": "",
        "Personal Email Id": "vigneshvelvin@gmail.com",
        "Current Address": "NO.14/5, INDIRA GANDHI 3RD STREET,NEAR MMDA BUS DEPOT,AVVAI NAGAR,CHOOLAIMEDU,CHENNAI - 600094",
        "Permanent Address": "NO.14,KANDAPPAN STREET,M.P.S SALAI,TIRUTTANI - 631209", 
        "Emergency Contact No.": "6385566800",
        "Emergency Contact Name": "KOTTISWARI", 
        "Relationship": "MOTHER"
      },
      {
        "S.No": 3,
        "Emp Code": "083200",
        "Branch": "Chennai",
        "DOJ": 45819, 
        "Reporting Manager": "Suresh Kumar",
        "Name": "MAHALAKSHMI M",
        "Company": "Vaishnavi Management Pvt Ltd",
        "Status": "Abscond", 
        "Experience": "Fresher",
        "Employment Status": "Working", 
        "Gender": "FEMALE",
        "DOB": 38043,
        "Department": "Collection",
        "Designation": "Executive- Customer Service",
        "Qualification": "B.A(HISTORY)", 
        "Salary Offered": "13500", 
        "Annual": "162000",
        "Contact No.": "8870075677",
        "Martial Status": "UNMARRIED",
        "PanCard No": "",
        "Aadhar Card No": "428952921136", 
        "Bank Account No.": "520481034092396",
        "IFSC Code": "UBIN0905895",
        "Bank Name": "UNION BANK", 
        "Bank Branch": "EGMORE",
        "Official Email Id": "",
        "Personal Email Id": "subbusubbulakshmi76@gmail.com", 
        "Current Address": "NO.567,SUDHANTHIRA NAGAR,MOORSE ROAD,THOUSAND LIGHTS,CHENNAI - 600 006",
        "Permanent Address": "NO.567,SUDHANTHIRA NAGAR,MOORSE ROAD,THOUSAND LIGHTS,CHENNAI - 600 006",
        "Emergency Contact No.": "9940421446",
        "Emergency Contact Name": "SUBBULAKSHMI",
        "Relationship": "MOTHER"
      }
    ];

    console.log(`📊 Processing ${employeeData.length} employee records from attachment data...\n`);

    let imported = 0;
    let skipped = 0; 
    let errors = 0;

    for (const row of employeeData) {
      try {
        // Process the employee data  
        const employeeRecord = {
          employeeId: row['Emp Code'] || `EMP${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          firstName: (row['Name'] || '').split(' ')[0] || '',
          lastName: (row['Name'] || '').split(' ').slice(1).join(' ') || '',
          fullName: row['Name'] || '',
          email: row['Personal Email Id'] || row['Official Email Id'] || `${row['Emp Code']}@company.com`,
          phone: row['Contact No.'] || '',
          department: row['Department'] || 'General',
          position: row['Designation'] || 'Employee', 
          salary: processSalary(row['Salary Offered']),
          joinDate: excelDateToJSDate(row['DOJ']) || new Date(),
          status: row['Status'] === 'Confirmed' ? 'Active' : (row['Status'] === 'Abscond' ? 'Inactive' : 'Active'),
          manager: row['Reporting Manager'] || '',
          experience: row['Experience'] || 'Fresher',
          dateOfBirth: excelDateToJSDate(row['DOB']),
          gender: row['Gender'] || '',
          maritalStatus: row['Martial Status'] || row['Marital Status'] || '',
          qualification: row['Qualification'] || '',
          panCard: row['PanCard No'] || '',
          aadharCard: row['Aadhar Card No'] || '',
          address: {
            current: row['Current Address'] || '',
            permanent: row['Permanent Address'] || '', 
            city: (row['Branch'] || '').split(',')[0] || '',
            state: '',
            country: 'India'
          },
          bankDetails: {
            accountNumber: row['Bank Account No.'] || '',
            ifscCode: row['IFSC Code'] || '',
            bankName: row['Bank Name'] || '',
            branch: row['Bank Branch'] || ''
          },
          emergencyContact: {
            name: row['Emergency Contact Name'] || '',
            phone: row['Emergency Contact No.'] || '',
            relationship: row['Relationship'] || ''
          },
          company: row['Company'] || '',
          branch: row['Branch'] || ''
        };

        // Check if employee already exists
        const existingEmployee = await Employee.findOne({
          $or: [
            { employeeId: employeeRecord.employeeId },
            { email: employeeRecord.email }
          ]
        });

        if (existingEmployee) {
          console.log(`⚠️ Employee already exists: ${employeeRecord.fullName} (${employeeRecord.employeeId})`);
          skipped++;
          continue;
        }

        // Create new employee
        const employee = new Employee(employeeRecord);
        await employee.save();
        imported++;

        console.log(`✅ Imported employee: ${employee.fullName} (${employee.employeeId})`);

      } catch (error) {
        console.error(`❌ Error importing employee ${row['Name'] || 'Unknown'}:`, error.message);
        errors++;
      }
    }

    console.log('\n🎉 Import Summary:');
    console.log(`   ✅ Successfully imported: ${imported}`); 
    console.log(`   ⚠️ Skipped (duplicates/invalid): ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total processed: ${employeeData.length}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  }
}