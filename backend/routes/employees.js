const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// Helper function to map database fields to expected schema
const mapEmployeeFields = (employee) => {
  return {
    _id: employee._id,
    employeeCode: employee.Emp_Code || employee.empCode || '-',
    name: employee.Name || employee.name || '-',
    designation: employee.Designation || employee.designation || '-',
    branch: employee.Branch || employee.branch || '-',
    contactNumber: (employee['Contact No'] && employee['Contact No']['']) || 
                   employee.contactNumber || 
                   employee.ContactNo || '-',
    employmentStatus: employee.Employment_Status || employee.employmentStatus || 'Unknown',
    status: employee.Status || employee.status || 'Unknown',
    email: employee.OfficialEmail_Id || employee.PersonalEmail_Id || 
           employee.officialEmailId || employee.personalEmailId || '-',
    phone: (employee['Contact No'] && employee['Contact No']['']) || 
           employee.contactNumber || 
           employee.ContactNo || '-',
    createdAt: employee.createdAt,
    isActive: (employee.Status === 'Confirmed' || employee.Status === 'Active' || 
               employee.Employment_Status === 'Working' || employee.status === 'Active'),
    // Additional fields
    department: employee.Department || employee.department || '-',
    doj: employee.DOJ || employee.doj,
    gender: employee.Gender || employee.gender,
    dob: employee.DOB || employee.dob,
    company: employee.Company || employee.company,
    experience: employee.Experience || employee.experience,
    qualification: employee.Qualification || employee.qualification,
    reportingManager: employee.Reporting_Manager || employee.reportingManager
  };
};

// Get all employees with pagination, search, and filters
router.get('/', async (req, res) => {
  try {
    console.log('📥 GET /api/employees - Employee list request');
    
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      status = '',
      branch = '',
      designation = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('📋 Employee list request:', { page, limit, search, department, status, branch, designation });

    // Build query object - search both old and new field names
    const query = {};

    // Add search functionality across multiple field variations
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { Emp_Code: searchRegex },
        { empCode: searchRegex },
        { Name: searchRegex },
        { name: searchRegex },
        { Department: searchRegex },
        { department: searchRegex },
        { Designation: searchRegex },
        { designation: searchRegex },
        { Branch: searchRegex },
        { branch: searchRegex },
        { OfficialEmail_Id: searchRegex },
        { PersonalEmail_Id: searchRegex },
        { officialEmailId: searchRegex }
      ];
    }

    // Add filters - check both field name variations
    if (department) {
      query.$or = [
        { Department: new RegExp(department, 'i') },
        { department: new RegExp(department, 'i') }
      ];
    }
    if (status) {
      query.$or = [
        { Status: status },
        { status: status }
      ];
    }
    if (branch) {
      query.$or = [
        { Branch: new RegExp(branch, 'i') },
        { branch: new RegExp(branch, 'i') }
      ];
    }
    if (designation) {
      query.$or = [
        { Designation: new RegExp(designation, 'i') },
        { designation: new RegExp(designation, 'i') }
      ];
    }

    console.log('📊 Query:', JSON.stringify(query, null, 2));

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Map sortBy to actual database fields
    const sortFieldMap = {
      'employeeCode': 'Emp_Code',
      'name': 'Name',
      'designation': 'Designation',
      'status': 'Status',
      'createdAt': 'createdAt'
    };
    const actualSortField = sortFieldMap[sortBy] || sortBy;
    
    // Build sort object
    const sort = {};
    sort[actualSortField] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination and lean for performance
    const [employees, totalCount] = await Promise.all([
      Employee.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Employee.countDocuments(query)
    ]);

    console.log(`📈 Total employees found: ${totalCount}`);
    console.log(`📋 Employees returned: ${employees.length}`);

    // Map fields to expected schema
    const mappedEmployees = employees.map(mapEmployeeFields);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNext = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    const response = {
      success: true,
      data: mappedEmployees,
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

// Get employee summary counts (must be before /:id route)
router.get('/summary', async (req, res) => {
  try {
    console.log('📊 GET /api/employees/summary - Employee summary request');
    
    // Get all employees to calculate isActive
    const allEmployees = await Employee.find({}).lean();
    
    const totalEmployees = allEmployees.length;
    
    // Calculate active employees (Status = Confirmed/Active OR Employment_Status = Working)
    const activeEmployees = allEmployees.filter(emp => 
      emp.Status === 'Confirmed' || 
      emp.Status === 'Active' || 
      emp.Employment_Status === 'Working' ||
      emp.status === 'Active'
    ).length;
    
    const inactiveEmployees = totalEmployees - activeEmployees;

    console.log(`✅ Summary - Total: ${totalEmployees}, Active: ${activeEmployees}, Inactive: ${inactiveEmployees}`);

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees
      }
    });

  } catch (error) {
    console.error('❌ Error fetching employee summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee summary',
      error: error.message
    });
  }
});

