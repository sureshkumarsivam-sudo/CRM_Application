const EmailTemplate = require('../models/EmailTemplate');

const defaultTemplates = [
  {
    templateType: 'LetterApproved',
    name: 'Settlement Letter Approved',
    subject: 'Settlement Proposal Letter – {{LetterNumber}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #FFAB40 0%, #FFD180 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Settlement Proposal Approved</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear <strong>{{CustomerName}}</strong>,</p>
          
          <p style="color: #666; line-height: 1.6;">
            We are pleased to inform you that your settlement proposal for account number <strong>{{AccountNumber}}</strong> 
            has been approved by our management.
          </p>
          
          <div style="background-color: #FFF3E0; border-left: 4px solid #FFAB40; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #E65100;">Settlement Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Letter Number:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{LetterNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Account Number:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{AccountNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Settlement Amount:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #4CAF50;">₹{{SettlementAmount}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Waiver Amount:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #FF5722;">₹{{WaiverAmount}} ({{WaiverPercentage}}% off)</td>
              </tr>
            </table>
          </div>
          
          <h3 style="color: #E65100; margin-top: 25px;">Payment Schedule</h3>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
            {{InstallmentSchedule}}
          </div>
          
          <h3 style="color: #E65100; margin-top: 25px;">Payment Instructions</h3>
          <p style="color: #666; line-height: 1.6;">
            Please make payments using the following method: <strong>{{PaymentMethod}}</strong>
          </p>
          
          <div style="background-color: #E3F2FD; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1565C0; font-weight: bold;">📌 Important Notes:</p>
            <ul style="color: #666; margin: 10px 0;">
              <li>Please ensure timely payment of all installments</li>
              <li>Quote your account number for all payments</li>
              <li>Keep payment receipts for your records</li>
              <li>Settlement will be considered void if any installment is delayed beyond the grace period</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 25px;">
            For any queries or assistance, please contact our <strong>{{BranchName}}</strong> branch 
            at <strong>{{SupportPhone}}</strong>.
          </p>
          
          <p style="color: #666; margin-top: 30px;">
            Best Regards,<br>
            <strong style="color: #FFAB40;">Debtrix CRM Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>This is an automated email from Debtrix CRM - Debt Collection Management System</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    `,
    placeholders: [
      { key: 'CustomerName', description: 'Customer full name' },
      { key: 'AccountNumber', description: 'Customer account number' },
      { key: 'LetterNumber', description: 'Settlement letter number' },
      { key: 'SettlementAmount', description: 'Total settlement amount' },
      { key: 'WaiverAmount', description: 'Waiver/discount amount' },
      { key: 'WaiverPercentage', description: 'Waiver percentage' },
      { key: 'InstallmentSchedule', description: 'HTML table of installment schedule' },
      { key: 'PaymentMethod', description: 'Payment method (Cash/Cheque/Online)' },
      { key: 'BranchName', description: 'Branch name' },
      { key: 'SupportPhone', description: 'Support contact number' }
    ],
    isActive: true
  },
  {
    templateType: 'PaymentReminder',
    name: 'Payment Reminder',
    subject: 'Payment Reminder – Installment {{InstallmentNumber}} Due on {{DueDate}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #2196F3 0%, #64B5F6 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Payment Reminder</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear <strong>{{CustomerName}}</strong>,</p>
          
          <p style="color: #666; line-height: 1.6;">
            This is a friendly reminder that your installment payment is due in <strong>2 days</strong>.
          </p>
          
          <div style="background-color: #E3F2FD; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1565C0;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Account Number:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{AccountNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Letter Number:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{LetterNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Installment Number:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{InstallmentNumber}}</td>
              </tr>
              <tr style="background-color: #FFF3E0;">
                <td style="padding: 12px 8px; color: #E65100; font-weight: bold;">Amount Due:</td>
                <td style="padding: 12px 8px; font-weight: bold; color: #E65100; font-size: 18px;">₹{{AmountDue}}</td>
              </tr>
              <tr style="background-color: #FFEBEE;">
                <td style="padding: 12px 8px; color: #C62828; font-weight: bold;">Due Date:</td>
                <td style="padding: 12px 8px; font-weight: bold; color: #C62828; font-size: 18px;">{{DueDate}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Payment Method:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{PaymentMethod}}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #E65100; font-weight: bold;">⚠️ Important:</p>
            <p style="margin: 10px 0 0 0; color: #666;">
              Please ensure timely payment to avoid settlement cancellation. Late payments may result 
              in the settlement being considered void.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 25px;">
            For payment assistance or queries, please contact us at <strong>{{SupportPhone}}</strong>.
          </p>
          
          <p style="color: #666; margin-top: 30px;">
            Best Regards,<br>
            <strong style="color: #2196F3;">Debtrix CRM Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>This is an automated reminder from Debtrix CRM</p>
        </div>
      </div>
    `,
    placeholders: [
      { key: 'CustomerName', description: 'Customer full name' },
      { key: 'AccountNumber', description: 'Customer account number' },
      { key: 'LetterNumber', description: 'Settlement letter number' },
      { key: 'InstallmentNumber', description: 'Installment number' },
      { key: 'AmountDue', description: 'Amount due for this installment' },
      { key: 'DueDate', description: 'Due date for payment' },
      { key: 'PaymentMethod', description: 'Accepted payment method' },
      { key: 'SupportPhone', description: 'Support contact number' }
    ],
    isActive: true
  },
  {
    templateType: 'OverdueAlert',
    name: 'Overdue Payment Alert',
    subject: '🚨 Overdue Payment Notice – Settlement Broken – {{LetterNumber}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #F44336 0%, #E57373 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Overdue Payment Notice</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear <strong>{{CustomerName}}</strong>,</p>
          
          <p style="color: #D32F2F; line-height: 1.6; font-weight: bold; font-size: 16px;">
            Your settlement payment is now OVERDUE and the settlement agreement has been considered BROKEN.
          </p>
          
          <div style="background-color: #FFEBEE; border: 2px solid #F44336; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 15px 0; color: #C62828;">Overdue Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Account Number:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{AccountNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Letter Number:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{LetterNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Installment Number:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{InstallmentNumber}}</td>
              </tr>
              <tr style="background-color: #FFF3E0;">
                <td style="padding: 12px 8px; color: #E65100; font-weight: bold;">Overdue Amount:</td>
                <td style="padding: 12px 8px; font-weight: bold; color: #E65100; font-size: 20px;">₹{{AmountDue}}</td>
              </tr>
              <tr style="background-color: #FFCDD2;">
                <td style="padding: 12px 8px; color: #C62828; font-weight: bold;">Original Due Date:</td>
                <td style="padding: 12px 8px; font-weight: bold; color: #C62828; font-size: 18px;">{{DueDate}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Days Overdue:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #D32F2F;">{{DaysOverdue}}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #FFF3E0; border-left: 4px solid #FF9800; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #E65100; font-weight: bold;">⚠️ Settlement Status: BROKEN</p>
            <p style="margin: 10px 0 0 0; color: #666;">
              Since the payment has exceeded the grace period, your settlement agreement is now considered 
              void. The account will revert to normal collection processes.
            </p>
          </div>
          
          <h3 style="color: #C62828; margin-top: 25px;">Immediate Action Required</h3>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <ol style="color: #666; margin: 5px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">Contact our office immediately at <strong>{{SupportPhone}}</strong></li>
              <li style="margin: 8px 0;">Discuss alternative payment arrangements</li>
              <li style="margin: 8px 0;">Clear the overdue amount at the earliest</li>
            </ol>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 25px;">
            Please contact our <strong>{{BranchName}}</strong> branch urgently to discuss this matter.
          </p>
          
          <p style="color: #666; margin-top: 30px;">
            Regards,<br>
            <strong style="color: #F44336;">Debtrix CRM Collections Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>This is an automated alert from Debtrix CRM</p>
        </div>
      </div>
    `,
    placeholders: [
      { key: 'CustomerName', description: 'Customer full name' },
      { key: 'AccountNumber', description: 'Customer account number' },
      { key: 'LetterNumber', description: 'Settlement letter number' },
      { key: 'InstallmentNumber', description: 'Overdue installment number' },
      { key: 'AmountDue', description: 'Overdue amount' },
      { key: 'DueDate', description: 'Original due date' },
      { key: 'DaysOverdue', description: 'Number of days overdue' },
      { key: 'BranchName', description: 'Branch name' },
      { key: 'SupportPhone', description: 'Support contact number' }
    ],
    isActive: true
  },
  {
    templateType: 'CancellationConfirmation',
    name: 'Settlement Cancelled',
    subject: 'Settlement Letter Cancelled – {{LetterNumber}}',
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #607D8B 0%, #90A4AE 100%); padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Settlement Letter Cancelled</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear <strong>{{CustomerName}}</strong>,</p>
          
          <p style="color: #666; line-height: 1.6;">
            This is to inform you that your settlement letter <strong>{{LetterNumber}}</strong> for 
            account number <strong>{{AccountNumber}}</strong> has been cancelled as per your request.
          </p>
          
          <div style="background-color: #ECEFF1; border-left: 4px solid #607D8B; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #37474F;">Cancellation Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Letter Number:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{LetterNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Account Number:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{AccountNumber}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Cancellation Date:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{CancellationDate}}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Reason:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #333;">{{CancellationReason}}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #2E7D32; font-weight: bold;">✅ Account Status: UNLOCKED</p>
            <p style="margin: 10px 0 0 0; color: #666;">
              Your account has been unlocked. You may now raise a new settlement/closure proposal 
              if you wish to proceed with a different arrangement.
            </p>
          </div>
          
          <h3 style="color: #37474F; margin-top: 25px;">Next Steps</h3>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <ul style="color: #666; margin: 5px 0; padding-left: 20px;">
              <li style="margin: 8px 0;">The previous settlement letter is now completely archived</li>
              <li style="margin: 8px 0;">You can create a new settlement proposal immediately</li>
              <li style="margin: 8px 0;">Contact us if you need assistance with a new proposal</li>
              <li style="margin: 8px 0;">All cancellation history has been maintained for records</li>
            </ul>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-top: 25px;">
            For any questions or to discuss new settlement options, please contact our 
            <strong>{{BranchName}}</strong> branch at <strong>{{SupportPhone}}</strong>.
          </p>
          
          <p style="color: #666; margin-top: 30px;">
            Best Regards,<br>
            <strong style="color: #607D8B;">Debtrix CRM Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p>This is an automated confirmation from Debtrix CRM</p>
        </div>
      </div>
    `,
    placeholders: [
      { key: 'CustomerName', description: 'Customer full name' },
      { key: 'AccountNumber', description: 'Customer account number' },
      { key: 'LetterNumber', description: 'Cancelled letter number' },
      { key: 'CancellationDate', description: 'Date of cancellation' },
      { key: 'CancellationReason', description: 'Reason for cancellation' },
      { key: 'BranchName', description: 'Branch name' },
      { key: 'SupportPhone', description: 'Support contact number' }
    ],
    isActive: true
  }
];

async function seedTemplates() {
  try {
    console.log('Seeding email templates...');
    
    for (const template of defaultTemplates) {
      const existing = await EmailTemplate.findOne({ templateType: template.templateType });
      
      if (!existing) {
        await EmailTemplate.create(template);
        console.log(`✅ Created template: ${template.name}`);
      } else {
        console.log(`⏭️  Template already exists: ${template.name}`);
      }
    }
    
    console.log('✅ Email templates seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    throw error;
  }
}

module.exports = { seedTemplates, defaultTemplates };
