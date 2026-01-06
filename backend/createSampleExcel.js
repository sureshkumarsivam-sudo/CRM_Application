const xlsx = require('xlsx');
const path = require('path');

// Your employee data from the attachment
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
    "Name": "RAJKUMAR",
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
    "Name": "KOTTISWARI",
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
    "Name": "SUBBULAKSHMI",
    "Relationship": "MOTHER"
  }
];

// Create Excel file
try {
  const ws = xlsx.utils.json_to_sheet(employeeData);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Employee_Data");
  
  const filePath = path.join(__dirname, '../../Employee_Data_New.xlsx');
  xlsx.writeFile(wb, filePath);
  
  console.log('✅ Created Excel file:', filePath);
  console.log('📊 Contains', employeeData.length, 'employee records');
  
} catch (error) {
  console.error('❌ Error creating Excel file:', error);
}