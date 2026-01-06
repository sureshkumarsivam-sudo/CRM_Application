const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const path = require('path');

async function simpleTest() {
  try {
    const excelFile = path.join(__dirname, '../../Employee_Data_New.xlsx');
    
    if (!fs.existsSync(excelFile)) {
      console.log('Excel file not found:', excelFile);
      return;
    }

    console.log('Testing import...');
    
    const form = new FormData();
    form.append('excelFile', fs.createReadStream(excelFile));

    const response = await axios.post('http://localhost:5000/api/employees/import', form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });

    console.log('Success:', response.data.success);
    console.log('Message:', response.data.message);
    console.log('Imported:', response.data.data.imported);
    console.log('Total Rows:', response.data.data.totalRows);
    console.log('Errors:', response.data.data.errors?.length || 0);

    if (response.data.data.errors?.length > 0) {
      response.data.data.errors.forEach((error, i) => {
        console.log(`Error ${i+1}:`, error.substring(0, 100));
      });
    }

  } catch (error) {
    console.log('Test failed:', error.message);
    if (error.response?.data) {
      console.log('Response:', error.response.data);
    }
  }
}

simpleTest();