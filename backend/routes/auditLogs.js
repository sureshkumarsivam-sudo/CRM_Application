const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// GET /api/audit-logs - Get all audit logs with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      proposalId,
      letterId,
      customerId,
      accountNumber,
      action,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (proposalId) {
      query.proposalId = proposalId;
    }
    if (letterId) {
      query.letterId = new RegExp(letterId, 'i');
    }
    if (customerId) {
      query.customerId = customerId;
    }
    if (accountNumber) {
      query.accountNumber = new RegExp(accountNumber, 'i');
    }
    if (action) {
      query.action = action;
    }
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find(query)
      .populate('proposalId', 'letterId customerName proposalType')
      .populate('customerId', 'accountName loanId')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// GET /api/audit-logs/export - Export audit logs as CSV
router.get('/export', async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('proposalId', 'letterId customerName proposalType')
      .populate('customerId', 'accountName loanId')
      .sort({ timestamp: -1 });

    // CSV headers
    let csv = 'Timestamp,Action,Proposal ID,Letter ID,Customer,Account Number,User,Role,Previous Status,New Status,Details\n';

    // CSV rows
    logs.forEach(log => {
      const timestamp = new Date(log.timestamp).toLocaleString();
      const action = log.action;
      const proposalId = log.proposalId?._id || 'N/A';
      const letterId = log.letterId || log.proposalId?.letterId || 'N/A';
      const customer = log.proposalId?.customerName || log.customerId?.accountName || 'N/A';
      const accountNumber = log.accountNumber || log.customerId?.loanId || 'N/A';
      const user = log.user.name;
      const role = log.user.role;
      const previousStatus = log.previousStatus || 'N/A';
      const newStatus = log.newStatus || 'N/A';
      const details = (log.details || '').replace(/,/g, ';').replace(/"/g, '""');

      csv += `"${timestamp}","${action}","${proposalId}","${letterId}","${customer}","${accountNumber}","${user}","${role}","${previousStatus}","${newStatus}","${details}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-log.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting audit logs:', error);
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
});

module.exports = router;
