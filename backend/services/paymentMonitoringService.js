const SettlementProposal = require('../models/SettlementProposal');
const Customer = require('../models/Customer');
const EmailLog = require('../models/EmailLog');
const { sendEmail } = require('./emailService');

/**
 * Payment Monitoring Service
 * Handles automatic payment tracking, status updates, and notifications
 */

/**
 * Check all active proposals for overdue payments
 * @returns {Object} - Summary of checks and overdue proposals
 */
async function checkAllPayments() {
  try {
    // Find all approved proposals that are not completed or broken
    const activeProposals = await SettlementProposal.find({
      status: { $in: ['APPROVED', 'IN_PROGRESS'] },
      'installments.0': { $exists: true }, // Has installments
    }).populate('customerId', 'name loanId email')
      .populate('initiatedBy', 'name email')
      .populate('managerId', 'name email');

    const overdueProposals = [];
    const now = new Date();
    
    for (const proposal of activeProposals) {
      let hasOverdue = false;
      let allPaid = true;
      
      // Check each installment
      for (const installment of proposal.installments) {
        if (installment.status === 'PAID') {
          continue; // Already paid, skip
        }
        
        allPaid = false;
        
        // Calculate grace period end (due date + 5 days)
        const dueDate = new Date(installment.dueDate);
        const gracePeriodEnd = new Date(dueDate);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 5);
        
        // Check if overdue
        if (now > gracePeriodEnd && installment.status !== 'OVERDUE') {
          hasOverdue = true;
          installment.status = 'OVERDUE';
          installment.overdueDate = now;
        } else if (now > dueDate && now <= gracePeriodEnd && installment.status !== 'GRACE_PERIOD') {
          installment.status = 'GRACE_PERIOD';
        }
      }
      
      // Update proposal status
      let statusChanged = false;
      
      if (hasOverdue && proposal.status !== 'BROKEN') {
        proposal.status = 'BROKEN';
        proposal.statusMessage = 'BROKEN SETTLEMENT ❌ - Payment Overdue';
        statusChanged = true;
        overdueProposals.push(proposal);
      } else if (allPaid && proposal.status !== 'COMPLETED') {
        proposal.status = 'COMPLETED';
        proposal.statusMessage = proposal.proposalType === 'SETTLEMENT' ? 'SETTLEMENT DONE ✓' : 'CLOSED ✓';
        proposal.completedDate = now;
        statusChanged = true;
      }
      
      // Save changes
      await proposal.save();
      
      // Send notifications if status changed to BROKEN
      if (statusChanged && proposal.status === 'BROKEN') {
        await sendOverdueNotification(proposal);
      }
    }
    
    return {
      totalChecked: activeProposals.length,
      overdueFound: overdueProposals.length > 0,
      overdueProposals: overdueProposals.map(p => ({
        _id: p._id,
        letterId: p.letterId,
        customerName: p.customerId?.name,
        loanId: p.customerId?.loanId,
        proposalType: p.proposalType,
        manager: p.managerId?.email,
        initiator: p.initiatedBy?.email,
      })),
      timestamp: now,
    };
  } catch (error) {
    console.error('Error checking payments:', error);
    throw error;
  }
}

/**
 * Get monitoring data for dashboard
 * @returns {Array} - All active proposals with installment details
 */
async function getMonitoringData() {
  try {
    const proposals = await SettlementProposal.find({
      status: { $in: ['APPROVED', 'IN_PROGRESS', 'BROKEN', 'COMPLETED'] },
    })
      .populate('customerId', 'name loanId email')
      .populate('initiatedBy', 'name email')
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });

    return proposals.map(proposal => {
      const installments = proposal.installments || [];
      const paidCount = installments.filter(i => i.status === 'PAID').length;
      const overdueCount = installments.filter(i => i.status === 'OVERDUE').length;
      
      return {
        _id: proposal._id,
        letterId: proposal.letterId,
        customerName: proposal.customerId?.name,
        loanId: proposal.customerId?.loanId,
        customerId: proposal.customerId?._id,
        proposalType: proposal.proposalType,
        proposedAmount: proposal.proposedAmount,
        waiver: proposal.waiver,
        installments: installments.map(inst => ({
          dueDate: inst.dueDate,
          amount: inst.amount,
          status: inst.status || 'SCHEDULED',
          paidDate: inst.paidDate,
          overdueDate: inst.overdueDate,
        })),
        status: proposal.status,
        statusMessage: proposal.statusMessage,
        completedDate: proposal.completedDate,
        manager: proposal.managerId?.name,
        managerEmail: proposal.managerId?.email,
        initiator: proposal.initiatedBy?.name,
        initiatorEmail: proposal.initiatedBy?.email,
        progress: {
          paid: paidCount,
          total: installments.length,
          overdue: overdueCount,
          percentage: installments.length > 0 ? (paidCount / installments.length * 100) : 0,
        },
      };
    });
  } catch (error) {
    console.error('Error getting monitoring data:', error);
    throw error;
  }
}

