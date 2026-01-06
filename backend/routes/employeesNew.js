const express = require('express');
const router = express.Router();
const EmployeeNew = require('../models/EmployeeNew');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/employees');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Get all employees with pagination, search, and filters
router.get('/', async (req, res) => {
  try {
    console.log('📥 GET /api/employees-new - Employee list request');
    
    const {
      page = 1,
      limit = 50,
      search = '',
      employmentStatus = '',
      status = '',
      branch = '',
      designation = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('📋 Employee list request:', { page, limit, search, employmentStatus, status, branch, designation });

    // Build query object
    const query = {};

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { employeeCode: searchRegex },
        { fullName: searchRegex },
        { designation: searchRegex },
        { branch: searchRegex },
        { emailId: searchRegex },
        { contactNumber: searchRegex }
      ];
    }

    // Add filters
    if (employmentStatus) query.employmentStatus = employmentStatus;
    if (status) query.status = status;
    if (branch) query.branch = new RegExp(branch, 'i');
    if (designation) query.designation = new RegExp(designation, 'i');

    console.log('📊 Query:', JSON.stringify(query, null, 2));

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [employees, totalCount] = await Promise.all([
      EmployeeNew.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      EmployeeNew.countDocuments(query)
    ]);

    console.log(`📈 Total employees found: ${totalCount}`);
    console.log(`📋 Employees returned: ${employees.length}`);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    const response = {
      success: true,
      data: employees,
      pagination: {
        current: pageNum,
        total: totalPages,
        hasNext,
        hasPrev,
        totalRecords: totalCount,
        limit: limitNum
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employees',
      error: error.message
    });
  }
});

// Get single employee by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('📥 GET /api/employees-new/:id - Fetching employee:', req.params.id);
    
    const employee = await EmployeeNew.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: employee
    });

  } catch (error) {
    console.error('❌ Error fetching employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee',
      error: error.message
    });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    console.log('📥 POST /api/employees-new - Creating new employee');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    // Check if employee code already exists
    const existingEmployee = await EmployeeNew.findOne({ employeeCode: req.body.employeeCode });
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee code already exists'
      });
    }

    const employee = new EmployeeNew(req.body);
    await employee.save();

    console.log('✅ Employee created successfully:', employee.employeeCode);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    });

  } catch (error) {
    console.error('❌ Error creating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating employee',
      error: error.message
    });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    console.log('📥 PUT /api/employees-new/:id - Updating employee:', req.params.id);
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const employee = await EmployeeNew.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.body.updatedBy || 'System' },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    console.log('✅ Employee updated successfully:', employee.employeeCode);

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: employee
    });

  } catch (error) {
    console.error('❌ Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating employee',
      error: error.message
    });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    console.log('📥 DELETE /api/employees-new/:id - Deleting employee:', req.params.id);
    
    const employee = await EmployeeNew.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    console.log('✅ Employee deleted successfully:', employee.employeeCode);

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employee',
      error: error.message
    });
  }
});

// Upload employee photo
router.post('/:id/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    console.log('📥 POST /api/employees-new/:id/upload-photo');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const employee = await EmployeeNew.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employee.uploadPhoto = {
      filename: req.file.filename,
      path: req.file.path,
      uploadDate: new Date()
    };

    await employee.save();

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: employee.uploadPhoto
    });

  } catch (error) {
    console.error('❌ Error uploading photo:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading photo',
      error: error.message
    });
  }
});

// Upload documents (generic endpoint for multiple document types)
router.post('/:id/upload-documents', upload.array('documents', 5), async (req, res) => {
  try {
    console.log('📥 POST /api/employees-new/:id/upload-documents');
    const { documentType } = req.body;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const employee = await EmployeeNew.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const documents = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      uploadDate: new Date()
    }));

    // Add documents to appropriate field based on type
    switch (documentType) {
      case 'educationalCertificates':
        employee.educationalCertificates.push(...documents);
        break;
      case 'experienceCertificate':
        employee.experienceCertificate.push(...documents);
        break;
      case 'lastSalarySlip':
        employee.lastSalarySlip.push(...documents);
        break;
      case 'aadharCard':
        employee.aadharCard.push(...documents);
        break;
      case 'panCard':
        employee.panCard.push(...documents);
        break;
      case 'voterIdDrivingLicense':
        employee.voterIdDrivingLicense.push(...documents);
        break;
      case 'offerLetterJoiningLetter':
        employee.offerLetterJoiningLetter.push(...documents);
        break;
      case 'otherDocuments':
        employee.otherDocuments.push(...documents);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid document type'
        });
    }

    await employee.save();

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      data: documents
    });

  } catch (error) {
    console.error('❌ Error uploading documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading documents',
      error: error.message
    });
  }
});

// Get employee statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    console.log('📥 GET /api/employees-new/stats/dashboard');
    
    const [totalEmployees, activeEmployees, inactiveEmployees, byStatus, byBranch, byDesignation] = await Promise.all([
      EmployeeNew.countDocuments(),
      EmployeeNew.countDocuments({ employmentStatus: 'Active' }),
      EmployeeNew.countDocuments({ employmentStatus: { $ne: 'Active' } }),
      EmployeeNew.aggregate([
        { $group: { _id: '$employmentStatus', count: { $sum: 1 } } }
      ]),
      EmployeeNew.aggregate([
        { $group: { _id: '$branch', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      EmployeeNew.aggregate([
        { $group: { _id: '$designation', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    const stats = {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item._id || 'Unknown'] = item.count;
        return acc;
      }, {}),
      byBranch: byBranch.map(item => ({
        branch: item._id || 'Unknown',
        count: item.count
      })),
      byDesignation: byDesignation.map(item => ({
        designation: item._id || 'Unknown',
        count: item.count
      }))
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Bulk delete employees
router.post('/bulk-delete', async (req, res) => {
  try {
    console.log('📥 POST /api/employees-new/bulk-delete');
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No employee IDs provided'
      });
    }

    const result = await EmployeeNew.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} employees deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('❌ Error bulk deleting employees:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting employees',
      error: error.message
    });
  }
});

// Get filter options (unique values for dropdowns)
router.get('/filters/options', async (req, res) => {
  try {
    console.log('📥 GET /api/employees-new/filters/options');
    
    const [branches, designations, statuses, employmentStatuses] = await Promise.all([
      EmployeeNew.distinct('branch'),
      EmployeeNew.distinct('designation'),
      EmployeeNew.distinct('status'),
      EmployeeNew.distinct('employmentStatus')
    ]);

    res.json({
      success: true,
      data: {
        branches: branches.filter(Boolean),
        designations: designations.filter(Boolean),
        statuses: statuses.filter(Boolean),
        employmentStatuses: employmentStatuses.filter(Boolean)
      }
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

module.exports = router;
