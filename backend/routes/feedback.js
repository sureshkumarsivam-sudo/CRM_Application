const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

// Get all feedback for a customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const feedback = await Feedback.find({ customerId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: feedback,
      count: feedback.length
    });
  } catch (error) {
    console.error('Error fetching customer feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
});

// Get feedback by loan ID
router.get('/loan/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;
    const feedback = await Feedback.find({ loanId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: feedback,
      count: feedback.length
    });
  } catch (error) {
    console.error('Error fetching loan feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
});

// Create new feedback
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      loanId,
      statusCode,
      statusLabel,
      remarks,
      activityType,
      followUpDate,
      promiseAmount,
      createdBy,
      userRole
    } = req.body;

    // Validation
    if (!customerId || !loanId || !statusCode || !statusLabel || !remarks || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerId, loanId, statusCode, statusLabel, remarks, createdBy'
      });
    }

    const feedback = new Feedback({
      customerId,
      loanId,
      statusCode,
      statusLabel,
      remarks,
      activityType: activityType || 'Feedback',
      followUpDate,
      promiseAmount,
      createdBy,
      userRole
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback created successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create feedback',
      error: error.message
    });
  }
});

// Update feedback
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback',
      error: error.message
    });
  }
});

// Delete feedback
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
      error: error.message
    });
  }
});

// Get feedback statistics for a customer
router.get('/stats/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const stats = await Feedback.aggregate([
      { $match: { customerId: mongoose.Types.ObjectId(customerId) } },
      {
        $group: {
          _id: '$statusCode',
          count: { $sum: 1 },
          latestFeedback: { $max: '$createdAt' }
        }
      }
    ]);

    const totalFeedback = await Feedback.countDocuments({ customerId });

    res.json({
      success: true,
      data: {
        totalFeedback,
        byStatus: stats
      }
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics',
      error: error.message
    });
  }
});

module.exports = router;
