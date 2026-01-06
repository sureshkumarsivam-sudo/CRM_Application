const express = require('express');
const router = express.Router();
const FieldExecutiveFeedbackStatusCode = require('../models/FieldExecutiveFeedbackStatusCode');

// Get all field executive feedback status codes
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 100, search = '', isActive } = req.query;
    
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

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const statusCodes = await FieldExecutiveFeedbackStatusCode.find(query)
      .sort({ code: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FieldExecutiveFeedbackStatusCode.countDocuments(query);

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
    console.error('Error fetching field executive feedback status codes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch field executive feedback status codes',
      message: error.message 
    });
  }
});

// Get single field executive feedback status code by ID
router.get('/:id', async (req, res) => {
  try {
    const statusCode = await FieldExecutiveFeedbackStatusCode.findById(req.params.id);
    if (!statusCode) {
      return res.status(404).json({ error: 'Status code not found' });
    }
    res.json(statusCode);
  } catch (error) {
    console.error('Error fetching field executive feedback status code:', error);
    res.status(500).json({ 
      error: 'Failed to fetch field executive feedback status code',
      message: error.message 
    });
  }
});

// Create new field executive feedback status code
router.post('/', async (req, res) => {
  try {
    const { code, statusName, description, nextActionTrigger, isActive = true } = req.body;

    // Validate required fields
    if (!code || !statusName || !description || !nextActionTrigger) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['code', 'statusName', 'description', 'nextActionTrigger']
      });
    }

    // Check if code already exists
    const existingCode = await FieldExecutiveFeedbackStatusCode.findOne({ code });
    if (existingCode) {
      return res.status(400).json({ error: 'Status code already exists' });
    }

    const statusCode = new FieldExecutiveFeedbackStatusCode({
      code,
      statusName,
      description,
      nextActionTrigger,
      isActive
    });

    await statusCode.save();
    res.status(201).json(statusCode);
  } catch (error) {
    console.error('Error creating field executive feedback status code:', error);
    res.status(500).json({ 
      error: 'Failed to create field executive feedback status code',
      message: error.message 
    });
  }
});

// Update field executive feedback status code
router.put('/:id', async (req, res) => {
  try {
    const { code, statusName, description, nextActionTrigger, isActive } = req.body;

    // Check if code already exists (excluding current record)
    if (code) {
      const existingCode = await FieldExecutiveFeedbackStatusCode.findOne({ 
        code, 
        _id: { $ne: req.params.id } 
      });
      if (existingCode) {
        return res.status(400).json({ error: 'Status code already exists' });
      }
    }

    const statusCode = await FieldExecutiveFeedbackStatusCode.findByIdAndUpdate(
      req.params.id,
      { code, statusName, description, nextActionTrigger, isActive },
      { new: true, runValidators: true }
    );

    if (!statusCode) {
      return res.status(404).json({ error: 'Status code not found' });
    }

    res.json(statusCode);
  } catch (error) {
    console.error('Error updating field executive feedback status code:', error);
    res.status(500).json({ 
      error: 'Failed to update field executive feedback status code',
      message: error.message 
    });
  }
});

// Delete field executive feedback status code
router.delete('/:id', async (req, res) => {
  try {
    const statusCode = await FieldExecutiveFeedbackStatusCode.findByIdAndDelete(req.params.id);
    if (!statusCode) {
      return res.status(404).json({ error: 'Status code not found' });
    }
    res.json({ message: 'Status code deleted successfully', deletedCode: statusCode });
  } catch (error) {
    console.error('Error deleting field executive feedback status code:', error);
    res.status(500).json({ 
      error: 'Failed to delete field executive feedback status code',
      message: error.message 
    });
  }
});

// Bulk create status codes (for initial data seeding)
router.post('/bulk', async (req, res) => {
  try {
    const { statusCodes } = req.body;
    
    if (!Array.isArray(statusCodes)) {
      return res.status(400).json({ error: 'statusCodes must be an array' });
    }

    const result = await FieldExecutiveFeedbackStatusCode.insertMany(statusCodes, { 
      ordered: false,
      rawResult: true 
    });

    res.status(201).json({
      message: 'Bulk insert completed',
      inserted: result.insertedCount,
      total: statusCodes.length
    });
  } catch (error) {
    console.error('Error bulk creating field executive feedback status codes:', error);
    res.status(500).json({ 
      error: 'Failed to bulk create field executive feedback status codes',
      message: error.message 
    });
  }
});

module.exports = router;