const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const StatusCode = require('../models/StatusCode');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crmdb';

async function seedStatusCodesFromCSV() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing status codes
    console.log('🗑️  Clearing existing status codes...');
    await StatusCode.deleteMany({});
    console.log('✅ Existing status codes cleared');

    const statusCodes = [];
    const csvFilePath = path.join(__dirname, '../../../Status_Code.csv');

    console.log('📂 Reading CSV file:', csvFilePath);

    // Check if file exists
    if (!fs.existsSync(csvFilePath)) {
      console.error('❌ CSV file not found at:', csvFilePath);
      process.exit(1);
    }

    // Read CSV file
    const readStream = fs.createReadStream(csvFilePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim()
      }));

    for await (const row of readStream) {
      // Map CSV columns to schema fields
      const statusCode = {
        code: (row['Status Code'] || '').trim().toUpperCase().replace(/\s+/g, '_'),
        description: (row['Description'] || '').trim(),
        category: (row['Category'] || 'Neutral').trim(),
        nextActionTrigger: (row['Next Action Trigger'] || '').trim(),
        responsible: (row['Responsible'] || '').trim(),
        autoEscalationLogic: (row['Auto Escalation Logic'] || '').trim(),
        isActive: true
      };

      // Skip empty rows
      if (statusCode.code && statusCode.description) {
        statusCodes.push(statusCode);
      }
    }

    console.log(`📊 Found ${statusCodes.length} status codes to import`);

    // Insert status codes
    if (statusCodes.length > 0) {
      const result = await StatusCode.insertMany(statusCodes, { ordered: false });
      console.log(`✅ Successfully imported ${result.length} status codes`);

      // Display summary
      const summary = await StatusCode.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]);

      console.log('\n📈 Summary by Category:');
      summary.forEach(item => {
        console.log(`   - ${item._id}: ${item.count}`);
      });
      console.log(`   - Total: ${statusCodes.length}`);
    } else {
      console.log('⚠️  No valid status codes found in CSV file');
    }

    console.log('\n✅ Status code seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding status codes:', error.message);
    if (error.writeErrors) {
      console.error('Write errors:', error.writeErrors);
    }
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

// Run the seed function
if (require.main === module) {
  seedStatusCodesFromCSV();
}

module.exports = { seedStatusCodesFromCSV };
