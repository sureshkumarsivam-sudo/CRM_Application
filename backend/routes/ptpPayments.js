const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { Readable } = require('stream');
const PTPPayment = require('../models/PTPPayment');
const Customer = require('../models/Customer');

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to parse date
const parseDate = (dateString) => {
  if (!dateString || dateString === '-' || dateString.trim() === '') {
    return undefined;
  }
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date;
};

// Helper function to parse float safely
const parseFloatSafe = (value) => {
  if (!value || value === '-') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// GET /api/ptp-payments - List all PTP payments with filters and pagination
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('📥 GET /api/ptp-payments - Request received');
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    
    const {
      page = 1,
      limit = 50,
      search = '',
      status = '',
      callerName = '',
      amAndTL = '',
      process = '',
      paymentDateFrom = '',
      paymentDateTo = '',
      sortBy = 'paymentDate',
      sortOrder = 'desc'
    } = req.query;

    console.log('📋 Request Parameters:', { 
      page, limit, search, status, callerName, amAndTL, process 
    });

    // Check MongoDB connection
    if (!PTPPayment.db || !PTPPayment.db.readyState || PTPPayment.db.readyState !== 1) {
      console.error('❌ MongoDB connection not ready');
      return res.status(503).json({
        success: false,
        message: 'Database connection not available',
        error: 'MongoDB connection state: ' + (PTPPayment.db ? PTPPayment.db.readyState : 'undefined')
      });
    }

    // Build query
    const query = {};

    // Search across multiple fields
    if (search) {
      query.$or = [
        { accountNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } }
      ];
      console.log(`🔍 Search query: "${search}"`);
    }

    // Status filter
    if (status && status !== 'All Status') {
      query.status = status;
      console.log(`📌 Status filter: ${status}`);
    }

    // Caller name filter
    if (callerName && callerName !== 'All Callers') {
      query.callerName = callerName;
      console.log(`👤 Caller filter: ${callerName}`);
    }

    // AM & TL filter
    if (amAndTL && amAndTL !== 'All Team Leaders') {
      query.amAndTL = amAndTL;
      console.log(`👥 Team Leader filter: ${amAndTL}`);
    }

    // Process filter
    if (process && process !== 'All Processes') {
      query.process = process;
      console.log(`⚙️ Process filter: ${process}`);
    }

    // Payment date range filter
    if (paymentDateFrom || paymentDateTo) {
      query.paymentDate = {};
      if (paymentDateFrom) {
        query.paymentDate.$gte = new Date(paymentDateFrom);
      }
      if (paymentDateTo) {
        const toDate = new Date(paymentDateTo);
        toDate.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = toDate;
      }
      console.log(`📅 Date filter: ${paymentDateFrom} to ${paymentDateTo}`);
    }

    console.log('📊 MongoDB Query:', JSON.stringify(query, null, 2));

    // Get total count
    console.log('🔢 Counting documents...');
    const totalRecords = await PTPPayment.countDocuments(query);
    console.log(`   Total matching records: ${totalRecords}`);

    if (totalRecords === 0) {
      console.log('⚠️  No records found in database');
      console.log('   TIP: Run "node scripts/verifyPTPPayments.js" to check database');
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    console.log(`🔄 Sorting by: ${sortBy} (${sortOrder})`);

    // Get paginated results
    const skip = (parseInt(page) - 1) * parseInt(limit);
    console.log(`📄 Fetching records: skip=${skip}, limit=${limit}`);
    
    const ptpPayments = await PTPPayment.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log(`✅ Retrieved ${ptpPayments.length} records`);
    
    // Log sample record for debugging
    if (ptpPayments.length > 0) {
      const sample = ptpPayments[0];
      console.log('📋 Sample Record:');
      console.log(`   - Account: ${sample.accountNumber}`);
      console.log(`   - Customer: ${sample.customerName || '❌ MISSING'}`);
      console.log(`   - Amount: ₹${sample.ptpAmount}`);
      console.log(`   - Status: ${sample.status}`);
    }

    const responseTime = Date.now() - startTime;
    console.log(`⏱️  Response time: ${responseTime}ms`);

    res.json({
      success: true,
      data: ptpPayments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRecords / parseInt(limit)),
        totalRecords,
        limit: parseInt(limit)
      },
      meta: {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Error fetching PTP payments:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack}`);
    console.error(`   Response time: ${responseTime}ms`);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PTP payments',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/ptp-payments/filters - Get filter options
router.get('/filters', async (req, res) => {
  try {
    console.log('📥 GET /api/ptp-payments/filters');

    // Get unique values for filters
    const [callers, teamLeaders, processes, statuses] = await Promise.all([
      PTPPayment.distinct('callerName'),
      PTPPayment.distinct('amAndTL'),
      PTPPayment.distinct('process'),
      PTPPayment.distinct('status')
    ]);

    res.json({
      success: true,
      data: {
        callerNames: ['All Callers', ...callers.filter(Boolean).sort()],
        teamLeaders: ['All Team Leaders', ...teamLeaders.filter(Boolean).sort()],
        processes: ['All Processes', ...processes.filter(Boolean).sort()],
        statuses: ['All Status', 'PTP', 'COLLECTED', 'PDC', 'PART-PAYMENT', 'W-SETT']
      }
    });

  } catch (error) {
    console.error('❌ Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options',
      error: error.message
    });
  }
});

// GET /api/ptp-payments/summary - Get summary statistics
router.get('/summary', async (req, res) => {
  try {
    console.log('📥 GET /api/ptp-payments/summary');

    const { status, callerName, paymentDateFrom, paymentDateTo } = req.query;

    // Build query for filtered stats
    const query = {};
    if (status && status !== 'All Status') query.status = status;
    if (callerName && callerName !== 'All Callers') query.callerName = callerName;
    
    if (paymentDateFrom || paymentDateTo) {
      query.paymentDate = {};
      if (paymentDateFrom) query.paymentDate.$gte = new Date(paymentDateFrom);
      if (paymentDateTo) {
        const toDate = new Date(paymentDateTo);
        toDate.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = toDate;
      }
    }

    const [totalCount, todayPTPCount, collectedCount, pendingCount, totalAmount] = await Promise.all([
      PTPPayment.countDocuments(query),
      PTPPayment.countDocuments({
        ...query,
        paymentDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      PTPPayment.countDocuments({ ...query, status: 'COLLECTED' }),
      PTPPayment.countDocuments({ ...query, status: 'PTP' }),
      PTPPayment.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$ptpAmount' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalRecords: totalCount,
        todayPTP: todayPTPCount,
        collected: collectedCount,
        pending: pendingCount,
        totalAmount: totalAmount[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summary',
      error: error.message
    });
  }
});

// GET /api/ptp-payments/customer/:customerId - Get payment history for a customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    console.log(`📥 GET /api/ptp-payments/customer/${req.params.customerId}`);

    const payments = await PTPPayment.find({ customerId: req.params.customerId })
      .sort({ paymentDate: -1 })
      .lean();

    res.json(payments);
  } catch (error) {
    console.error('Error fetching customer payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
});

// GET /api/ptp-payments/account/:accountNumber - Get payment history for an account
router.get('/account/:accountNumber', async (req, res) => {
  try {
    console.log(`📥 GET /api/ptp-payments/account/${req.params.accountNumber}`);

    const payments = await PTPPayment.find({ accountNumber: req.params.accountNumber })
      .sort({ paymentDate: -1 })
      .lean();

    res.json(payments);
  } catch (error) {
    console.error('Error fetching account payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
});

// GET /api/ptp-payments/receipt/:paymentId - Get receipt for a payment
router.get('/receipt/:paymentId', async (req, res) => {
  try {
    console.log(`📥 GET /api/ptp-payments/receipt/${req.params.paymentId}`);

    const payment = await PTPPayment.findById(req.params.paymentId)
      .populate('customerId')
      .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch receipt',
      error: error.message
    });
  }
});

// POST /api/ptp-payments/receipt/:paymentId/resend - Resend receipt
router.post('/receipt/:paymentId/resend', async (req, res) => {
  try {
    console.log(`📥 POST /api/ptp-payments/receipt/${req.params.paymentId}/resend`);

    const payment = await PTPPayment.findById(req.params.paymentId)
      .populate('customerId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // TODO: Implement email/SMS sending logic here
    // For now, just return success
    res.json({
      success: true,
      message: 'Receipt sent successfully'
    });
  } catch (error) {
    console.error('Error resending receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend receipt',
      error: error.message
    });
  }
});

// GET /api/ptp-payments/:id - Get single PTP payment
router.get('/:id', async (req, res) => {
  try {
    console.log(`📥 GET /api/ptp-payments/${req.params.id}`);

    const ptpPayment = await PTPPayment.findById(req.params.id)
      .populate('customerId')
      .lean();

    if (!ptpPayment) {
      return res.status(404).json({
        success: false,
        message: 'PTP payment not found'
      });
    }

    res.json({
      success: true,
      data: ptpPayment
    });

  } catch (error) {
    console.error('❌ Error fetching PTP payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PTP payment',
      error: error.message
    });
  }
});

// POST /api/ptp-payments - Create new PTP payment
router.post('/', async (req, res) => {
  try {
    console.log('📥 POST /api/ptp-payments');
    console.log('📝 Request body:', req.body);

    const {
      accountNumber,
      customerName,
      ptpAmount,
      status,
      paymentDate,
      callerName,
      contactNumber,
      amAndTL,
      process,
      createdBy
    } = req.body;

    // Validate required fields
    if (!accountNumber || !customerName || !ptpAmount || !status || 
        !paymentDate || !callerName || !contactNumber || !amAndTL || !process) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Try to find matching customer
    const customer = await Customer.findOne({ loanId: accountNumber });

    const ptpPayment = new PTPPayment({
      accountNumber,
      customerName,
      ptpAmount: parseFloat(ptpAmount),
      status,
      paymentDate: new Date(paymentDate),
      callerName,
      contactNumber,
      amAndTL,
      process,
      customerId: customer?._id,
      createdBy: createdBy || { name: 'Admin', userId: 'admin123', role: 'Admin' }
    });

    await ptpPayment.save();

    console.log('✅ PTP payment created successfully:', ptpPayment._id);

    res.status(201).json({
      success: true,
      message: 'PTP payment created successfully',
      data: ptpPayment
    });

  } catch (error) {
    console.error('❌ Error creating PTP payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create PTP payment',
      error: error.message
    });
  }
});

// PUT /api/ptp-payments/:id - Update PTP payment
router.put('/:id', async (req, res) => {
  try {
    console.log(`📥 PUT /api/ptp-payments/${req.params.id}`);
    console.log('📝 Update data:', req.body);

    const {
      accountNumber,
      customerName,
      ptpAmount,
      status,
      paymentDate,
      callerName,
      contactNumber,
      amAndTL,
      process,
      modifiedBy
    } = req.body;

    const updateData = {
      accountNumber,
      customerName,
      ptpAmount: parseFloat(ptpAmount),
      status,
      paymentDate: new Date(paymentDate),
      callerName,
      contactNumber,
      amAndTL,
      process,
      modifiedBy: {
        ...modifiedBy,
        modifiedAt: new Date()
      }
    };

    const ptpPayment = await PTPPayment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!ptpPayment) {
      return res.status(404).json({
        success: false,
        message: 'PTP payment not found'
      });
    }

    console.log('✅ PTP payment updated successfully');

    res.json({
      success: true,
      message: 'PTP payment updated successfully',
      data: ptpPayment
    });

  } catch (error) {
    console.error('❌ Error updating PTP payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update PTP payment',
      error: error.message
    });
  }
});

// DELETE /api/ptp-payments/:id - Delete PTP payment
router.delete('/:id', async (req, res) => {
  try {
    console.log(`📥 DELETE /api/ptp-payments/${req.params.id}`);

    const ptpPayment = await PTPPayment.findByIdAndDelete(req.params.id);

    if (!ptpPayment) {
      return res.status(404).json({
        success: false,
        message: 'PTP payment not found'
      });
    }

    console.log('✅ PTP payment deleted successfully');

    res.json({
      success: true,
      message: 'PTP payment deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting PTP payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete PTP payment',
      error: error.message
    });
  }
});

// POST /api/ptp-payments/upload-excel - Upload Excel/CSV file
router.post('/upload-excel', upload.single('file'), async (req, res) => {
  try {
    console.log('📥 POST /api/ptp-payments/upload-excel');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const results = [];
    const errors = [];
    let imported = 0;
    let updated = 0;

    // Read and parse CSV file
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');
    const cleanedContent = fileContent.replace(/^\uFEFF/, ''); // Remove BOM

    const stream = Readable.from([cleanedContent]);

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          results.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Parsed ${results.length} rows from CSV`);

    // Process each row
    for (const [index, row] of results.entries()) {
      try {
        const accountNumber = row['ACCOUNT_NUMBER'] || row['Account Number'] || row['accountNumber'];
        const customerName = row['CUSTOMER_NAME'] || row['Customer Name'] || row['customerName'];
        const ptpAmount = parseFloatSafe(row['PTP_AMOUNT'] || row['PTP Amount'] || row['ptpAmount']);
        const status = row['STATUS'] || row['Status'] || row['status'] || 'PTP';
        const paymentDate = parseDate(row['PAYMENT_DATE'] || row['Payment Date'] || row['paymentDate']);
        const callerName = row['CALLER_NAME'] || row['Caller Name'] || row['callerName'];
        const contactNumber = row['CONTACT_NUMBER'] || row['Contact Number'] || row['contactNumber'];
        const amAndTL = row['AM_TL'] || row['AM & TL'] || row['amAndTL'];
        const process = row['PROCESS'] || row['Process'] || row['process'];

        if (!accountNumber || !customerName || !paymentDate) {
          errors.push({
            row: index + 1,
            error: 'Missing required fields (accountNumber, customerName, or paymentDate)',
            data: row
          });
          continue;
        }

        // Check if record already exists
        const existing = await PTPPayment.findOne({ accountNumber, paymentDate });

        if (existing) {
          // Update existing record
          await PTPPayment.findByIdAndUpdate(existing._id, {
            customerName,
            ptpAmount,
            status,
            callerName,
            contactNumber,
            amAndTL,
            process,
            modifiedBy: {
              name: 'System',
              userId: 'system',
              role: 'Admin',
              modifiedAt: new Date()
            }
          });
          updated++;
        } else {
          // Create new record
          const customer = await Customer.findOne({ loanId: accountNumber });
          
          await PTPPayment.create({
            accountNumber,
            customerName,
            ptpAmount,
            status,
            paymentDate,
            callerName,
            contactNumber,
            amAndTL,
            process,
            customerId: customer?._id,
            createdBy: {
              name: 'System',
              userId: 'system',
              role: 'Admin'
            }
          });
          imported++;
        }

      } catch (err) {
        errors.push({
          row: index + 1,
          error: err.message,
          data: row
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    console.log(`✅ Import complete: ${imported} imported, ${updated} updated, ${errors.length} errors`);

    res.json({
      success: true,
      message: 'File processed successfully',
      data: {
        totalRows: results.length,
        imported,
        updated,
        errors: errors.length,
        errorDetails: errors.slice(0, 10) // Return first 10 errors
      }
    });

  } catch (error) {
    console.error('❌ Error uploading file:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

module.exports = router;
