const express = require('express');
const router = express.Router();
const StatusCodeMatrix = require('../models/StatusCodeMatrix');

// Get all status codes with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 100, 
      search = '', 
      isActive, 
      applicableFor 
    } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { statusName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (applicableFor && !search) {
      query.$or = [
        { applicableFor: applicableFor },
        { applicableFor: 'BOTH' }
      ];
    } else if (applicableFor && search) {
      // When both search and applicableFor are present, use $and
      const searchCondition = {
        $or: [
          { code: { $regex: search, $options: 'i' } },
          { statusName: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
      const applicableCondition = {
        $or: [
          { applicableFor: applicableFor },
          { applicableFor: 'BOTH' }
        ]
      };
      delete query.$or;
      query.$and = [searchCondition, applicableCondition];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const statusCodes = await StatusCodeMatrix.find(query)
      .sort({ priority: -1, code: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StatusCodeMatrix.countDocuments(query);

    res.json({
      data: statusCodes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasNext: skip + statusCodes.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching status codes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch status codes',
      message: error.message 
    });
  }
});

// Get a single status code by ID
router.get('/:id', async (req, res) => {
  try {
    const statusCode = await StatusCodeMatrix.findById(req.params.id);
    
    if (!statusCode) {
      return res.status(404).json({ error: 'Status code not found' });
    }
    
    res.json(statusCode);
  } catch (error) {
    console.error('Error fetching status code:', error);
    res.status(500).json({ 
      error: 'Failed to fetch status code',
      message: error.message 
    });
  }
});

// Create a new status code
router.post('/', async (req, res) => {
  try {
    const {
      code,
      statusName,
      description,
      applicableFor,
      nextActionTrigger,
      priority,
      color,
      isActive,
      createdBy
    } = req.body;

    // Validate required fields
    if (!code || !statusName || !description || !nextActionTrigger) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['code', 'statusName', 'description', 'nextActionTrigger']
      });
    }

    // Check if code already exists
    const existingCode = await StatusCodeMatrix.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ 
        error: 'Status code already exists',
        code: code.toUpperCase()
      });
    }

    const newStatusCode = new StatusCodeMatrix({
      code: code.toUpperCase(),
      statusName,
      description,
      applicableFor: applicableFor || 'BOTH',
      nextActionTrigger,
      priority: priority || 0,
      color: color || '#FFB84D',
      isActive: isActive !== undefined ? isActive : true,
      createdBy: createdBy || 'System'
    });

    const savedStatusCode = await newStatusCode.save();
    
    res.status(201).json({
      message: 'Status code created successfully',
      data: savedStatusCode
    });
  } catch (error) {
    console.error('Error creating status code:', error);
    res.status(500).json({ 
      error: 'Failed to create status code',
      message: error.message 
    });
  }
});

// Update a status code
router.put('/:id', async (req, res) => {
  try {
    const {
      code,
      statusName,
      description,
      applicableFor,
      nextActionTrigger,
      priority,
      color,
      isActive,
      updatedBy
    } = req.body;

    // Check if status code exists
    const statusCode = await StatusCodeMatrix.findById(req.params.id);
    if (!statusCode) {
      return res.status(404).json({ error: 'Status code not found' });
    }

    // If code is being changed, check if new code already exists
    if (code && code.toUpperCase() !== statusCode.code) {
      const existingCode = await StatusCodeMatrix.findOne({ 
        code: code.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existingCode) {
        return res.status(400).json({ 
          error: 'Status code already exists',
          code: code.toUpperCase()
        });
      }
    }

    // Update fields
    if (code) statusCode.code = code.toUpperCase();
    if (statusName) statusCode.statusName = statusName;
    if (description) statusCode.description = description;
    if (applicableFor) statusCode.applicableFor = applicableFor;
    if (nextActionTrigger) statusCode.nextActionTrigger = nextActionTrigger;
    if (priority !== undefined) statusCode.priority = priority;
    if (color) statusCode.color = color;
    if (isActive !== undefined) statusCode.isActive = isActive;
    if (updatedBy) statusCode.updatedBy = updatedBy;

    const updatedStatusCode = await statusCode.save();
    
    res.json({
      message: 'Status code updated successfully',
      data: updatedStatusCode
    });
  } catch (error) {
    console.error('Error updating status code:', error);
    res.status(500).json({ 
      error: 'Failed to update status code',
      message: error.message 
    });
  }
});

// Delete a status code (soft delete by setting isActive to false)
router.delete('/:id', async (req, res) => {
  try {
    const { hardDelete = false } = req.query;
    
    const statusCode = await StatusCodeMatrix.findById(req.params.id);
    
    if (!statusCode) {
      return res.status(404).json({ error: 'Status code not found' });
    }

    if (hardDelete === 'true') {
      // Hard delete - remove from database
      await StatusCodeMatrix.findByIdAndDelete(req.params.id);
      res.json({ 
        message: 'Status code permanently deleted',
        code: statusCode.code
      });
    } else {
      // Soft delete - set isActive to false
      statusCode.isActive = false;
      await statusCode.save();
      res.json({ 
        message: 'Status code deactivated',
        data: statusCode
      });
    }
  } catch (error) {
    console.error('Error deleting status code:', error);
    res.status(500).json({ 
      error: 'Failed to delete status code',
      message: error.message 
    });
  }
});

// Bulk create status codes (for initial setup)
router.post('/bulk', async (req, res) => {
  try {
    const { statusCodes, createdBy } = req.body;

    if (!Array.isArray(statusCodes) || statusCodes.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'statusCodes must be a non-empty array'
      });
    }

    const results = {
      created: [],
      skipped: [],
      errors: []
    };

    for (const codeData of statusCodes) {
      try {
        // Check if code already exists
        const existingCode = await StatusCodeMatrix.findOne({ 
          code: codeData.code.toUpperCase() 
        });
        
        if (existingCode) {
          results.skipped.push({
            code: codeData.code,
            reason: 'Code already exists'
          });
          continue;
        }

        const newStatusCode = new StatusCodeMatrix({
          ...codeData,
          code: codeData.code.toUpperCase(),
          createdBy: createdBy || 'System'
        });

        const savedCode = await newStatusCode.save();
        results.created.push(savedCode);
      } catch (error) {
        results.errors.push({
          code: codeData.code,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: 'Bulk operation completed',
      summary: {
        created: results.created.length,
        skipped: results.skipped.length,
        errors: results.errors.length
      },
      results
    });
  } catch (error) {
    console.error('Error in bulk create:', error);
    res.status(500).json({ 
      error: 'Failed to process bulk create',
      message: error.message 
    });
  }
});

module.exports = router;
