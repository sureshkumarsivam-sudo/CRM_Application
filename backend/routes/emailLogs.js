const express = require('express');
const router = express.Router();
const EmailLog = require('../models/EmailLog');
const emailService = require('../services/emailService');

// Get all email logs with filters
router.get('/', async (req, res) => {
  try {
    const {
      status,
      emailType,
      startDate,
      endDate,
      recipientEmail,
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (emailType) query.emailType = emailType;
    if (recipientEmail) query.recipientEmail = new RegExp(recipientEmail, 'i');
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await EmailLog.countDocuments(query);
    const logs = await EmailLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get email log by ID
router.get('/:id', async (req, res) => {
  try {
    const log = await EmailLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({ message: 'Email log not found' });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Retry failed email
router.post('/:id/retry', async (req, res) => {
  try {
    const result = await emailService.retryFailedEmail(req.params.id);

    res.json({
      message: 'Email retried successfully',
      ...result
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get email statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await EmailLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await EmailLog.aggregate([
      {
        $group: {
          _id: '$emailType',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentFailed = await EmailLog.countDocuments({
      status: 'Failed',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({
      statusStats: stats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      typeStats: typeStats.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      recentFailed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export logs to CSV
router.get('/export/csv', async (req, res) => {
  try {
    const { status, emailType, startDate, endDate } = req.query;

    const query = {};
    if (status) query.status = status;
    if (emailType) query.emailType = emailType;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await EmailLog.find(query).sort({ createdAt: -1 });

    // Create CSV content
    const csvHeader = 'Date,Recipient Email,Recipient Name,Subject,Email Type,Status,Retry Count,Error Message\n';
    const csvRows = logs.map(log => {
      return [
        log.createdAt.toISOString(),
        log.recipientEmail,
        log.recipientName || '',
        `"${log.subject.replace(/"/g, '""')}"`,
        log.emailType,
        log.status,
        log.retryCount,
        log.errorDetails?.message ? `"${log.errorDetails.message.replace(/"/g, '""')}"` : ''
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=email-logs-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
