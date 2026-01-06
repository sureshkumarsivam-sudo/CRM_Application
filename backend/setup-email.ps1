# Email Notification System - Quick Setup Script
# Run this from the backend directory

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Email Notification System Setup   " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Dependencies
Write-Host "Step 1: Installing NPM dependencies..." -ForegroundColor Yellow
npm install nodemailer node-cron

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Seed Email Templates
Write-Host "Step 2: Seeding email templates..." -ForegroundColor Yellow
node -e "require('./scripts/seedEmailTemplates').seedTemplates().then(() => { console.log('✅ Templates seeded'); process.exit(0); }).catch(err => { console.error('❌ Seed failed:', err); process.exit(1); })"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Email templates seeded successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Template seeding may have failed - check if MongoDB is running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!                    " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. Start the backend server: npm start" -ForegroundColor Gray
Write-Host "2. Go to Settings → Email Configuration" -ForegroundColor Gray
Write-Host "3. Configure your SMTP settings" -ForegroundColor Gray
Write-Host "4. Send a test email" -ForegroundColor Gray
Write-Host "5. Check Settings → Email Logs for delivery status" -ForegroundColor Gray
Write-Host ""
Write-Host "For Gmail setup:" -ForegroundColor Yellow
Write-Host "- Enable 2-Step Verification" -ForegroundColor Gray
Write-Host "- Generate App Password (Security → App Passwords)" -ForegroundColor Gray
Write-Host "- Use app password in SMTP Password field" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation: See EMAIL_NOTIFICATION_SYSTEM.md" -ForegroundColor Cyan
Write-Host ""
