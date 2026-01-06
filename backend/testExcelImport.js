const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const path = require('path');

async function testExcelImport() {
  try {
    console.log('🧪 Testing Excel Import with New Format...\n');

    // Check if the Excel file exists
    const excelFile = path.join(__dirname, '../../Employee_Data_New.xlsx');
    
    if (!fs.existsSync(excelFile)) {
      console.error('❌ Excel file not found:', excelFile);
      return;
    }

    console.log('📁 Found Excel file:', excelFile);
    console.log('📊 File size:', (fs.statSync(excelFile).size / 1024).toFixed(2), 'KB');

    // Create form data
    const form = new FormData();
    form.append('excelFile', fs.createReadStream(excelFile));

    console.log('\n🚀 Sending import request to backend...');

    // Send the request
    const response = await axios.post('http://localhost:5000/api/employees/import', form, {
      headers: {
        ...form.getHeaders(),
      },
      timeout: 30000, // 30 seconds timeout
    });

    console.log('\n✅ Import Response:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('\n🎉 Import Success Summary:');
      console.log(`   📊 Total Rows: ${response.data.data.totalRows}`);
      console.log(`   ✅ Imported: ${response.data.data.imported}`);
      console.log(`   ⚠️  Errors: ${response.data.data.errors?.length || 0}`);
      
      if (response.data.data.errors?.length > 0) {
        console.log('\n❌ Import Errors:');
        response.data.data.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      console.error('   Details:', error.response.data.error);
    }
  }
}

// Run the test
testExcelImport();