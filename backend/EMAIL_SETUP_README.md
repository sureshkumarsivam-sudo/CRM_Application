# 📧 Email Notification System - Installation Guide

## Quick Start

### Step 1: Install Dependencies
```powershell
cd d:\AI\VSCODE\Debtrix_CRM\Debtrix_CRM\crm-app\backend
npm install nodemailer node-cron
```

### Step 2: Seed Email Templates
```powershell
npm run seed-email-templates
```

### Step 3: Start Server
```powershell
npm start
```

You should see:
```
✅ Connected to MongoDB
🕒 Initializing scheduled email tasks...
✅ Scheduled email tasks initialized
  - Payment Reminders: Daily at 9:00 AM
  - Overdue Alerts: Daily at 10:00 AM
  - Email Retry: Every hour
🚀 Server running on port 5000
```

### Step 4: Configure Email Provider
1. Open frontend: http://localhost:3000
2. Go to **Settings → Email Configuration**
3. Select your email provider (SMTP/Gmail/Office365)
4. Enter credentials
5. Send test email
6. Save configuration

---

## Supported Email Providers

### Option 1: Gmail (Recommended for Development)

**Requirements**:
- Google Account with 2-Step Verification enabled
- App Password generated

**Setup Steps**:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App Passwords**
4. Select **Mail** and generate password
5. Copy the 16-character password

**Configuration**:
- Provider: Gmail
- From Email: your.email@gmail.com
- Sender Name: Debtrix CRM
- SMTP Host: smtp.gmail.com (auto-filled)
- SMTP Port: 587 (auto-filled)
- SMTP Username: your.email@gmail.com
- SMTP Password: [16-character app password]

### Option 2: Office 365

**Requirements**:
- Office 365 Business account
- SMTP AUTH enabled in tenant

**Configuration**:
- Provider: Office 365
- From Email: your.email@company.com
- Sender Name: Debtrix CRM
- SMTP Host: smtp.office365.com (auto-filled)
- SMTP Port: 587 (auto-filled)
- SMTP Username: your.email@company.com
- SMTP Password: [Your O365 password]

### Option 3: Custom SMTP

**For**: Mailgun, SendGrid, AWS SES, or any SMTP server

**Configuration**:
- Provider: SMTP
- From Email: noreply@yourdomain.com
- Sender Name: Debtrix CRM
- SMTP Host: [Your SMTP server]
- SMTP Port: 587 or 465
- SMTP Username: [SMTP username]
- SMTP Password: [SMTP password]

---

## Features Overview

### 📨 4 Email Templates

#### 1. Settlement Letter Approved
- **Trigger**: L2 Manager approves proposal
- **Sent to**: Customer
- **Content**: Settlement details, installment schedule, payment instructions
- **Color**: Orange gradient

#### 2. Payment Reminder
- **Trigger**: 2 days before installment due date (9 AM daily)
- **Sent to**: Customer
- **Content**: Upcoming payment details, amount, due date
- **Color**: Blue gradient

#### 3. Overdue Payment Alert
- **Trigger**: 5 days after due date (10 AM daily)
- **Sent to**: Customer + Manager
- **Content**: Urgent overdue notice, days overdue, action required
- **Color**: Red gradient

#### 4. Cancellation Confirmation
- **Trigger**: Admin finalizes cancellation
- **Sent to**: Customer, Initiator, Manager
- **Content**: Cancellation details, account unlocked status
- **Color**: Gray gradient

### 🕒 Scheduled Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| Payment Reminders | 9:00 AM daily | Send reminders for installments due in 2 days |
| Overdue Alerts | 10:00 AM daily | Send alerts for installments overdue by 5+ days |
| Email Retry | Every hour | Retry failed emails (max 3 attempts) |

### 📊 Email Logs

- View all sent emails
- Filter by status, type, date range
- Retry failed emails
- Export to CSV
- Statistics dashboard

---

## Testing Your Setup

### 1. Test Email Configuration
```
Settings → Email Configuration
→ Enter test email address
→ Click "Send Test Email"
→ Check inbox for test email
```

### 2. Test Letter Approved Email
```
Settlements → Create Proposal
→ Approve at L1
→ Approve at L2
→ Check customer email
```

### 3. Test Payment Reminder
```
Create installment due in 2 days
→ Wait until next day 9 AM
→ Check cron job runs
→ Verify email sent
```