/**
 * Mark installment as paid
 * @param {String} proposalId - Proposal ID
 * @param {Number} installmentIndex - Index of installment to mark as paid
 * @param {Date} paymentDate - Date of payment
 */
async function markInstallmentPaid(proposalId, installmentIndex, paymentDate = new Date()) {
  try {
    const proposal = await SettlementProposal.findById(proposalId);
    
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    
    if (!proposal.installments || !proposal.installments[installmentIndex]) {
      throw new Error('Installment not found');
    }
    
    // Update installment status
    proposal.installments[installmentIndex].status = 'PAID';
    proposal.installments[installmentIndex].paidDate = paymentDate;
    
    // Check if all installments are paid
    const allPaid = proposal.installments.every(inst => inst.status === 'PAID');
    
    if (allPaid) {
      proposal.status = 'COMPLETED';
      proposal.statusMessage = proposal.proposalType === 'SETTLEMENT' ? 'SETTLEMENT DONE ✓' : 'CLOSED ✓';
      proposal.completedDate = new Date();
      
      // Send completion notification
      await sendCompletionNotification(proposal);
    } else {
      proposal.status = 'IN_PROGRESS';
    }
    
    await proposal.save();
    
    return proposal;
  } catch (error) {
    console.error('Error marking installment as paid:', error);
    throw error;
  }
}

/**
 * Send overdue payment notification
 * @param {Object} proposal - Settlement proposal object
 */
