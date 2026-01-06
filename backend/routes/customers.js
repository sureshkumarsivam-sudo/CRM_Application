const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

// Configure multer for CSV file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Get all customers with pagination, search, and filtering
router.get('/', async (req, res) => {
  try {
    console.log('📋 Customers list request:', req.query);
    
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      state,
      city,
      team
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { accountName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNo: { $regex: search, $options: 'i' } },
        { mobileNo: { $regex: search, $options: 'i' } },
        { loanId: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (status) query.status = status;
    if (state) query.state = { $regex: state, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (team) query.team = { $regex: team, $options: 'i' };

    console.log('📊 Query:', JSON.stringify(query, null, 2));

    // Get total count for pagination
    const total = await Customer.countDocuments(query);
    console.log('📈 Total customers found:', total);

    // Get customers
    const customers = await Customer.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    console.log('📋 Customers returned:', customers.length);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    const response = {
      success: true,
      data: customers,
      pagination: {
        current: pageNum,
        total: totalPages,
        hasNext,
        hasPrev,
        totalRecords: total,
        limit: limitNum
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get unique filter options from all customers
router.get('/filter-options', async (req, res) => {
  try {
    console.log('📋 Fetching filter options...');

    // Get distinct values for each filter field
    const [productTypes, accountStatuses, allocations, callerNames, teamLeaders, managers] = await Promise.all([
      Customer.distinct('productType').then(values => values.filter(Boolean).sort()),
      Customer.distinct('accountStatus').then(values => values.filter(Boolean).sort()),
      Customer.distinct('allocation').then(values => values.filter(Boolean).sort()),
      Customer.distinct('callerName').then(values => values.filter(Boolean).sort()),
      Customer.distinct('teamLeader').then(values => values.filter(Boolean).sort()),
      Customer.distinct('manager').then(values => values.filter(Boolean).sort())
    ]);

    const filterOptions = {
      productType: productTypes,
      accountStatus: accountStatuses,
      allocation: allocations,
      callerName: callerNames,
      teamLeader: teamLeaders,
      manager: managers
    };

    console.log('📊 Filter options:', filterOptions);

    res.json({
      success: true,
      data: filterOptions
    });

  } catch (error) {
    console.error('❌ Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching filter options',
      error: error.message
    });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
});

// Get customer by loan ID
router.get('/loan/:loanId', async (req, res) => {
  try {
    // Trim and make case-insensitive search
    const searchLoanId = req.params.loanId.trim();
    const customer = await Customer.findOne({ 
      loanId: { $regex: new RegExp(`^${searchLoanId}$`, 'i') }
    });
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found. Please search for a valid account number'
      });
    }

    res.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error fetching customer by loan ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer',
      error: error.message
    });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const customerData = req.body;

    // Check if loan ID already exists
    const existingCustomer = await Customer.findOne({ loanId: customerData.loanId });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this Loan ID already exists'
      });
    }

    const customer = new Customer(customerData);
    const savedCustomer = await customer.save();

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: savedCustomer
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this Loan ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates._id; // Remove _id from updates to prevent conflicts

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updates,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this Loan ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully',
      data: customer
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
});

// Bulk delete customers
router.delete('/', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of customer IDs'
      });
    }

    const result = await Customer.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} customers deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error bulk deleting customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customers',
      error: error.message
    });
  }
});

// Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    console.log('📊 Dashboard stats request received');
    
    // Basic counts first
    const totalCustomers = await Customer.countDocuments();
    console.log('Total customers:', totalCustomers);
    
    const activeCustomers = await Customer.countDocuments({ status: 'Active' });
    console.log('Active customers:', activeCustomers);
    
    const overdueCustomers = await Customer.countDocuments({ totalOverDue: { $gt: 0 } });
    console.log('Overdue customers:', overdueCustomers);
    
    const npaCustomers = await Customer.countDocuments({ status: 'NPA' });
    console.log('NPA customers:', npaCustomers);

    // Aggregation for amounts
    let totalSanctionAmount = 0;
    let totalOverdueAmount = 0;
    
    try {
      const sanctionResult = await Customer.aggregate([
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: { 
                $cond: [
                  { $and: [{ $ne: ['$sanctionAmount', null] }, { $ne: ['$sanctionAmount', ''] }] },
                  '$sanctionAmount',
                  0
                ]
              }
            }
          }
        }
      ]);
      totalSanctionAmount = sanctionResult[0]?.total || 0;
      console.log('Total sanction amount:', totalSanctionAmount);
    } catch (err) {
      console.error('Error calculating sanction amount:', err);
    }

    try {
      const overdueResult = await Customer.aggregate([
        { 
          $group: { 
            _id: null, 
            total: { 
              $sum: { 
                $cond: [
                  { $and: [{ $ne: ['$totalOverDue', null] }, { $ne: ['$totalOverDue', ''] }] },
                  '$totalOverDue',
                  0
                ]
              }
            }
          }
        }
      ]);
      totalOverdueAmount = overdueResult[0]?.total || 0;
      console.log('Total overdue amount:', totalOverdueAmount);
    } catch (err) {
      console.error('Error calculating overdue amount:', err);
    }

    // Get customers by state (all states in descending order)
    let customersByState = [];
    try {
      customersByState = await Customer.aggregate([
        { 
          $match: { 
            state: { $ne: null, $ne: '', $exists: true } 
          }
        },
        { $group: { _id: '$state', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      console.log('Customers by state:', customersByState.length);
    } catch (err) {
      console.error('Error getting customers by state:', err);
    }

    // Get recent customers
    let recentCustomers = [];
    try {
      recentCustomers = await Customer.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('accountName loanId sanctionAmount status createdAt')
        .lean();
      console.log('Recent customers:', recentCustomers.length);
    } catch (err) {
      console.error('Error getting recent customers:', err);
    }

    const response = {
      success: true,
      data: {
        summary: {
          totalCustomers,
          activeCustomers,
          overdueCustomers,
          npaCustomers,
          totalSanctionAmount,
          totalOverdueAmount
        },
        customersByState,
        recentCustomers
      }
    };

    console.log('✅ Dashboard stats response ready');
    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Helper function to safely parse date values
function parseDate(value) {
  if (!value || value === '-' || value.trim() === '') {
    return undefined; // Don't set the field at all if invalid
  }
  return value;
}

// Helper function to safely parse float values
function parseFloatSafe(value) {
  if (!value || value === '-' || isNaN(value)) {
    return 0;
  }
  return parseFloat(value);
}

// Helper function to safely parse integer values
function parseIntSafe(value) {
  if (!value || value === '-' || isNaN(value)) {
    return 0;
  }
  return parseInt(value);
}

// Helper function to get CSV value with fallback for trailing space
function getCSVValue(row, fieldName, defaultValue = '') {
  return row[fieldName] || row[fieldName + ' '] || defaultValue;
}

// Helper function to build customer data from CSV row
function buildCustomerData(row) {
  const data = {
    // Basic Account Information
    loanId: getCSVValue(row, 'Loan Account Number'),
    parent: getCSVValue(row, 'Parent Id'),
    accountName: getCSVValue(row, 'Customer Name'), // Changed from 'Account Name'
    customerName: getCSVValue(row, 'Customer Name'),
    productType: getCSVValue(row, 'Product Type', 'PL'),
    
    // Financial Details
    totalOutstanding: parseFloatSafe(getCSVValue(row, 'Total Outstanding', '0')),
    principalOutstanding: parseFloatSafe(getCSVValue(row, 'Principal Outstanding', '0')),
    interestCharges: parseFloatSafe(getCSVValue(row, 'Interest Charges', '0')),
    otherCharges: parseFloatSafe(getCSVValue(row, 'Other Charges (Unpaid due)', '0')),
    loanAmount: parseFloatSafe(getCSVValue(row, 'Loan Amount', '0')),
    rateOfInterest: getCSVValue(row, 'Rate of Interest'),
    tenure: parseIntSafe(getCSVValue(row, 'Tenure', '0')),
    emiAmount: parseFloatSafe(getCSVValue(row, 'EMI Amount', '0')),
    totalRepayableAmount: parseFloatSafe(getCSVValue(row, 'Total Repayable Amount', '0')),
    paidEmiCount: parseIntSafe(getCSVValue(row, 'Paid Emi count', '0')),
    paidEmiAmount: parseFloatSafe(getCSVValue(row, 'Paid Emi Amount', '0')),
    pendingEmiCount: parseIntSafe(getCSVValue(row, 'Pending Emi count', '0')),
    pendingEmiAmount: parseFloatSafe(getCSVValue(row, 'Pending Emi amount', '0')),
    
    // Account Status
    dpdBucket: getCSVValue(row, 'DPD/Bucket'),
    accountStatus: getCSVValue(row, 'Account Status', 'ACTIVE'),
    
    // Loan Dates
    sanctionAmount: parseFloatSafe(getCSVValue(row, 'Sanction Amount', '0')),
    disbursementAmount: parseFloatSafe(getCSVValue(row, 'Disbursement Amount', '0')),
    lastPaidAmount: parseFloatSafe(getCSVValue(row, 'Last Paid Amount', '0')),
    
    // Personal Information
    fatherName: getCSVValue(row, 'Father Name'),
    motherName: getCSVValue(row, 'Mother Name'),
    spouseName: getCSVValue(row, 'Spouse Name'),
    pan: getCSVValue(row, 'Pan Number'),
    aadhaarNumber: getCSVValue(row, 'Aadhaar number'),
    voterId: getCSVValue(row, 'Voter id Number'),
    drivingLicence: getCSVValue(row, 'Driving Licence Number'),
    designation: getCSVValue(row, 'Designation'),
    
    // Contact Information
    registeredMobile: getCSVValue(row, 'Registered Mobile'),
    alternateMobile: getCSVValue(row, 'Alternate Mobile'),
    email: getCSVValue(row, 'Email ID'),
    
    // Address Details
    residentialAddress: getCSVValue(row, 'Residential Address'),
    location: getCSVValue(row, 'Location'),
    pin: getCSVValue(row, 'Pin code'),
    state: getCSVValue(row, 'State'),
    
    // Employer Details
    employerName: getCSVValue(row, 'Employer Name'),
    employerAddress: getCSVValue(row, 'Employer  Address'),
    employerLocation: getCSVValue(row, 'Location'), // Employer Location same as Location
    employerPin: getCSVValue(row, 'Pin code'), // Employer Pin same as Pin code
    employerState: getCSVValue(row, 'State'), // Employer State same as State
    officialMailId: getCSVValue(row, 'Official  Mail id'),
    occupationType: getCSVValue(row, 'Occupation type'),
    employmentJobSector: getCSVValue(row, 'Employement Job Sector'),
    
    // Allocation & Team
    allocation: getCSVValue(row, 'Allocation'),
    callerName: getCSVValue(row, 'Caller Name'),
    teamLeader: getCSVValue(row, 'Team Leader'),
    manager: getCSVValue(row, 'Manager'),
    
    // Calling Status
    callingStatusCodes: getCSVValue(row, 'Calling Status Codes'),
    remarks: getCSVValue(row, 'Remarks'),
    lastConnectedNumber: getCSVValue(row, 'Last connected Connected Number'),
    
    // Field Status
    fieldStatusCodes: getCSVValue(row, 'Field status Codes'),
    fieldRemarks: getCSVValue(row, 'Field Remarks'),
    
    // Settlement Information
    settlementType: getCSVValue(row, 'SETTLEMENT TYPE'),
    settlementAmount: parseFloatSafe(getCSVValue(row, 'SETTLEMENT AMOUNT', '0')),
    installments: parseIntSafe(getCSVValue(row, 'INSTALLMENTS', '0')),
    paidAmount: parseFloatSafe(getCSVValue(row, 'PAID AMOUNT', '0')),
    settlementStatus: getCSVValue(row, 'SETTLEMENT STATUS')
  };

  // Handle date fields - only add if they have valid values
  const dob = parseDate(getCSVValue(row, 'Date of Birth'));
  if (dob) data.dob = dob;
  
  const sanctionDate = parseDate(getCSVValue(row, 'Sanction Date'));
  if (sanctionDate) data.sanctionDate = sanctionDate;
  
  const disbursementDate = parseDate(getCSVValue(row, 'Disbursement Date'));
  if (disbursementDate) data.disbursementDate = disbursementDate;
  
  const emiStartDate = parseDate(getCSVValue(row, 'EMI start Date'));
  if (emiStartDate) data.emiStartDate = emiStartDate;
  
  const maturityDate = parseDate(getCSVValue(row, 'Maturity Date'));
  if (maturityDate) data.maturityDate = maturityDate;
  
  const lastPaymentDate = parseDate(getCSVValue(row, 'Last Payment Date'));
  if (lastPaymentDate) data.lastPaymentDate = lastPaymentDate;
  
  const dateOfNPA = parseDate(getCSVValue(row, 'Date of NPA'));
  if (dateOfNPA) data.dateOfNPA = dateOfNPA;
  
  const lastConnectedDate = parseDate(getCSVValue(row, 'Last Connected date'));
  if (lastConnectedDate) data.lastConnectedDate = lastConnectedDate;
  
  const lastFieldVisitedDate = parseDate(getCSVValue(row, 'Last Field visted Date'));
  if (lastFieldVisitedDate) data.lastFieldVisitedDate = lastFieldVisitedDate;

  // Gender field - only set if it has a valid enum value
  const gender = getCSVValue(row, 'Gender');
  if (gender && (gender === 'Male' || gender === 'Female' || gender === 'OTHER')) {
    data.gender = gender;
  }

  return data;
}

// Upload CSV file with customer data
router.post('/upload-csv', upload.single('file'), async (req, res) => {
  console.log('📤 CSV upload request received');
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  const filePath = req.file.path;
  const overwriteMode = req.body.overwrite === 'true' || req.body.overwrite === true;
  const records = [];
  let imported = 0;
  let updated = 0;
  let duplicates = 0;
  let errors = 0;
  const errorDetails = [];

  try {
    // Read and parse CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({
          mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').trim() // Remove BOM and trim
        }))
        .on('data', (row) => {
          records.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Parsed ${records.length} records from CSV (Overwrite mode: ${overwriteMode})`);

    // Process records in batches
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      for (const row of batch) {
        try {
          const loanId = row['Loan Account Number'] || row['Loan Account Number '];
          
          if (!loanId) {
            errors++;
            errorDetails.push({ row: i + 1, error: 'Missing Loan Account Number' });
            continue;
          }

          // Check for duplicate
          const existing = await Customer.findOne({ loanId });
          if (existing) {
            if (overwriteMode) {
              // Update existing record
              await Customer.findOneAndUpdate(
                { loanId },
                { $set: buildCustomerData(row) }
              );
              updated++;
            } else {
              duplicates++;
            }
            continue;
          }

          // Create customer record using helper function
          const customerData = buildCustomerData(row);
          await Customer.create(customerData);
          imported++;
          
        } catch (err) {
          console.error(`Error processing record ${row['Loan Account Number']}:`, err.message);
          errors++;
          errorDetails.push({ 
            loanId: row['Loan Account Number'], 
            error: err.message 
          });
        }
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    console.log(`✅ CSV import completed: ${imported} imported, ${updated} updated, ${duplicates} duplicates, ${errors} errors`);

    res.json({
      success: true,
      imported,
      updated,
      duplicates,
      errors,
      total: records.length,
      errorDetails: errors > 0 ? errorDetails.slice(0, 10) : [] // Return first 10 errors
    });

  } catch (error) {
    console.error('❌ Error processing CSV file:', error);
    
    // Clean up uploaded file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(500).json({
      success: false,
      message: 'Error processing CSV file',
      error: error.message
    });
  }
});

// Delete a single customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Delete customer request: ${id}`);

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    console.log(`✅ Customer deleted: ${customer.loanId}`);

    res.json({
      success: true,
      message: 'Customer deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('❌ Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
});

// Bulk delete customers
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    console.log(`🗑️ Bulk delete request: ${ids?.length} customers`);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No customer IDs provided'
      });
    }

    const result = await Customer.deleteMany({ _id: { $in: ids } });

    console.log(`✅ Bulk delete completed: ${result.deletedCount} customers deleted`);

    res.json({
      success: true,
      message: `${result.deletedCount} customers deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('❌ Error bulk deleting customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customers',
      error: error.message
    });
  }
});

module.exports = router;