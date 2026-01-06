const express = require('express');
const router = express.Router();
const StatusCode = require('../models/StatusCode');

// GET all status codes with pagination, sorting, and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'code',
      sortOrder = 'asc',
      search = '',
      category = '',
      isActive = ''
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { responsible: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortObj = { [sortBy]: sortDirection };

    // Execute queries
    const [statusCodes, total] = await Promise.all([
      StatusCode.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      StatusCode.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: statusCodes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching status codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status codes',
      error: error.message
    });
  }
});

// GET categories (must be before /:id route)
router.get('/filters/categories', async (req, res) => {
  try {
    const categories = await StatusCode.distinct('category');
    
    res.json({
      success: true,
      data: categories || []
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// GET status code by code (must be before /:id route)
router.get('/code/:code', async (req, res) => {
  try {
    const statusCode = await StatusCode.findOne({ code: req.params.code });
    
    if (!statusCode) {
      return res.status(404).json({
        success: false,
        message: 'Status code not found'
      });
    }

    res.json({
      success: true,
      data: statusCode
    });
  } catch (error) {
    console.error('Error fetching status code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status code',
      error: error.message
    });
  }
});

// GET single status code by ID
router.get('/:id', async (req, res) => {
  try {
    const statusCode = await StatusCode.findById(req.params.id);
    
    if (!statusCode) {
      return res.status(404).json({
        success: false,
        message: 'Status code not found'
      });
    }

    res.json({
      success: true,
      data: statusCode
    });
  } catch (error) {
    console.error('Error fetching status code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch status code',
      error: error.message
    });
  }
});

// POST create new status code
router.post('/', async (req, res) => {
  try {
    const {
      code,
      description,
      category,
      nextActionTrigger,
      responsible,
      autoEscalationLogic
    } = req.body;

    // Validation
    if (!code || !description || !category || !nextActionTrigger || !responsible) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if code already exists
    const existingCode = await StatusCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'Status code already exists'
      });
    }

    const statusCode = new StatusCode({
      code: code.toUpperCase(),
      description,
      category,
      nextActionTrigger,
      responsible,
      autoEscalationLogic: autoEscalationLogic || '',
      isActive: true
    });

    await statusCode.save();

    res.status(201).json({
      success: true,
      message: 'Status code created successfully',
      data: statusCode
    });
  } catch (error) {
    console.error('Error creating status code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create status code',
      error: error.message
    });
  }
});

// PUT update status code
router.put('/:id', async (req, res) => {
  try {
    const {
      code,
      description,
      category,
      nextActionTrigger,
      responsible,
      autoEscalationLogic,
      isActive
    } = req.body;

    const statusCode = await StatusCode.findById(req.params.id);
    
    if (!statusCode) {
      return res.status(404).json({
        success: false,
        message: 'Status code not found'
      });
    }

    // Check if code is being changed and if new code already exists
    if (code && code.toUpperCase() !== statusCode.code) {
      const existingCode = await StatusCode.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'Status code already exists'
        });
      }
    }

    // Update fields
    if (code) statusCode.code = code.toUpperCase();
    if (description) statusCode.description = description;
    if (category) statusCode.category = category;
    if (nextActionTrigger) statusCode.nextActionTrigger = nextActionTrigger;
    if (responsible) statusCode.responsible = responsible;
    if (autoEscalationLogic !== undefined) statusCode.autoEscalationLogic = autoEscalationLogic;
    if (isActive !== undefined) statusCode.isActive = isActive;

    await statusCode.save();

    res.json({
      success: true,
      message: 'Status code updated successfully',
      data: statusCode
    });
  } catch (error) {
    console.error('Error updating status code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status code',
      error: error.message
    });
  }
});

// DELETE status code
router.delete('/:id', async (req, res) => {
  try {
    const statusCode = await StatusCode.findById(req.params.id);
    
    if (!statusCode) {
      return res.status(404).json({
        success: false,
        message: 'Status code not found'
      });
    }

    await statusCode.deleteOne();

    res.json({
      success: true,
      message: 'Status code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting status code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete status code',
      error: error.message
    });
  }
});

module.exports = router;