async function sendOverdueNotification(proposal) {
  try {
    const overdueInstallments = proposal.installments.filter(i => i.status === 'OVERDUE');
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #D32F2F 0%, #F44336 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">⚠️ OVERDUE PAYMENT ALERT</h2>
        </div>
        
        <div style="background: #FFEBEE; padding: 20px; border-left: 4px solid #D32F2F;">
          <h3 style="color: #D32F2F; margin-top: 0;">Settlement Proposal Broken</h3>
          <p>One or more installments are overdue (past due date + 5-day grace period).</p>
        </div>
        
        <div style="padding: 20px; background: white;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Letter ID:</td>
              <td style="padding: 8px 0; font-weight: 600;">${proposal.letterId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Customer Name:</td>
              <td style="padding: 8px 0; font-weight: 600;">${proposal.customerId?.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Account Number:</td>
              <td style="padding: 8px 0; font-weight: 600;">${proposal.customerId?.loanId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Proposal Type:</td>
              <td style="padding: 8px 0; font-weight: 600;">${proposal.proposalType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Proposed Amount:</td>
              <td style="padding: 8px 0; font-weight: 600;">₹${proposal.proposedAmount?.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Status:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #D32F2F;">BROKEN SETTLEMENT ❌</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: #FFF3E0; border-left: 4px solid #FF9800; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #E65100;">Overdue Installments</h4>
            ${overdueInstallments.map((inst, index) => `
              <div style="margin-bottom: 10px;">
                <strong>Installment ${proposal.installments.indexOf(inst) + 1}:</strong>
                <br />Due Date: ${new Date(inst.dueDate).toLocaleDateString('en-IN')}
                <br />Amount: ₹${inst.amount?.toLocaleString('en-IN')}
                <br />Status: <span style="color: #D32F2F; font-weight: 600;">OVERDUE</span>
              </div>
            `).join('')}
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #E3F2FD; border-left: 4px solid #1976D2; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #1565C0;">Action Required</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>User must cancel the existing letter to raise a new proposal</li>
              <li>Account Status: <strong>LOCKED</strong> (Remains locked until issue is resolved)</li>
              <li>Follow up with the customer immediately</li>
            </ul>
          </div>
        </div>
        
        <div style="padding: 15px; background: #F5F5F5; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            This is an automated notification from Debtrix CRM Payment Monitoring System
          </p>
        </div>
      </div>
    `;
    
    // Send to Manager
    if (proposal.managerId?.email) {
      await sendEmail({
        to: proposal.managerId.email,
        subject: `⚠️ OVERDUE PAYMENT - ${proposal.letterId} - ${proposal.customerId?.name}`,
        html: emailContent,
      });
      
      // Log email
      await EmailLog.create({
        recipient: proposal.managerId.email,
        recipientType: 'MANAGER',
        subject: `⚠️ OVERDUE PAYMENT - ${proposal.letterId}`,
        status: 'sent',
        sentAt: new Date(),
        relatedEntity: 'SettlementProposal',
        relatedEntityId: proposal._id,
      });
    }
    
    // Send to Initiator
    if (proposal.initiatedBy?.email) {
      await sendEmail({
        to: proposal.initiatedBy.email,
        subject: `⚠️ OVERDUE PAYMENT - ${proposal.letterId} - ${proposal.customerId?.name}`,
        html: emailContent,
      });
      
      // Log email
      await EmailLog.create({
        recipient: proposal.initiatedBy.email,
        recipientType: 'INITIATOR',
        subject: `⚠️ OVERDUE PAYMENT - ${proposal.letterId}`,
        status: 'sent',
        sentAt: new Date(),
        relatedEntity: 'SettlementProposal',
        relatedEntityId: proposal._id,
      });
    }
    
    console.log(`Overdue notifications sent for proposal ${proposal.letterId}`);
  } catch (error) {
    console.error('Error sending overdue notification:', error);
    // Don't throw - notification failure shouldn't break monitoring
  }
}

/**
 * Send completion notification
 * @param {Object} proposal - Settlement proposal object
 */
async function sendCompletionNotification(proposal) {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0;">✓ Settlement Complete</h2>
        </div>
        
        <div style="background: #E8F5E9; padding: 20px; border-left: 4px solid #4CAF50;">
          <h3 style="color: #2E7D32; margin-top: 0;">All Payments Received Successfully</h3>
          <p>All installments have been paid according to the settlement schedule.</p>
        </div>
        
        <div style="padding: 20px; background: white;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Letter ID:</td>
              <td style="padding: 8px 0; font-weight: 600;">${proposal.letterId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Customer Name:</td>
              <td style="padding: 8px 0; font-weight: 600;">${proposal.customerId?.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Account Number:</td>
              <td style="padding: 8px 0; font-weight: 600;">${proposal.customerId?.loanId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Proposal Type:</td>
              <td style="padding: 8px 0; font-weight: 600;">${proposal.proposalType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Total Amount Collected:</td>
              <td style="padding: 8px 0; font-weight: 600;">₹${proposal.proposedAmount?.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Status:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #4CAF50;">${proposal.statusMessage}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: #E3F2FD; border-left: 4px solid #1976D2; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #1565C0;">Next Steps</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Account Status: <strong>LOCKED</strong></li>
              <li>Generate ${proposal.proposalType === 'SETTLEMENT' ? 'NOC (No Objection Certificate)' : 'NDC (No Dues Certificate)'} letter</li>
              <li>Provide the letter to the customer</li>
              <li>Close the account after verification</li>
            </ul>
          </div>
        </div>
        
        <div style="padding: 15px; background: #F5F5F5; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            This is an automated notification from Debtrix CRM Payment Monitoring System
          </p>
        </div>
      </div>
    `;
    
    // Send to Manager
    if (proposal.managerId?.email) {
      await sendEmail({
        to: proposal.managerId.email,
        subject: `✓ Settlement Complete - ${proposal.letterId} - ${proposal.customerId?.name}`,
        html: emailContent,
      });
      
      await EmailLog.create({
        recipient: proposal.managerId.email,
        recipientType: 'MANAGER',
        subject: `✓ Settlement Complete - ${proposal.letterId}`,
        status: 'sent',
        sentAt: new Date(),
        relatedEntity: 'SettlementProposal',
        relatedEntityId: proposal._id,
      });
    }
    
    // Send to Initiator
    if (proposal.initiatedBy?.email) {
      await sendEmail({
        to: proposal.initiatedBy.email,
        subject: `✓ Settlement Complete - ${proposal.letterId} - ${proposal.customerId?.name}`,
        html: emailContent,
      });
      
      await EmailLog.create({
        recipient: proposal.initiatedBy.email,
        recipientType: 'INITIATOR',
        subject: `✓ Settlement Complete - ${proposal.letterId}`,
        status: 'sent',
        sentAt: new Date(),
        relatedEntity: 'SettlementProposal',
        relatedEntityId: proposal._id,
      });
    }
    
    console.log(`Completion notifications sent for proposal ${proposal.letterId}`);
  } catch (error) {
    console.error('Error sending completion notification:', error);
  }
}

module.exports = {
  checkAllPayments,
  getMonitoringData,
  markInstallmentPaid,
  sendOverdueNotification,
  sendCompletionNotification,
};
