const cron = require('node-cron');
const PTPPayment = require('../models/PTPPayment');
const SettlementProposal = require('../models/SettlementProposal');
const Customer = require('../models/Customer');
const emailService = require('./emailService');

class ScheduledEmailService {
  constructor() {
    this.jobs = [];
  }

  // Initialize all scheduled tasks
  async initialize() {
    console.log('🕒 Initializing scheduled email tasks...');

    // Payment Reminder - Runs daily at 9 AM
    const paymentReminderJob = cron.schedule('0 9 * * *', async () => {
      await this.sendPaymentReminders();
    });

    // Overdue Alert - Runs daily at 10 AM
    const overdueAlertJob = cron.schedule('0 10 * * *', async () => {
      await this.sendOverdueAlerts();
    });

    // Auto-retry failed emails - Runs every hour
    const retryFailedEmailsJob = cron.schedule('0 * * * *', async () => {
      await this.retryFailedEmails();
    });

    this.jobs.push(paymentReminderJob, overdueAlertJob, retryFailedEmailsJob);

    console.log('✅ Scheduled email tasks initialized');
    console.log('  - Payment Reminders: Daily at 9:00 AM');
    console.log('  - Overdue Alerts: Daily at 10:00 AM');
    console.log('  - Email Retry: Every hour');
  }

  // Send payment reminders for installments due in 2 days
  async sendPaymentReminders() {
    try {
      console.log('📧 Processing payment reminders...');

      const twoDaysFromNow = new Date();
      twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
      twoDaysFromNow.setHours(0, 0, 0, 0);

      const twoDaysFromNowEnd = new Date(twoDaysFromNow);
      twoDaysFromNowEnd.setHours(23, 59, 59, 999);

      // Find installments due in 2 days that haven't been paid
      const dueInstallments = await PTPPayment.find({
        dueDate: {
          $gte: twoDaysFromNow,
          $lte: twoDaysFromNowEnd
        },
        status: 'Pending'
      }).populate('proposalId');

      console.log(`  Found ${dueInstallments.length} installments due in 2 days`);

      for (const installment of dueInstallments) {
        try {
          const proposal = installment.proposalId;
          if (!proposal) continue;

          // Get customer details
          const customer = await Customer.findOne({ accountNumber: proposal.accountNumber });
          if (!customer || !customer.email) {
            console.log(`  ⏭️  Skipping: No email for account ${proposal.accountNumber}`);
            continue;
          }

          // Prepare email data
          const emailData = {
            CustomerName: customer.customerName,
            AccountNumber: proposal.accountNumber,
            LetterNumber: proposal.letterNumber,
            InstallmentNumber: installment.installmentNumber,
            AmountDue: installment.amount.toLocaleString('en-IN'),
            DueDate: installment.dueDate.toLocaleDateString('en-IN'),
            PaymentMethod: proposal.paymentMethod || 'As per agreement',
            SupportPhone: process.env.SUPPORT_PHONE || '1800-XXX-XXXX',
            relatedEntity: {
              type: 'PTPPayment',
              id: installment._id
            }
          };

          // Send email
          await emailService.sendTemplateEmail(
            'PaymentReminder',
            customer.email,
            customer.customerName,
            emailData
          );

          console.log(`  ✅ Reminder sent to ${customer.email} for installment #${installment.installmentNumber}`);
        } catch (error) {
          console.error(`  ❌ Error sending reminder for installment ${installment._id}:`, error.message);
        }
      }

      console.log('✅ Payment reminder processing complete');
    } catch (error) {
      console.error('❌ Error in payment reminder job:', error);
    }
  }

  // Send overdue alerts for installments past grace period
  async sendOverdueAlerts() {
    try {
      console.log('📧 Processing overdue alerts...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const gracePeriodDaysAgo = new Date(today);
      gracePeriodDaysAgo.setDate(gracePeriodDaysAgo.getDate() - 5); // 5-day grace period

      // Find installments overdue by grace period
      const overdueInstallments = await PTPPayment.find({
        dueDate: {
          $lt: gracePeriodDaysAgo
        },
        status: 'Pending'
      }).populate('proposalId');

      console.log(`  Found ${overdueInstallments.length} overdue installments`);

      for (const installment of overdueInstallments) {
        try {
          const proposal = installment.proposalId;
          if (!proposal) continue;

          // Get customer details
          const customer = await Customer.findOne({ accountNumber: proposal.accountNumber });
          if (!customer || !customer.email) {
            console.log(`  ⏭️  Skipping: No email for account ${proposal.accountNumber}`);
            continue;
          }

          // Calculate days overdue
          const daysOverdue = Math.floor((today - installment.dueDate) / (1000 * 60 * 60 * 24));

          // Prepare email data
          const emailData = {
            CustomerName: customer.customerName,
            AccountNumber: proposal.accountNumber,
            LetterNumber: proposal.letterNumber,
            InstallmentNumber: installment.installmentNumber,
            AmountDue: installment.amount.toLocaleString('en-IN'),
            DueDate: installment.dueDate.toLocaleDateString('en-IN'),
            DaysOverdue: daysOverdue,
            BranchName: customer.branch || 'Head Office',
            SupportPhone: process.env.SUPPORT_PHONE || '1800-XXX-XXXX',
            relatedEntity: {
              type: 'PTPPayment',
              id: installment._id
            }
          };

          // Send email to customer
          await emailService.sendTemplateEmail(
            'OverdueAlert',
            customer.email,
            customer.customerName,
            emailData
          );

          console.log(`  ✅ Overdue alert sent to ${customer.email} for installment #${installment.installmentNumber} (${daysOverdue} days overdue)`);

          // TODO: Also send to manager if needed
          // const managerEmail = proposal.assignedTo?.email;
          // if (managerEmail) {
          //   await emailService.sendTemplateEmail(...);
          // }

        } catch (error) {
          console.error(`  ❌ Error sending overdue alert for installment ${installment._id}:`, error.message);
        }
      }

      console.log('✅ Overdue alert processing complete');
    } catch (error) {
      console.error('❌ Error in overdue alert job:', error);
    }
  }

  // Retry failed emails (auto-retry logic)
  async retryFailedEmails() {
    try {
      console.log('🔄 Processing failed email retries...');

      const results = await emailService.processFailedEmails();

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (results.length > 0) {
        console.log(`  ✅ Retried ${results.length} emails: ${successful} successful, ${failed} failed`);
      }
    } catch (error) {
      console.error('❌ Error in email retry job:', error);
    }
  }

  // Stop all scheduled jobs
  stopAll() {
    this.jobs.forEach(job => job.stop());
    console.log('⏹️  All scheduled email tasks stopped');
  }
}

module.exports = new ScheduledEmailService();
