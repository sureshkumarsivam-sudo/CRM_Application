const nodemailer = require('nodemailer');
const EmailConfig = require('../models/EmailConfig');
const EmailTemplate = require('../models/EmailTemplate');
const EmailLog = require('../models/EmailLog');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  // Initialize transporter with active configuration
  async initializeTransporter() {
    const config = await EmailConfig.findOne({ isActive: true });
    
    if (!config) {
      throw new Error('No active email configuration found');
    }

    const transportConfig = {
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword
      }
    };

    // Provider-specific configurations
    if (config.provider === 'Gmail') {
      transportConfig.service = 'gmail';
    } else if (config.provider === 'Office365') {
      transportConfig.host = 'smtp.office365.com';
      transportConfig.port = 587;
      transportConfig.secure = false;
      transportConfig.requireTLS = true;
    }

    this.transporter = nodemailer.createTransport(transportConfig);
    this.fromEmail = config.fromEmail;
    this.senderName = config.senderName;
    
    return this.transporter;
  }

  // Test email configuration
  async testConnection(config) {
    const testTransporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword
      }
    });

    try {
      await testTransporter.verify();
      return { success: true, message: 'Connection verified successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Send test email
  async sendTestEmail(recipientEmail, config) {
    const testTransporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword
      }
    });

    const mailOptions = {
      from: `"${config.senderName}" <${config.fromEmail}>`,
      to: recipientEmail,
      subject: 'Test Email - Debtrix CRM Email Configuration',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #FFAB40;">✅ Email Configuration Test Successful</h2>
          <p>This is a test email from your Debtrix CRM system.</p>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>Provider: ${config.provider}</li>
            <li>SMTP Host: ${config.smtpHost}</li>
            <li>SMTP Port: ${config.smtpPort}</li>
            <li>From Email: ${config.fromEmail}</li>
            <li>Sender Name: ${config.senderName}</li>
          </ul>
          <p>If you received this email, your email configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Sent by Debtrix CRM - Debt Collection Management System</p>
        </div>
      `
    };

    try {
      const info = await testTransporter.sendMail(mailOptions);
      
      // Log test email
      await EmailLog.create({
        emailType: 'Test',
        recipientEmail,
        recipientName: 'Test Recipient',
        subject: mailOptions.subject,
        body: mailOptions.html,
        status: 'Sent',
        sentAt: new Date(),
        providerResponse: {
          messageId: info.messageId,
          response: info.response
        }
      });

      return { 
        success: true, 
        message: 'Test email sent successfully',
        messageId: info.messageId 
      };
    } catch (error) {
      // Log failed test email
      await EmailLog.create({
        emailType: 'Test',
        recipientEmail,
        recipientName: 'Test Recipient',
        subject: mailOptions.subject,
        body: mailOptions.html,
        status: 'Failed',
        errorDetails: {
          message: error.message,
          code: error.code,
          stack: error.stack
        }
      });

      return { success: false, message: error.message };
    }
  }

  // Replace placeholders in template
  replacePlaceholders(template, data) {
    let subject = template.subject;
    let body = template.body;

    // Replace all placeholders
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = data[key] || '';
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      body = body.replace(new RegExp(placeholder, 'g'), value);
    });

    return { subject, body };
  }

  // Send email using template
  async sendTemplateEmail(templateType, recipientEmail, recipientName, data, attachments = []) {
    try {
      // Get template
      const template = await EmailTemplate.findOne({ templateType, isActive: true });
      if (!template) {
        throw new Error(`Template not found: ${templateType}`);
      }

      // Replace placeholders
      const { subject, body } = this.replacePlaceholders(template, data);

      // Initialize transporter if not already done
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const mailOptions = {
        from: `"${this.senderName}" <${this.fromEmail}>`,
        to: recipientEmail,
        subject: subject,
        html: body,
        attachments: attachments.map(att => ({
          filename: att.filename,
          path: att.path,
          contentType: att.contentType
        }))
      };

      // Create email log entry
      const emailLog = await EmailLog.create({
        emailType: templateType,
        recipientEmail,
        recipientName,
        subject,
        body,
        status: 'Pending',
        relatedEntity: data.relatedEntity,
        metadata: {
          letterNumber: data.LetterNumber,
          accountNumber: data.AccountNumber,
          customerName: data.CustomerName,
          installmentNumber: data.InstallmentNumber,
          dueDate: data.DueDate,
          amountDue: data.AmountDue
        },
        attachments: attachments.map(att => ({
          filename: att.filename,
          path: att.path,
          contentType: att.contentType
        }))
      });

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      // Update log as sent
      emailLog.status = 'Sent';
      emailLog.sentAt = new Date();
      emailLog.providerResponse = {
        messageId: info.messageId,
        response: info.response
      };
      await emailLog.save();

      return { success: true, emailLogId: emailLog._id, messageId: info.messageId };
    } catch (error) {
      // Update log as failed
      const emailLog = await EmailLog.findOne({ 
        recipientEmail, 
        status: 'Pending' 
      }).sort({ createdAt: -1 });

      if (emailLog) {
        emailLog.status = 'Failed';
        emailLog.errorDetails = {
          message: error.message,
          code: error.code,
          stack: error.stack
        };
        await emailLog.save();
      }

      throw error;
    }
  }

  // Retry failed emails
  async retryFailedEmail(emailLogId) {
    const emailLog = await EmailLog.findById(emailLogId);
    
    if (!emailLog) {
      throw new Error('Email log not found');
    }

    if (emailLog.retryCount >= emailLog.maxRetries) {
      throw new Error('Maximum retry attempts reached');
    }

    try {
      // Initialize transporter
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const mailOptions = {
        from: `"${this.senderName}" <${this.fromEmail}>`,
        to: emailLog.recipientEmail,
        subject: emailLog.subject,
        html: emailLog.body,
        attachments: emailLog.attachments
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Update log
      emailLog.status = 'Sent';
      emailLog.sentAt = new Date();
      emailLog.retryCount += 1;
      emailLog.providerResponse = {
        messageId: info.messageId,
        response: info.response
      };
      await emailLog.save();

      return { success: true, messageId: info.messageId };
    } catch (error) {
      // Update retry count
      emailLog.retryCount += 1;
      emailLog.errorDetails = {
        message: error.message,
        code: error.code,
        stack: error.stack
      };
      await emailLog.save();

      throw error;
    }
  }

  // Auto-retry logic (called by cron job)
  async processFailedEmails() {
    const failedEmails = await EmailLog.find({
      status: 'Failed',
      retryCount: { $lt: 3 }
    }).limit(10);

    const results = [];

    for (const emailLog of failedEmails) {
      try {
        const result = await this.retryFailedEmail(emailLog._id);
        results.push({ emailLogId: emailLog._id, success: true, result });
      } catch (error) {
        results.push({ emailLogId: emailLog._id, success: false, error: error.message });
      }
    }

    return results;
  }
}

module.exports = new EmailService();
