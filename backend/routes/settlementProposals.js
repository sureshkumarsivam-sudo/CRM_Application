const express = require('express');
const router = express.Router();
const SettlementProposal = require('../models/SettlementProposal');
const AuditLog = require('../models/AuditLog');
const Customer = require('../models/Customer');
const PTPPayment = require('../models/PTPPayment');
const emailService = require('../services/emailService');

// Helper function to create audit log
async function createAuditLog(proposalId, letterId, action, user, details = '', previousStatus = '', newStatus = '') {
  try {
    await AuditLog.create({
      proposalId,
      letterId,
      action,
      user,
      details,
      previousStatus,
      newStatus
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}

// GET /api/settlement-proposals - List all proposals with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      proposalType,
      search,
      startDate,
      endDate
    } = req.query;

    const query = {};

    // Apply filters
    if (status && status !== 'All') {
      query.status = status;
    }
    if (proposalType && proposalType !== 'All') {
      query.proposalType = proposalType;
    }
    if (search) {
      query.$or = [
        { letterId: new RegExp(search, 'i') },
        { accountNumber: new RegExp(search, 'i') },
        { customerName: new RegExp(search, 'i') }
      ];
    }
    if (startDate || endDate) {
      query.proposalDate = {};
      if (startDate) query.proposalDate.$gte = new Date(startDate);
      if (endDate) query.proposalDate.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const proposals = await SettlementProposal.find(query)
      .populate('customerId', 'customerName loanId mobileNo currentOutstanding')
      .sort({ proposalDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SettlementProposal.countDocuments(query);

    res.json({
      proposals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// GET /api/settlement-proposals/dashboard-stats - Get dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalProposals = await SettlementProposal.countDocuments();
    const pendingApprovalL1 = await SettlementProposal.countDocuments({ status: 'Pending L1' });
    const pendingApprovalL2 = await SettlementProposal.countDocuments({ status: 'Pending L2' });
    const pendingApproval = pendingApprovalL1 + pendingApprovalL2;
    const activePlans = await SettlementProposal.countDocuments({ status: 'Active' });
    const completed = await SettlementProposal.countDocuments({ status: 'Completed' });
    
    // Calculate total waiver amount
    const waiverResult = await SettlementProposal.aggregate([
      { $match: { status: { $in: ['Active', 'Completed'] } } },
      { $group: { _id: null, total: { $sum: '$waiverAmount' } } }
    ]);
    const totalWaiverAmount = waiverResult.length > 0 ? waiverResult[0].total : 0;
    
    // Calculate average waiver percentage
    const avgWaiverResult = await SettlementProposal.aggregate([
      { $match: { status: { $in: ['Active', 'Completed'] } } },
      { $group: { _id: null, avg: { $avg: '$waiverPercentage' } } }
    ]);
    const averageWaiverPercentage = avgWaiverResult.length > 0 ? avgWaiverResult[0].avg : 0;

    // Proposal status distribution
    const statusDistribution = await SettlementProposal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly proposal trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends = await SettlementProposal.aggregate([
      {
        $match: {
          proposalDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$proposalDate' },
            month: { $month: '$proposalDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent proposals
    const recentProposals = await SettlementProposal.find()
      .sort({ proposalDate: -1 })
      .limit(5)
      .select('letterId customerName proposalType status proposalDate');

    res.json({
      summary: {
        totalProposals,
        pendingApproval,
        activePlans,
        totalWaiverAmount,
        averageWaiverPercentage: averageWaiverPercentage.toFixed(2)
      },
      statusDistribution,
      monthlyTrends,
      recentProposals
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET /api/settlement-proposals/:id - Get single proposal
router.get('/:id', async (req, res) => {
  try {
    const proposal = await SettlementProposal.findById(req.params.id)
      .populate('customerId');
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json(proposal);
  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({ error: 'Failed to fetch proposal' });
  }
});

// GET /api/settlement-proposals/check-lock/:accountNumber - Check if account is locked
router.get('/check-lock/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;
    
    // Find any active locked proposals for this account
    const lockedProposal = await SettlementProposal.findOne({
      accountNumber,
      accountLocked: true,
      status: { $nin: ['Completed', 'Rejected'] } // Exclude completed/rejected
    }).sort({ proposalDate: -1 });

    if (lockedProposal) {
      return res.json({
        locked: true,
        reason: lockedProposal.lockReason,
        letterId: lockedProposal.letterId,
        status: lockedProposal.status,
        proposalType: lockedProposal.proposalType,
        lockDate: lockedProposal.lockDate,
        proposal: lockedProposal
      });
    }

    res.json({ locked: false });
  } catch (error) {
    console.error('Error checking account lock:', error);
    res.status(500).json({ error: 'Failed to check account lock status' });
  }
});

// POST /api/settlement-proposals - Create new proposal
router.post('/', async (req, res) => {
  try {
    const {
      proposalType,
      accountNumber,
      customerId,
      customerName,
      totalOutstanding,
      principalOutstanding,
      proposedAmount,
      waiverAmount,
      waiverPercentage,
      paymentType,
      numberOfInstallments,
      installments,
      notes
    } = req.body;

    // Validate customerId is provided
    if (!customerId) {
      return res.status(400).json({ error: 'Customer ID is required. Please search for a valid account number.' });
    }

    // Check if account is locked
    const lockedProposal = await SettlementProposal.findOne({
      accountNumber,
      accountLocked: true,
      status: { $nin: ['Completed', 'Rejected'] }
    }).sort({ proposalDate: -1 });

    if (lockedProposal) {
      return res.status(423).json({ 
        error: 'Account is locked',
        locked: true,
        reason: lockedProposal.lockReason,
        letterId: lockedProposal.letterId,
        status: lockedProposal.status,
        proposalType: lockedProposal.proposalType
      });
    }

    // Find customer by ID to validate it exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found with this ID' });
    }

    // Verify account number matches
    if (customer.loanId !== accountNumber) {
      return res.status(400).json({ error: 'Account number does not match customer record' });
    }

    // **VALIDATION: Check if account is already CLOSED or SETTLED**
    const accountStatus = customer.status || customer.accountStatus || '';
    const statusLower = accountStatus.toLowerCase();
    
    if (statusLower.includes('closed') || statusLower === 'closed ✓') {
      return res.status(400).json({ 
        error: 'Proposal creation blocked',
        message: 'Already Closed',
        reason: 'This account is already closed. No new proposal can be created.',
        accountStatus: accountStatus,
        blocked: true
      });
    }
    
    if (statusLower.includes('settlement done') || statusLower.includes('settled') || statusLower === 'settlement done ✓') {
      return res.status(400).json({ 
        error: 'Proposal creation blocked',
        message: 'Already Settled',
        reason: 'This account has already been settled. No new proposal can be created.',
        accountStatus: accountStatus,
        blocked: true
      });
    }

    const proposal = new SettlementProposal({
      proposalType,
      customerId: customer._id,
      accountNumber,
      customerName: customerName || customer.accountName,
      totalOutstanding,
      principalOutstanding,
      proposedAmount,
      waiverAmount,
      waiverPercentage,
      paymentType,
      numberOfInstallments,
      installments,
      notes,
      createdBy: {
        name: 'Initiator',
        userId: 'system',
        role: 'Initiator'
      }
    });

    await proposal.save();

    // Create audit log
    await createAuditLog(
      proposal._id,
      proposal.letterId,
      'Proposal Created',
      { name: 'Initiator', userId: 'system', role: 'Initiator' },
      `${proposalType} proposal for ${customerName}`,
      '',
      'Pending L1'
    );

    res.status(201).json({ success: true, proposal });
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ error: 'Failed to create proposal', details: error.message });
  }
});

// PUT /api/settlement-proposals/:id - Update proposal
router.put('/:id', async (req, res) => {
  try {
    const proposal = await SettlementProposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const previousStatus = proposal.status;
    Object.assign(proposal, req.body);
    proposal.modifiedBy = {
      name: req.body.modifiedByName || 'System',
      userId: req.body.modifiedByUserId || 'system',
      role: req.body.modifiedByRole || 'Admin'
    };

    await proposal.save();

    // Create audit log
    await createAuditLog(
      proposal._id,
      proposal.letterId,
      'Proposal Modified',
      proposal.modifiedBy,
      'Proposal details updated',
      previousStatus,
      proposal.status
    );

    res.json(proposal);
  } catch (error) {
    console.error('Error updating proposal:', error);
    res.status(500).json({ error: 'Failed to update proposal' });
  }
});

// POST /api/settlement-proposals/:id/approve-l1 - L1 Approval
router.post('/:id/approve-l1', async (req, res) => {
  try {
    const { approved, comments, approverName } = req.body;
    const proposal = await SettlementProposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.status !== 'Pending L1') {
      return res.status(400).json({ error: 'Proposal is not in Pending L1 status' });
    }

    const previousStatus = proposal.status;
    const user = {
      name: approverName || 'Manager L1',
      userId: 'manager-l1',
      role: 'Manager L1'
    };

    proposal.approvals.push({
      level: 'L1',
      status: approved ? 'Approved' : 'Rejected',
      approvedBy: user,
      approvedAt: new Date(),
      comments
    });

    proposal.status = approved ? 'Pending L2' : 'Rejected';
    await proposal.save();

    // Create audit log
    await createAuditLog(
      proposal._id,
      proposal.letterId,
      approved ? 'L1 Approved' : 'L1 Rejected',
      user,
      comments || '',
      previousStatus,
      proposal.status
    );

    res.json(proposal);
  } catch (error) {
    console.error('Error in L1 approval:', error);
    res.status(500).json({ error: 'Failed to process L1 approval' });
  }
});

// POST /api/settlement-proposals/:id/approve-l2 - L2 Approval & Letter Generation
router.post('/:id/approve-l2', async (req, res) => {
  try {
    const { approved, comments, approverName } = req.body;
    const proposal = await SettlementProposal.findById(req.params.id);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.status !== 'Pending L2') {
      return res.status(400).json({ error: 'Proposal is not in Pending L2 status' });
    }

    const previousStatus = proposal.status;
    const user = {
      name: approverName || 'Manager L2',
      userId: 'manager-l2',
      role: 'Manager L2'
    };

    proposal.approvals.push({
      level: 'L2',
      status: approved ? 'Approved' : 'Rejected',
      approvedBy: user,
      approvedAt: new Date(),
      comments
    });

    if (approved) {
      proposal.status = 'Active';
      proposal.approvalDate = new Date();
      proposal.letterGenerated = true;
      proposal.letterGeneratedDate = new Date();
    } else {
      proposal.status = 'Rejected';
    }

    await proposal.save();

    // Create audit log
    await createAuditLog(
      proposal._id,
      proposal.letterId,
      approved ? 'L2 Approval & Letter Generation' : 'L2 Rejected',
      user,
      comments || '',
      previousStatus,
      proposal.status
    );

    // TRIGGER 1: Send letter approved email to customer
    if (approved) {
      try {
        const customer = await Customer.findOne({ accountNumber: proposal.accountNumber });
        
        if (customer && customer.email) {
          // Get installment schedule
          const installments = await PTPPayment.find({ proposalId: proposal._id }).sort({ installmentNumber: 1 });
          
          let installmentScheduleHTML = '<table style="width: 100%; border-collapse: collapse;">';
          installmentScheduleHTML += '<tr style="background-color: #FFAB40; color: white;"><th style="padding: 10px; border: 1px solid #ddd;">Installment</th><th style="padding: 10px; border: 1px solid #ddd;">Due Date</th><th style="padding: 10px; border: 1px solid #ddd;">Amount</th></tr>';
          
          installments.forEach(inst => {
            installmentScheduleHTML += `<tr>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">#${inst.installmentNumber}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${inst.dueDate.toLocaleDateString('en-IN')}</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">₹${inst.amount.toLocaleString('en-IN')}</td>
            </tr>`;
          });
          installmentScheduleHTML += '</table>';

          const emailData = {
            CustomerName: customer.customerName,
            AccountNumber: proposal.accountNumber,
            LetterNumber: proposal.letterNumber,
            SettlementAmount: proposal.proposedAmount.toLocaleString('en-IN'),
            WaiverAmount: proposal.waiverAmount.toLocaleString('en-IN'),
            WaiverPercentage: ((proposal.waiverAmount / proposal.outstandingAmount) * 100).toFixed(2),
            InstallmentSchedule: installmentScheduleHTML,
            PaymentMethod: proposal.paymentMethod || 'As per agreement',
            BranchName: customer.branch || 'Head Office',
            SupportPhone: process.env.SUPPORT_PHONE || '1800-XXX-XXXX',
            relatedEntity: {
              type: 'SettlementProposal',
              id: proposal._id
            }
          };

          // Send email asynchronously (don't block response)
          emailService.sendTemplateEmail(
            'LetterApproved',
            customer.email,
            customer.customerName,
            emailData
          ).then(() => {
            console.log(`✅ Letter approved email sent to ${customer.email}`);
          }).catch(err => {
            console.error(`❌ Failed to send letter approved email: ${err.message}`);
          });
        }
      } catch (emailError) {
        console.error('Error sending letter approved email:', emailError);
        // Don't fail the approval if email fails
      }
    }

    res.json(proposal);
  } catch (error) {
    console.error('Error in L2 approval:', error);
    res.status(500).json({ error: 'Failed to process L2 approval' });
  }
});

// POST /api/settlement-proposals/:id/mark-paid - Mark installment as paid
router.post('/:id/mark-paid', async (req, res) => {
  try {
    const { installmentNumber } = req.body;
    const proposal = await SettlementProposal.findById(req.params.id).populate('customerId');
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const installment = proposal.installments.find(i => i.installmentNumber === installmentNumber);
    if (!installment) {
      return res.status(404).json({ error: 'Installment not found' });
    }

    // Prevent duplicate updates if already paid
    if (installment.status === 'Paid' || installment.status === 'PAID') {
      return res.status(400).json({ 
        error: 'Installment already marked as paid',
        message: 'This installment has already been marked as paid'
      });
    }

    installment.status = 'Paid';
    installment.paidDate = new Date();

    // Check if all installments are paid
    const allPaid = proposal.installments.every(i => i.status === 'Paid' || i.status === 'PAID');
    
    let accountStatusUpdated = false;
    let newAccountStatus = '';
    let oldAccountStatus = '';

    if (allPaid) {
      proposal.status = 'Completed';
      proposal.completionDate = new Date();

      // **AUTOMATIC STATUS SYNCHRONIZATION**
      // Update Account/Customer status based on proposal type
      if (proposal.customerId) {
        try {
          const customer = await Customer.findById(proposal.customerId);
          if (customer) {
            oldAccountStatus = customer.status || customer.accountStatus || 'N/A';
            
            // Determine new status based on proposal type
            if (proposal.proposalType === 'Settlement') {
              newAccountStatus = 'SETTLEMENT DONE ✓';
              customer.status = 'SETTLEMENT DONE ✓';
              customer.accountStatus = 'SETTLED';
              customer.settlementStatus = 'SETTLEMENT DONE ✓';
            } else if (proposal.proposalType === 'Closure') {
              newAccountStatus = 'CLOSED ✓';
              customer.status = 'CLOSED ✓';
              customer.accountStatus = 'CLOSED';
              customer.settlementStatus = 'CLOSED ✓';
            }
            
            // Update payment information
            customer.paidAmount = (customer.paidAmount || 0) + proposal.proposedAmount;
            customer.lastPaymentDate = new Date();
            customer.updatedAt = new Date();
            
            await customer.save();
            accountStatusUpdated = true;
            
            // Create audit log for account status change
            await AuditLog.create({
              customerId: customer._id,
              accountNumber: proposal.accountNumber,
              action: 'Payment Marked as Paid - Account Status Updated',
              user: { 
                name: req.user?.name || 'System', 
                userId: req.user?._id || 'system', 
                role: req.user?.role || 'Admin' 
              },
              details: `All installments paid. Account status updated from "${oldAccountStatus}" to "${newAccountStatus}"`,
              previousStatus: oldAccountStatus,
              newStatus: newAccountStatus,
              proposalId: proposal._id,
              letterId: proposal.letterId,
              timestamp: new Date()
            });
          }
        } catch (accountUpdateError) {
          console.error('Error updating account status:', accountUpdateError);
          // Continue with proposal save even if account update fails
        }
      }
    }

    await proposal.save();

    // Create audit log for installment payment
    await createAuditLog(
      proposal._id,
      proposal.letterId,
      allPaid ? 'Proposal Completed' : 'Installment Paid',
      { 
        name: req.user?.name || 'System', 
        userId: req.user?._id || 'system', 
        role: req.user?.role || 'Admin' 
      },
      `Installment ${installmentNumber} marked as paid${allPaid ? '. All installments completed.' : ''}`,
      '',
      proposal.status
    );

    res.json({
      proposal,
      accountStatusUpdated,
      newAccountStatus: accountStatusUpdated ? newAccountStatus : null,
      message: allPaid 
        ? `All installments paid. ${accountStatusUpdated ? `Account status updated to "${newAccountStatus}"` : 'Proposal completed.'}`
        : 'Installment marked as paid successfully'
    });
  } catch (error) {
    console.error('Error marking installment as paid:', error);
    res.status(500).json({ 
      error: 'Failed to mark installment as paid',
      details: error.message 
    });
  }
});

// DELETE /api/settlement-proposals/:id - Delete proposal
router.delete('/:id', async (req, res) => {
  try {
    const proposal = await SettlementProposal.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    await SettlementProposal.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Error deleting proposal:', error);
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
});

// GET /api/settlement-proposals/approvals/pending - Get pending approvals
router.get('/approvals/pending', async (req, res) => {
  try {
    const { level } = req.query;
    
    const query = level ? { status: level === 'L1' ? 'Pending L1' : 'Pending L2' } : {
      status: { $in: ['Pending L1', 'Pending L2'] }
    };

    const proposals = await SettlementProposal.find(query)
      .populate('customerId')
      .sort({ proposalDate: -1 });

    res.json(proposals);
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
});

// GET /api/settlement-proposals/:id/audit-log - Get audit log for a proposal
router.get('/:id/audit-log', async (req, res) => {
  try {
    const logs = await AuditLog.find({ proposalId: req.params.id })
      .sort({ timestamp: -1 });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
});

// POST /api/settlement-proposals/check-overdue - Check for overdue payments and update status
router.post('/check-overdue', async (req, res) => {
  try {
    const now = new Date();
    const activeProposals = await SettlementProposal.find({ 
      status: 'Active',
      paymentType: 'Installment'
    });

    const updates = [];
    const brokenProposals = [];

    for (const proposal of activeProposals) {
      let hasOverdue = false;
      let proposalBroken = false;
      
      for (const installment of proposal.installments) {
        if (installment.status === 'Pending') {
          const dueDate = new Date(installment.dueDate);
          const gracePeriodEnd = new Date(dueDate);
          gracePeriodEnd.setDate(gracePeriodEnd.getDate() + (proposal.gracePeriodDays || 5));
          
          // Check if past grace period
          if (now > gracePeriodEnd) {
            installment.status = 'Overdue';
            hasOverdue = true;
            proposalBroken = true;
          }
        }
      }
      
      if (proposalBroken && proposal.status !== 'Broken Settlement') {
        proposal.status = 'Broken Settlement';
        proposal.lockReason = 'Broken Settlement';
        proposal.accountLocked = true;
        proposal.lastPaymentCheck = now;
        
        // Mark for email notification if not already sent
        if (!proposal.overdueNotificationSent) {
          proposal.overdueNotificationSent = true;
          proposal.overdueNotificationDate = now;
          
          brokenProposals.push({
            letterId: proposal.letterId,
            customerName: proposal.customerName,
            accountNumber: proposal.accountNumber,
            email: 'manager@debtrix.com' // Replace with actual manager email
          });
        }
        
        await proposal.save();
        
        // Create audit log
        await createAuditLog(
          proposal._id,
          proposal.letterId,
          'Status Changed',
          { name: 'System', userId: 'system', role: 'System' },
          'Proposal marked as Broken Settlement due to overdue payment',
          'Active',
          'Broken Settlement'
        );
        
        updates.push({
          letterId: proposal.letterId,
          status: 'Broken Settlement',
          overdueInstallments: proposal.installments.filter(i => i.status === 'Overdue').length
        });
      } else if (hasOverdue) {
        await proposal.save();
      }
    }

    res.json({
      message: 'Overdue check completed',
      updatedCount: updates.length,
      updates,
      emailNotifications: brokenProposals.length
    });
  } catch (error) {
    console.error('Error checking overdue payments:', error);
    res.status(500).json({ error: 'Failed to check overdue payments' });
  }
});

// GET /api/settlement-proposals/payment-dashboard/stats - Get payment tracking dashboard stats
router.get('/payment-dashboard/stats', async (req, res) => {
  try {
    const activeProposals = await SettlementProposal.find({ 
      status: 'Active',
      paymentType: 'Installment'
    });

    let totalDue = 0;
    let totalReceived = 0;
    let dueSoon = 0;
    let overdue = 0;
    const now = new Date();
    const twoDaysFromNow = new Date(now);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    const installmentDetails = [];

    for (const proposal of activeProposals) {
      for (const installment of proposal.installments) {
        const dueDate = new Date(installment.dueDate);
        const gracePeriodEnd = new Date(dueDate);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + (proposal.gracePeriodDays || 5));
        
        totalDue += installment.amount;
        
        if (installment.status === 'Paid') {
          totalReceived += installment.amount;
        }

        let status = 'Pending';
        let statusColor = 'default';
        
        if (installment.status === 'Paid') {
          status = 'Paid';
          statusColor = 'success';
        } else if (now > gracePeriodEnd) {
          status = 'Overdue';
          statusColor = 'error';
          overdue++;
        } else if (dueDate <= twoDaysFromNow && dueDate >= now) {
          status = 'Due Soon';
          statusColor = 'warning';
          dueSoon++;
        }

        installmentDetails.push({
          proposalId: proposal._id,
          letterId: proposal.letterId,
          customerName: proposal.customerName,
          accountNumber: proposal.accountNumber,
          installmentNumber: installment.installmentNumber,
          dueDate: installment.dueDate,
          dueAmount: installment.amount,
          receivedAmount: installment.status === 'Paid' ? installment.amount : 0,
          paidDate: installment.paidDate,
          status,
          statusColor,
          gracePeriodEnd
        });
      }
    }

    // Sort by due date
    installmentDetails.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json({
      totalDue,
      totalReceived,
      totalPending: totalDue - totalReceived,
      dueSoonCount: dueSoon,
      overdueCount: overdue,
      installments: installmentDetails,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error fetching payment dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch payment dashboard statistics' });
  }
});

module.exports = router;
