const express = require('express');
const router = express.Router();
const CallerFeedbackStatusCode = require('../models/CallerFeedbackStatusCode');

// Get all caller feedback status codes
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
    const statusCodes = await CallerFeedbackStatusCode.find(query)
      .sort({ code: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CallerFeedbackStatusCode.countDocuments(query);

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
    console.error('Error fetching caller feedback status codes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch caller feedback status codes',
      message: error.message 
    });
  }
});

// Get single caller feedback status code by ID
router.get('/:id', async (req, res) => {
  try {
    const statusCode = await CallerFeedbackStatusCode.findById(req.params.id);
    if (!statusCode) {
      return res.status(404).json({ error: 'Status code not found' });
    }
    res.json(statusCode);
  } catch (error) {
    console.error('Error fetching caller feedback status code:', error);
    res.status(500).json({ 
      error: 'Failed to fetch caller feedback status code',
      message: error.message 
    });
  }
});

// Create new caller feedback status code
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
    const existingCode = await CallerFeedbackStatusCode.findOne({ code });
    if (existingCode) {
      return res.status(400).json({ error: 'Status code already exists' });
    }

    const statusCode = new CallerFeedbackStatusCode({
      code,
      statusName,
      description,
      nextActionTrigger,
      isActive
    });

    await statusCode.save();
    res.status(201).json(statusCode);
  } catch (error) {
    console.error('Error creating caller feedback status code:', error);
    res.status(500).json({ 
      error: 'Failed to create caller feedback status code',
      message: error.message 
    });
  }
});

// Update caller feedback status code
router.put('/:id', async (req, res) => {
  try {
    const { code, statusName, description, nextActionTrigger, isActive } = req.body;

    // Check if code already exists (excluding current record)
    if (code) {
      const existingCode = await CallerFeedbackStatusCode.findOne({ 
        code, 
        _id: { $ne: req.params.id } 
      });
      if (existingCode) {
        return res.status(400).json({ error: 'Status code already exists' });
      }
    }

    const statusCode = await CallerFeedbackStatusCode.findByIdAndUpdate(
      req.params.id,
      { code, statusName, description, nextActionTrigger, isActive },
      { new: true, runValidators: true }
    );

    if (!statusCode) {
      return res.status(404).json({ error: 'Status code not found' });
    }

    res.json(statusCode);
  } catch (error) {
    console.error('Error updating caller feedback status code:', error);
    res.status(500).json({ 
      error: 'Failed to update caller feedback status code',
      message: error.message 
    });
  }
});

// Delete caller feedback status code
router.delete('/:id', async (req, res) => {
  try {
    const statusCode = await CallerFeedbackStatusCode.findByIdAndDelete(req.params.id);
    if (!statusCode) {
      return res.status(404).json({ error: 'Status code not found' });
    }
    res.json({ message: 'Status code deleted successfully', deletedCode: statusCode });
  } catch (error) {
    console.error('Error deleting caller feedback status code:', error);
    res.status(500).json({ 
      error: 'Failed to delete caller feedback status code',
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

    const result = await CallerFeedbackStatusCode.insertMany(statusCodes, { 
      ordered: false,
      rawResult: true 
    });

    res.status(201).json({
      message: 'Bulk insert completed',
      inserted: result.insertedCount,
      total: statusCodes.length
    });
  } catch (error) {
    console.error('Error bulk creating caller feedback status codes:', error);
    res.status(500).json({ 
      error: 'Failed to bulk create caller feedback status codes',
      message: error.message 
    });
  }
});

module.exports = router;