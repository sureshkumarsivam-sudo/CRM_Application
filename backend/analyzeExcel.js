const xlsx = require('xlsx');
const path = require('path');

// Check both Excel files
const files = [
  'D:\\AI\\VSCODE\\CRM\\Employe Details1.xlsx',
  'D:\\AI\\VSCODE\\CRM\\Employe Details1 - Copy.xlsx'
];

for (const filePath of files) {
  try {
    console.log('\n🔍 Analyzing file:', filePath);
    
    const workbook = xlsx.readFile(filePath);
    console.log('📋 Available sheets:', workbook.SheetNames);
    
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n📄 Analyzing sheet: "${sheetName}"`);
      const worksheet = workbook.Sheets[sheetName];
      
      // Get range
      const range = xlsx.utils.decode_range(worksheet['!ref'] || 'A1');
      console.log('📏 Range:', worksheet['!ref']);
      
      // Try different parsing methods
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      console.log('📊 JSON rows:', jsonData.length);
      
      const arrayData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      console.log('📊 Array rows:', arrayData.length);
      
      const csvData = xlsx.utils.sheet_to_csv(worksheet);
      console.log('📊 CSV length:', csvData.length);
      
      // Show raw content
      console.log('🔍 First few cells:');
      for (let row = range.s.r; row <= Math.min(range.e.r, range.s.r + 2); row++) {
        for (let col = range.s.c; col <= Math.min(range.e.c, range.s.c + 4); col++) {
          const cellAddress = xlsx.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          if (cell) {
            console.log(`  ${cellAddress}: ${cell.v}`);
          }
        }
      }
      
      if (arrayData.length > 0) {
        console.log('🔍 First 3 array rows:', arrayData.slice(0, 3));
      }
      
      if (jsonData.length > 0) {
        console.log('🔍 First JSON row:', JSON.stringify(jsonData[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error reading file:', filePath, error.message);
  }
}