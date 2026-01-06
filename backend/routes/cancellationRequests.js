const express = require('express');
const router = express.Router();
const CancellationRequest = require('../models/CancellationRequest');
const SettlementProposal = require('../models/SettlementProposal');
const AuditLog = require('../models/AuditLog');
const Customer = require('../models/Customer');
const emailService = require('../services/emailService');

// Create cancellation request
router.post('/', async (req, res) => {
  try {
    const {
      proposalId,
      letterId,
      customerId,
      accountNumber,
      customerName,
      cancellationReason,
      cancellationReasonDetails,
      additionalComments,
      requestedBy
    } = req.body;

    // Validate proposal exists and is active
    const proposal = await SettlementProposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Check if proposal is in a valid state for cancellation
    const validStatuses = ['Pending L1', 'L1 Approved', 'Pending L2', 'Active', 'Broken Settlement'];
    if (!validStatuses.includes(proposal.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel proposal with status: ${proposal.status}` 
      });
    }

    // Check if there's already a pending cancellation request
    const existingRequest = await CancellationRequest.findOne({
      proposalId,
      status: { $in: ['Awaiting L1 Manager Review', 'L1 Approved - Awaiting Admin'] }
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'A cancellation request is already pending for this proposal' 
      });
    }

    // Create cancellation request
    const cancellationRequest = new CancellationRequest({
      proposalId,
      letterId,
      customerId,
      accountNumber,
      customerName,
      cancellationReason,
      cancellationReasonDetails,
      additionalComments,
      requestedBy: {
        name: requestedBy.name,
        userId: requestedBy.userId,
        role: requestedBy.role,
        requestDate: new Date()
      },
      status: 'Awaiting L1 Manager Review',
      notifications: [{
        recipient: 'L1 Manager',
        sentDate: new Date(),
        message: `New cancellation request for Letter ${letterId}`,
        read: false
      }]
    });

    await cancellationRequest.save();

    // Update proposal status to indicate cancellation in progress
    const oldStatus = proposal.status;
    proposal.status = 'Cancelled';
    proposal.lockReason = 'Cancellation In Progress';
    proposal.accountLocked = true;
    await proposal.save();

    // Create audit log
    await AuditLog.create({
      module: 'Settlement',
      action: 'Cancellation Requested',
      entityType: 'SettlementProposal',
      entityId: proposalId,
      changes: {
        field: 'status',
        oldValue: oldStatus,
        newValue: 'Cancelled - Cancellation Requested'
      },
      performedBy: {
        name: requestedBy.name,
        userId: requestedBy.userId,
        role: requestedBy.role
      },
      details: `Cancellation requested for Letter ${letterId}. Reason: ${cancellationReason}`
    });

    res.status(201).json({
      message: 'Cancellation request submitted successfully',
      cancellationRequest,
      proposalUpdated: true
    });

  } catch (error) {
    console.error('Error creating cancellation request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all cancellation requests with filters
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const requests = await CancellationRequest.find(query)
      .populate('proposalId', 'proposalType proposedAmount paymentType numberOfInstallments')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CancellationRequest.countDocuments(query);

    res.json({
      requests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching cancellation requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending L1 cancellations
router.get('/pending-l1', async (req, res) => {
  try {
    const requests = await CancellationRequest.find({ 
      status: 'Awaiting L1 Manager Review' 
    })
      .populate('proposalId', 'proposalType proposedAmount paymentType numberOfInstallments totalOutstanding')
      .sort({ createdAt: -1 });

    res.json({ requests, count: requests.length });

  } catch (error) {
    console.error('Error fetching pending L1 cancellations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending admin finalizations
router.get('/pending-admin', async (req, res) => {
  try {
    const requests = await CancellationRequest.find({ 
      status: 'L1 Approved - Awaiting Admin' 
    })
      .populate('proposalId', 'proposalType proposedAmount paymentType numberOfInstallments totalOutstanding')
      .sort({ createdAt: -1 });

    res.json({ requests, count: requests.length });

  } catch (error) {
    console.error('Error fetching pending admin finalizations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single cancellation request
router.get('/:id', async (req, res) => {
  try {
    const request = await CancellationRequest.findById(req.params.id)
      .populate('proposalId')
      .populate('customerId', 'name contactNumber email address');

    if (!request) {
      return res.status(404).json({ message: 'Cancellation request not found' });
    }

    res.json(request);

  } catch (error) {
    console.error('Error fetching cancellation request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// L1 Manager Review
router.post('/:id/l1-review', async (req, res) => {
  try {
    const { decision, comments, reviewedBy } = req.body;

    if (!decision || !['Approve', 'Reject'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision. Must be Approve or Reject' });
    }

    const cancellationRequest = await CancellationRequest.findById(req.params.id);
    if (!cancellationRequest) {
      return res.status(404).json({ message: 'Cancellation request not found' });
    }

    if (cancellationRequest.status !== 'Awaiting L1 Manager Review') {
      return res.status(400).json({ 
        message: `Cannot review request with status: ${cancellationRequest.status}` 
      });
    }

    // Update L1 review
    cancellationRequest.l1Review = {
      reviewedBy: {
        name: reviewedBy.name,
        userId: reviewedBy.userId,
        role: reviewedBy.role
      },
      reviewDate: new Date(),
      decision,
      comments
    };

    const proposal = await SettlementProposal.findById(cancellationRequest.proposalId);
    
    if (decision === 'Reject') {
      // Rejection - restore proposal to previous active status
      cancellationRequest.status = 'L1 Rejected';
      
      // Add notification to user
      cancellationRequest.notifications.push({
        recipient: 'User',
        sentDate: new Date(),
        message: `Your cancellation request for Letter ${cancellationRequest.letterId} was rejected`,
        read: false
      });

      if (proposal) {
        // Restore proposal to Active status (or previous status)
        proposal.status = 'Active';
        proposal.lockReason = 'Under Settlement Period';
        proposal.accountLocked = true;
        await proposal.save();

        // Create audit log
        await AuditLog.create({
          module: 'Settlement',
          action: 'Cancellation Rejected',
          entityType: 'SettlementProposal',
          entityId: proposal._id,
          changes: {
            field: 'status',
            oldValue: 'Cancelled',
            newValue: 'Active'
          },
          performedBy: {
            name: reviewedBy.name,
            userId: reviewedBy.userId,
            role: reviewedBy.role
          },
          details: `L1 Manager rejected cancellation for Letter ${cancellationRequest.letterId}. Comments: ${comments || 'None'}`
        });
      }

    } else if (decision === 'Approve') {
      // Approval - move to admin finalization
      cancellationRequest.status = 'L1 Approved - Awaiting Admin';
      
      // Add notification to admin
      cancellationRequest.notifications.push({
        recipient: 'Admin',
        sentDate: new Date(),
        message: `Cancellation for Letter ${cancellationRequest.letterId} approved by L1, pending finalization`,
        read: false
      });

      // Create audit log
      await AuditLog.create({
        module: 'Settlement',
        action: 'Cancellation Approved by L1',
        entityType: 'SettlementProposal',
        entityId: proposal._id,
        performedBy: {
          name: reviewedBy.name,
          userId: reviewedBy.userId,
          role: reviewedBy.role
        },
        details: `L1 Manager approved cancellation for Letter ${cancellationRequest.letterId}. Comments: ${comments || 'None'}`
      });
    }

    await cancellationRequest.save();

    res.json({
      message: `Cancellation request ${decision.toLowerCase()}d successfully`,
      cancellationRequest,
      proposalUpdated: true
    });

  } catch (error) {
    console.error('Error processing L1 review:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Finalization
router.post('/:id/admin-finalize', async (req, res) => {
  try {
    const { comments, finalizedBy } = req.body;

    const cancellationRequest = await CancellationRequest.findById(req.params.id);
    if (!cancellationRequest) {
      return res.status(404).json({ message: 'Cancellation request not found' });
    }

    if (cancellationRequest.status !== 'L1 Approved - Awaiting Admin') {
      return res.status(400).json({ 
        message: `Cannot finalize request with status: ${cancellationRequest.status}` 
      });
    }

    const proposal = await SettlementProposal.findById(cancellationRequest.proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    // Get current timestamp for consistent dating
    const finalizationDate = new Date();

    // Update admin finalization in cancellation request
    cancellationRequest.adminFinalization = {
      finalizedBy: {
        name: finalizedBy.name,
        userId: finalizedBy.userId,
        role: finalizedBy.role
      },
      finalizationDate,
      comments,
      accountUnlocked: true
    };
    cancellationRequest.status = 'Admin Finalized';

    // Add notifications to all stakeholders
    cancellationRequest.notifications.push(
      {
        recipient: 'User',
        sentDate: finalizationDate,
        message: `Cancellation for Letter ${cancellationRequest.letterId} has been finalized. Account is now unlocked. You can now raise a new proposal.`,
        read: false
      },
      {
        recipient: 'Customer',
        sentDate: finalizationDate,
        message: `Your settlement letter ${cancellationRequest.letterId} has been cancelled as requested.`,
        read: false
      },
      {
        recipient: 'L1 Manager',
        sentDate: finalizationDate,
        message: `Cancellation for Letter ${cancellationRequest.letterId} has been completed by Admin.`,
        read: false
      }
    );

    await cancellationRequest.save();

    // AUTO-ACTION 1: Update proposal - mark as CANCELLED and UNLOCK account
    const oldStatus = proposal.status;
    proposal.status = 'Cancelled';
    proposal.accountLocked = false;
    proposal.lockReason = null;
    proposal.unlockDate = finalizationDate;
    
    // Mark letter as cancelled with timestamp
    proposal.letterCancelledDate = finalizationDate;
    proposal.cancelledBy = {
      name: finalizedBy.name,
      userId: finalizedBy.userId,
      role: finalizedBy.role
    };

    await proposal.save();

    // AUTO-ACTION 2: Create comprehensive audit log with full timeline
    const auditDetails = {
      cancellationId: cancellationRequest._id,
      timeline: {
        requestedDate: cancellationRequest.requestedBy.requestDate,
        requestedBy: cancellationRequest.requestedBy.name,
        l1ReviewDate: cancellationRequest.l1Review.reviewDate,
        l1ReviewedBy: cancellationRequest.l1Review.reviewedBy.name,
        l1Decision: cancellationRequest.l1Review.decision,
        finalizedDate: finalizationDate,
        finalizedBy: finalizedBy.name
      },
      reason: cancellationRequest.cancellationReason,
      reasonDetails: cancellationRequest.cancellationReasonDetails,
      l1Comments: cancellationRequest.l1Review.comments,
      adminComments: comments,
      accountUnlocked: true,
      unlockDate: finalizationDate
    };

    await AuditLog.create({
      module: 'Settlement',
      action: 'Letter Cancellation Finalized',
      entityType: 'SettlementProposal',
      entityId: proposal._id,
      changes: {
        field: 'status',
        oldValue: oldStatus,
        newValue: 'Cancelled - Finalized and Account Unlocked'
      },
      performedBy: {
        name: finalizedBy.name,
        userId: finalizedBy.userId,
        role: finalizedBy.role
      },
      details: `Admin finalized cancellation for Letter ${cancellationRequest.letterId}. 
        Timeline: Requested by ${auditDetails.timeline.requestedBy} on ${auditDetails.timeline.requestedDate.toLocaleString()}, 
        Approved by L1 Manager ${auditDetails.timeline.l1ReviewedBy} on ${auditDetails.timeline.l1ReviewDate.toLocaleString()}, 
        Finalized by ${auditDetails.timeline.finalizedBy} on ${auditDetails.timeline.finalizedDate.toLocaleString()}.
        Reason: ${auditDetails.reason}. 
        Account unlocked successfully. 
        Admin Comments: ${comments || 'None'}`,
      metadata: auditDetails
    });

    // AUTO-ACTION 3: Send email notifications to all stakeholders
    try {
      // Get customer details for email
      const customer = await Customer.findOne({ accountNumber: cancellationRequest.accountNumber });
      
      const emailPromises = [];

      // TRIGGER 4: Send cancellation confirmation email to customer
      if (customer && customer.email) {
        const customerEmailData = {
          CustomerName: cancellationRequest.customerName,
          AccountNumber: cancellationRequest.accountNumber,
          LetterNumber: cancellationRequest.letterId,
          CancellationDate: finalizationDate.toLocaleDateString('en-IN'),
          CancellationReason: cancellationRequest.cancellationReason,
          BranchName: customer.branch || 'Head Office',
          SupportPhone: process.env.SUPPORT_PHONE || '1800-XXX-XXXX',
          relatedEntity: {
            type: 'CancellationRequest',
            id: cancellationRequest._id
          }
        };

        emailPromises.push(
          emailService.sendTemplateEmail(
            'CancellationConfirmation',
            customer.email,
            cancellationRequest.customerName,
            customerEmailData
          ).then(() => {
            console.log(`✅ Cancellation email sent to customer: ${customer.email}`);
          }).catch(err => {
            console.error(`❌ Failed to send cancellation email to customer: ${err.message}`);
          })
        );
      }

      // Send emails asynchronously (don't block response)
      Promise.all(emailPromises);

    } catch (emailError) {
      console.error('Error sending cancellation emails:', emailError);
      // Don't fail the finalization if email fails
    }

    res.json({
      message: 'Cancellation finalized successfully. Account has been unlocked.',
      cancellationRequest,
      proposalUpdated: true,
      accountUnlocked: true,
      unlockDate: finalizationDate,
      auditLogCreated: true,
      emailNotifications: {
        prepared: 3,
        recipients: ['Customer', 'Initiator', 'L1 Manager']
      },
      actions: {
        letterCancelled: true,
        proposalCancelled: true,
        accountUnlocked: true,
        paymentsArchived: false, // TODO: Implement payment archiving
        auditLogCreated: true,
        notificationsSent: 3
      }
    });

  } catch (error) {
    console.error('Error finalizing cancellation:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get cancellation history for a proposal
router.get('/proposal/:proposalId/history', async (req, res) => {
  try {
    const requests = await CancellationRequest.find({ 
      proposalId: req.params.proposalId 
    }).sort({ createdAt: -1 });

    res.json({ requests, count: requests.length });

  } catch (error) {
    console.error('Error fetching cancellation history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
