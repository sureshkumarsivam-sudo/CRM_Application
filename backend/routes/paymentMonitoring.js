const express = require('express');
const router = express.Router();
const {
  checkAllPayments,
  getMonitoringData,
  markInstallmentPaid,
} = require('../services/paymentMonitoringService');

/**
 * GET /api/settlements/monitoring
 * Get all proposals with payment monitoring data
 */
router.get('/monitoring', async (req, res) => {
  try {
    const data = await getMonitoringData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching monitoring data:', error);
    res.status(500).json({ 
      message: 'Error fetching monitoring data', 
      error: error.message 
    });
  }
});

/**
 * POST /api/settlements/check-payments
 * Check all active proposals for overdue payments
 * This can be called manually or scheduled via cron
 */
router.post('/check-payments', async (req, res) => {
  try {
    const result = await checkAllPayments();
    res.json(result);
  } catch (error) {
    console.error('Error checking payments:', error);
    res.status(500).json({ 
      message: 'Error checking payments', 
      error: error.message 
    });
  }
});

/**
 * POST /api/settlements/:proposalId/mark-paid
 * Mark a specific installment as paid
 */
router.post('/:proposalId/mark-paid', async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { installmentIndex, paymentDate } = req.body;
    
    if (installmentIndex === undefined || installmentIndex === null) {
      return res.status(400).json({ message: 'Installment index is required' });
    }
    
    const proposal = await markInstallmentPaid(
      proposalId, 
      parseInt(installmentIndex), 
      paymentDate ? new Date(paymentDate) : new Date()
    );
    
    res.json({ 
      message: 'Installment marked as paid successfully', 
      proposal 
    });
  } catch (error) {
    console.error('Error marking installment as paid:', error);
    res.status(500).json({ 
      message: 'Error marking installment as paid', 
      error: error.message 
    });
  }
});

module.exports = router;