// Get single employee by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`📥 GET /api/employees/${req.params.id} - Single employee request`);
    
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    console.log(`✅ Employee found: ${employee.empCode} - ${employee.name}`);

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
    console.log('📥 POST /api/employees - Create employee request');
    console.log('Employee data received:', req.body.empCode || 'No emp code', req.body.name || 'No name');

    // Check if employee code already exists
    if (req.body.empCode) {
      const existingEmployee = await Employee.findOne({ empCode: req.body.empCode });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee code already exists'
        });
      }
    }

    // Check if official email already exists
    if (req.body.officialEmailId) {
      const existingEmail = await Employee.findOne({ officialEmailId: req.body.officialEmailId });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Official email already exists'
        });
      }
    }

    const employee = new Employee(req.body);
    const savedEmployee = await employee.save();

    console.log(`✅ Employee created: ${savedEmployee.empCode} - ${savedEmployee.name}`);

    res.status(201).json({
      success: true,
      data: savedEmployee,
      message: 'Employee created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating employee:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

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
    console.log(`📥 PUT /api/employees/${req.params.id} - Update employee request`);
    
    const employeeId = req.params.id;
    const updateData = req.body;

    // Check if employee code is being changed and if it already exists
    if (updateData.empCode) {
      const existingEmployee = await Employee.findOne({ 
        empCode: updateData.empCode,
        _id: { $ne: employeeId }
      });
      if (existingEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Employee code already exists'
        });
      }
    }

    // Check if official email is being changed and if it already exists
    if (updateData.officialEmailId) {
      const existingEmail = await Employee.findOne({ 
        officialEmailId: updateData.officialEmailId,
        _id: { $ne: employeeId }
      });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Official email already exists'
        });
      }
    }

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    console.log(`✅ Employee updated: ${employee.empCode} - ${employee.name}`);

    res.json({
      success: true,
      data: employee,
      message: 'Employee updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating employee:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

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
    console.log(`📥 DELETE /api/employees/${req.params.id} - Delete employee request`);
    
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    console.log(`✅ Employee deleted: ${employee.empCode} - ${employee.name}`);

    res.json({
      success: true,
      message: 'Employee deleted successfully',
      data: { id: req.params.id }
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

// Bulk delete employees
router.delete('/', async (req, res) => {
  try {
    console.log('📥 DELETE /api/employees - Bulk delete request');
    
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of employee IDs'
      });
    }

    console.log(`Deleting ${ids.length} employees`);

    const result = await Employee.deleteMany({
      _id: { $in: ids }
    });

    console.log(`✅ ${result.deletedCount} employees deleted`);

    res.json({
      success: true,
      message: `${result.deletedCount} employees deleted successfully`,
      data: { deletedCount: result.deletedCount }
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

// Get employee statistics for dashboard
router.get('/stats/dashboard', async (req, res) => {
  try {
    console.log('📊 Employee dashboard stats request received');
    
    // Basic counts
    const totalEmployees = await Employee.countDocuments();
    console.log('Total employees:', totalEmployees);
    
    const activeEmployees = await Employee.countDocuments({ status: 'Active' });
    console.log('Active employees:', activeEmployees);
    
    const inactiveEmployees = await Employee.countDocuments({ status: 'Inactive' });
    console.log('Inactive employees:', inactiveEmployees);
    
    const terminatedEmployees = await Employee.countDocuments({ status: 'Terminated' });
    console.log('Terminated employees:', terminatedEmployees);

    // Employees by department
    let employeesByDepartment = [];
    try {
      employeesByDepartment = await Employee.aggregate([
        { 
          $match: { 
            department: { $ne: null, $ne: '', $exists: true } 
          }
        },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      console.log('Employees by department:', employeesByDepartment.length);
    } catch (err) {
      console.error('Error getting employees by department:', err);
    }

    // Employees by branch
    let employeesByBranch = [];
    try {
      employeesByBranch = await Employee.aggregate([
        { 
          $match: { 
            branch: { $ne: null, $ne: '', $exists: true } 
          }
        },
        { $group: { _id: '$branch', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      console.log('Employees by branch:', employeesByBranch.length);
    } catch (err) {
      console.error('Error getting employees by branch:', err);
    }

    // Recent employees
    let recentEmployees = [];
    try {
      recentEmployees = await Employee.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('empCode name department designation status createdAt')
        .lean();
      console.log('Recent employees:', recentEmployees.length);
    } catch (err) {
      console.error('Error getting recent employees:', err);
    }

    const response = {
      success: true,
      data: {
        summary: {
          totalEmployees,
          activeEmployees,
          inactiveEmployees,
          terminatedEmployees
        },
        employeesByDepartment,
        employeesByBranch,
        recentEmployees
      }
    };

    console.log('✅ Employee dashboard stats response ready');
    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching employee dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee dashboard statistics',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get unique values for filters
router.get('/filters/options', async (req, res) => {
  try {
    console.log('📥 GET /api/employees/filters/options - Filter options request');

    // Get distinct values from both old and new field names
    const [departments1, departments2, branches1, branches2, designations1, designations2, statuses1, statuses2, employmentStatuses1, employmentStatuses2] = await Promise.all([
      Employee.distinct('Department'),
      Employee.distinct('department'),
      Employee.distinct('Branch'),
      Employee.distinct('branch'),
      Employee.distinct('Designation'),
      Employee.distinct('designation'),
      Employee.distinct('Status'),
      Employee.distinct('status'),
      Employee.distinct('Employment_Status'),
      Employee.distinct('employmentStatus')
    ]);

    // Merge and deduplicate
    const departments = [...new Set([...departments1, ...departments2])].filter(Boolean).sort();
    const branches = [...new Set([...branches1, ...branches2])].filter(Boolean).sort();
    const designations = [...new Set([...designations1, ...designations2])].filter(Boolean).sort();
    const statuses = [...new Set([...statuses1, ...statuses2])].filter(Boolean).sort();
    const employmentStatuses = [...new Set([...employmentStatuses1, ...employmentStatuses2])].filter(Boolean).sort();

    res.json({
      success: true,
      data: {
        departments,
        branches,
        designations,
        statuses,
        employmentStatuses
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