### 4. View Email Logs
```
Settings → Email Logs
→ See all emails sent
→ Check status (Sent/Failed)
→ View email details
```

---

## Troubleshooting

### ❌ Test Email Failed

**Error**: "Failed to send test email"

**Solutions**:
1. **Gmail**: Use App Password, not regular password
2. **Firewall**: Disable antivirus/firewall temporarily
3. **Credentials**: Double-check username and password
4. **Port**: Ensure port 587 is not blocked
5. **Logs**: Check Settings → Email Logs for error details

### ❌ Templates Not Found

**Error**: "Template not found: LetterApproved"

**Solution**:
```powershell
npm run seed-email-templates
```

### ❌ Scheduled Tasks Not Running

**Symptoms**: No reminders at 9 AM

**Solutions**:
1. Server must run continuously (not just during business hours)
2. Check console logs for cron initialization
3. Verify MongoDB connection
4. Check timezone settings

### ❌ Emails Going to Spam

**Solutions**:
1. Use professional domain email
2. Setup SPF/DKIM records
3. Ask recipients to whitelist sender
4. Avoid spam trigger words

---

## Production Deployment

### Security Checklist
- [ ] Use environment variables for credentials
- [ ] Encrypt SMTP password in database
- [ ] Enable HTTPS on frontend
- [ ] Add rate limiting to email endpoints
- [ ] Validate email addresses before sending

### Performance Checklist
- [ ] Implement email queue (Redis)
- [ ] Batch email sending
- [ ] Monitor failed email rate
- [ ] Set up email delivery alerts
- [ ] Configure auto-cleanup of old logs

### Monitoring Setup
```javascript
// Add to .env
EMAIL_FAILURE_THRESHOLD=10
ADMIN_ALERT_EMAIL=admin@company.com
```

---

## Email Template Customization

### Available Placeholders

```
{{CustomerName}}         - Customer name
{{AccountNumber}}        - Account number
{{LetterNumber}}         - Settlement letter number
{{SettlementAmount}}     - Settlement amount
{{WaiverAmount}}         - Waiver amount
{{WaiverPercentage}}     - Waiver percentage
{{InstallmentSchedule}}  - Installment table (HTML)
{{InstallmentNumber}}    - Installment number
{{AmountDue}}            - Amount due
{{DueDate}}              - Due date
{{PaymentMethod}}        - Payment method
{{BranchName}}           - Branch name
{{SupportPhone}}         - Support phone
{{CancellationDate}}     - Cancellation date
{{CancellationReason}}   - Cancellation reason
{{DaysOverdue}}          - Days overdue
```

### How to Edit Templates

1. Go to **Settings → Email Templates**
2. Select template from left sidebar
3. Edit **Subject** and **Body**
4. Click **Preview** to test with sample data
5. Click **Save Changes**

---

## FAQ

**Q: Can I use multiple email addresses?**
A: Currently only one active configuration is supported. Switch providers by updating the config.

**Q: How do I stop emails temporarily?**
A: Deactivate the email configuration in Settings → Email Configuration.

**Q: Can I change the reminder schedule?**
A: Yes, edit `backend/services/scheduledEmailService.js` and modify cron expressions.

**Q: How long are email logs retained?**
A: Indefinitely. Add cleanup script for production to delete old logs.

**Q: Can I send emails to multiple recipients?**
A: Not yet. This is a planned enhancement for Phase 2.

**Q: Are attachments supported?**
A: PDF attachments for letter approved emails are planned for Phase 2.

---

## Support

For issues or questions:
1. Check **Settings → Email Logs** for error details
2. Review console logs for backend errors
3. See [EMAIL_NOTIFICATION_SYSTEM.md](./EMAIL_NOTIFICATION_SYSTEM.md) for complete documentation
4. Contact system administrator

---

## Quick Reference

### Start Server
```powershell
npm start
```

### Seed Templates
```powershell
npm run seed-email-templates
```

### Check Logs
```
Settings → Email Logs
```

### Test Configuration
```
Settings → Email Configuration → Send Test Email
```

---

**Documentation**: See `EMAIL_NOTIFICATION_SYSTEM.md` for complete technical details.

**Version**: 1.0.0  
**Last Updated**: November 15, 2025
