/**
 * API Testing Script for PTP Payments Endpoint
 * Tests the /api/ptp-payments endpoint to ensure data is being served correctly
 */

const axios = require('axios');
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testAPI() {
  console.log('='.repeat(70));
  console.log(`${colors.bright}🧪 PTP Payments API Testing Suite${colors.reset}`);
  console.log('='.repeat(70));
  console.log(`API Base URL: ${colors.cyan}${API_BASE_URL}${colors.reset}\n`);
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Test 1: Health Check
  console.log(`${colors.bright}Test 1: Health Check${colors.reset}`);
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      console.log(`${colors.green}✅ PASSED${colors.reset} - Server is running`);
      console.log(`   Status: ${response.data.status}`);
      console.log(`   MongoDB: ${response.data.mongodb}`);
      passedTests++;
    }
  } catch (error) {
    console.log(`${colors.red}❌ FAILED${colors.reset} - Server not responding`);
    console.log(`   Error: ${error.message}`);
    console.log(`   ${colors.yellow}Make sure backend server is running: npm start${colors.reset}`);
    failedTests++;
    return;
  }
  
  console.log('');
  
  // Test 2: Get All PTP Payments (Basic)
  console.log(`${colors.bright}Test 2: Get All PTP Payments${colors.reset}`);
  try {
    const response = await axios.get(`${API_BASE_URL}/ptp-payments`, {
      timeout: 10000
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✅ PASSED${colors.reset} - API returned data`);
      console.log(`   Total Records: ${response.data.pagination?.totalRecords || 0}`);
      console.log(`   Records Returned: ${response.data.data?.length || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        const firstRecord = response.data.data[0];
        console.log(`   Sample Record:`);
        console.log(`     - Account: ${firstRecord.accountNumber}`);
        console.log(`     - Customer: ${firstRecord.customerName || '❌ MISSING'}`);
        console.log(`     - Amount: ₹${firstRecord.ptpAmount?.toLocaleString()}`);
        console.log(`     - Status: ${firstRecord.status}`);
      }
      passedTests++;
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.log(`${colors.red}❌ FAILED${colors.reset} - Could not fetch PTP payments`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 3: Get PTP Payments with Filters
  console.log(`${colors.bright}Test 3: Get PTP Payments with Status Filter${colors.reset}`);
  try {
    const response = await axios.get(`${API_BASE_URL}/ptp-payments`, {
      params: { status: 'COLLECTED', limit: 10 },
      timeout: 10000
    });
    
    if (response.status === 200 && response.data.success) {
      const collectedCount = response.data.data?.length || 0;
      console.log(`${colors.green}✅ PASSED${colors.reset} - Filter working`);
      console.log(`   Collected Payments: ${collectedCount}`);
      
      // Verify all returned records have COLLECTED status
      const allCollected = response.data.data.every(p => p.status === 'COLLECTED');
      if (allCollected || collectedCount === 0) {
        console.log(`   ${colors.green}✓${colors.reset} Status filter verified`);
      } else {
        console.log(`   ${colors.yellow}⚠${colors.reset} Status filter may not be working correctly`);
      }
      passedTests++;
    }
  } catch (error) {
    console.log(`${colors.red}❌ FAILED${colors.reset} - Filter test failed`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 4: Get PTP Payments with Search
  console.log(`${colors.bright}Test 4: Search Functionality${colors.reset}`);
  try {
    const response = await axios.get(`${API_BASE_URL}/ptp-payments`, {
      params: { search: 'ACC', limit: 5 },
      timeout: 10000
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✅ PASSED${colors.reset} - Search working`);
      console.log(`   Results Found: ${response.data.data?.length || 0}`);
      passedTests++;
    }
  } catch (error) {
    console.log(`${colors.red}❌ FAILED${colors.reset} - Search test failed`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 5: Get Filter Options
  console.log(`${colors.bright}Test 5: Get Filter Options${colors.reset}`);
  try {
    const response = await axios.get(`${API_BASE_URL}/ptp-payments/filters`, {
      timeout: 5000
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✅ PASSED${colors.reset} - Filter options available`);
      console.log(`   Statuses: ${response.data.data?.statuses?.length || 0}`);
      console.log(`   Callers: ${response.data.data?.callerNames?.length || 0}`);
      console.log(`   Team Leaders: ${response.data.data?.teamLeaders?.length || 0}`);
      passedTests++;
    }
  } catch (error) {
    console.log(`${colors.red}❌ FAILED${colors.reset} - Filter options test failed`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 6: Get Summary Statistics
  console.log(`${colors.bright}Test 6: Get Summary Statistics${colors.reset}`);
  try {
    const response = await axios.get(`${API_BASE_URL}/ptp-payments/summary`, {
      timeout: 5000
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✅ PASSED${colors.reset} - Summary data available`);
      console.log(`   Total Records: ${response.data.data?.totalRecords || 0}`);
      console.log(`   Collected: ${response.data.data?.collected || 0}`);
      console.log(`   Pending: ${response.data.data?.pending || 0}`);
      passedTests++;
    }
  } catch (error) {
    console.log(`${colors.red}❌ FAILED${colors.reset} - Summary test failed`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    failedTests++;
  }
  
  console.log('');
  
  // Test 7: Check Customer Name in All Records
  console.log(`${colors.bright}Test 7: Verify Customer Names in Data${colors.reset}`);
  try {
    const response = await axios.get(`${API_BASE_URL}/ptp-payments`, {
      params: { limit: 100 },
      timeout: 10000
    });
    
    if (response.status === 200 && response.data.success && response.data.data.length > 0) {
      const totalRecords = response.data.data.length;
      const withCustomerName = response.data.data.filter(p => p.customerName && p.customerName.trim() !== '').length;
      const missingCustomerName = totalRecords - withCustomerName;
      
      if (missingCustomerName === 0) {
        console.log(`${colors.green}✅ PASSED${colors.reset} - All records have customer names`);
        console.log(`   Checked: ${totalRecords} records`);
        passedTests++;
      } else {
        console.log(`${colors.yellow}⚠ PARTIAL${colors.reset} - Some records missing customer names`);
        console.log(`   Total Records: ${totalRecords}`);
        console.log(`   With Customer Name: ${withCustomerName}`);
        console.log(`   Missing Customer Name: ${missingCustomerName}`);
        console.log(`   ${colors.yellow}Action: Run 'node scripts/fixCustomerNames.js'${colors.reset}`);
        failedTests++;
      }
    } else {
      console.log(`${colors.yellow}⚠ SKIPPED${colors.reset} - No data to check`);
    }
  } catch (error) {
    console.log(`${colors.red}❌ FAILED${colors.reset} - Customer name verification failed`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
    failedTests++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.bright}📊 Test Results Summary${colors.reset}`);
  console.log('='.repeat(70));
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`Total Tests: ${passedTests + failedTests}`);
  
  if (failedTests === 0) {
    console.log(`\n${colors.green}${colors.bright}✨ All tests passed! API is working correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}${colors.bright}⚠ Some tests failed. Check the logs above for details.${colors.reset}`);
  }
  console.log('='.repeat(70));
}

// Run tests
testAPI().catch(error => {
  console.error(`\n${colors.red}Fatal Error:${colors.reset}`, error.message);
  process.exit(1);
});
