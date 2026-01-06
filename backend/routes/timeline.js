const express = require('express');
const router = express.Router();
const Allocation = require('../models/Allocation');
const Feedback = require('../models/Feedback');
const SettlementProposal = require('../models/SettlementProposal');
const PTPPayment = require('../models/PTPPayment');

/**
 * GET /api/timeline/:customerId
 * Get complete timeline of all account changes for a customer
 */
router.get('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const timeline = [];

    // Fetch Allocations
    const allocations = await Allocation.find({ customerId })
      .populate('allocatedTo', 'name')
      .sort({ allocationDate: -1 });
    
    allocations.forEach(allocation => {
      timeline.push({
        type: allocation.isReallocation ? 'reallocation' : 'allocation',
        timestamp: allocation.allocationDate,
        title: allocation.isReallocation ? 'Account Re-allocated' : 'Account Allocated',
        description: `Allocated to ${allocation.allocatedTo?.name || 'Unknown'}`,
        performedBy: 'System',
        metadata: {
          allocationId: allocation._id,
          allocatedTo: allocation.allocatedTo?.name,
          previousOwner: allocation.previousOwner,
          bucket: allocation.bucket,
          allocationAmount: allocation.allocationAmount,
        }
      });
    });

    // Fetch Feedback (Status Changes & Callbacks)
    const feedbacks = await Feedback.find({ customerId })
      .sort({ createdAt: -1 });
    
    feedbacks.forEach(feedback => {
      const isCallback = feedback.activityType === 'callback';
      timeline.push({
        type: isCallback ? 'callback' : 'status_change',
        timestamp: feedback.createdAt,
        title: isCallback ? 'Callback Scheduled' : 'Status Updated',
        description: feedback.statusLabel || feedback.statusCode,
        performedBy: feedback.createdBy || 'Unknown',
        metadata: {
          feedbackId: feedback._id,
          statusCode: feedback.statusCode,
          statusLabel: feedback.statusLabel,
          remarks: feedback.remarks,
          followUpDate: feedback.followUpDate,
          promiseAmount: feedback.promiseAmount,
          activityType: feedback.activityType,
        }
      });
    });

    // Fetch Settlement Proposals
    const settlements = await SettlementProposal.find({ customerId })
      .sort({ proposalDate: -1 });
    
    settlements.forEach(settlement => {
      timeline.push({
        type: 'settlement',
        timestamp: settlement.proposalDate,
        title: 'Settlement Proposed',
        description: `Settlement of ₹${settlement.settlementAmount?.toLocaleString()} proposed`,
        performedBy: settlement.proposedBy || 'Unknown',
        metadata: {
          settlementId: settlement._id,
          settlementAmount: settlement.settlementAmount,
          proposedAmount: settlement.proposedAmount,
          approvalStatus: settlement.approvalStatus,
          approvedBy: settlement.approvedBy,
          approvalDate: settlement.approvalDate,
          remarks: settlement.remarks,
        }
      });
    });

    // Fetch PTP Payments
    const payments = await PTPPayment.find({ customerId })
      .sort({ paymentDate: -1 });
    
    payments.forEach(payment => {
      timeline.push({
        type: 'payment',
        timestamp: payment.paymentDate,
        title: 'Payment Recorded',
        description: `Payment of ₹${payment.amount?.toLocaleString()} via ${payment.paymentMethod}`,
        performedBy: payment.createdBy || 'Unknown',
        metadata: {
          paymentId: payment.paymentId,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          receiptId: payment.receiptId,
          transactionId: payment.transactionId,
        }
      });
    });

    // Sort timeline by timestamp (most recent first)
    timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(timeline);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ 
      error: 'Failed to fetch timeline',
      message: error.message 
    });
  }
});

/**
 * GET /api/timeline/allocation/:loanId
 * Get allocation history for a specific loan
 */
router.get('/allocation/:loanId', async (req, res) => {
  try {
    const { loanId } = req.params;
    
    const allocations = await Allocation.find({ loanId })
      .populate('allocatedTo', 'name email')
      .sort({ allocationDate: -1 });

    res.json(allocations);
  } catch (error) {
    console.error('Error fetching allocation history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch allocation history',
      message: error.message 
    });
  }
});

/**
 * GET /api/timeline/status-changes/:customerId
 * Get status change history for a customer
 */
router.get('/status-changes/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const statusChanges = await Feedback.find({ 
      customerId,
      activityType: { $ne: 'callback' }
    })
      .sort({ createdAt: -1 });

    res.json(statusChanges);
  } catch (error) {
    console.error('Error fetching status changes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch status changes',
      message: error.message 
    });
  }
});

module.exports = router;
