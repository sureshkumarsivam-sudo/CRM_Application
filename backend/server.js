const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const customerRoutes = require('./routes/customers');
const employeeRoutes = require('./routes/employees');
const employeeNewRoutes = require('./routes/employeesNew');
const callerFeedbackStatusCodeRoutes = require('./routes/callerFeedbackStatusCodes');
const fieldExecutiveFeedbackStatusCodeRoutes = require('./routes/fieldExecutiveFeedbackStatusCodes');
const statusCodeMatrixRoutes = require('./routes/statusCodeMatrix');
const allocationRoutes = require('./routes/allocations');
const ptpPaymentRoutes = require('./routes/ptpPayments');
const settlementProposalRoutes = require('./routes/settlementProposals');
const paymentMonitoringRoutes = require('./routes/paymentMonitoring');
const auditLogRoutes = require('./routes/auditLogs');
const feedbackRoutes = require('./routes/feedback');
const cancellationRequestRoutes = require('./routes/cancellationRequests');
const emailConfigRoutes = require('./routes/emailConfig');
const emailTemplateRoutes = require('./routes/emailTemplates');
const emailLogRoutes = require('./routes/emailLogs');
const fieldExecutiveRoutes = require('./routes/fieldExecutives');
const timelineRoutes = require('./routes/timeline');
const statusCodeRoutes = require('./routes/statusCodes');
const adminSettingsRoutes = require('./routes/adminSettings');
const scheduledEmailService = require('./services/scheduledEmailService');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crmdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  // Initialize scheduled email tasks after MongoDB connection
  scheduledEmailService.initialize().catch(err => {
    console.error('❌ Failed to initialize scheduled email tasks:', err);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employees-new', employeeNewRoutes);
app.use('/api/caller-feedback-status-codes', callerFeedbackStatusCodeRoutes);
app.use('/api/field-executive-feedback-status-codes', fieldExecutiveFeedbackStatusCodeRoutes);
app.use('/api/status-code-matrix', statusCodeMatrixRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/ptp-payments', ptpPaymentRoutes);
app.use('/api/settlement-proposals', settlementProposalRoutes);
app.use('/api/settlements', paymentMonitoringRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/cancellation-requests', cancellationRequestRoutes);
app.use('/api/email-config', emailConfigRoutes);
app.use('/api/email-templates', emailTemplateRoutes);
app.use('/api/email-logs', emailLogRoutes);
app.use('/api/field-executives', fieldExecutiveRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/status-codes', statusCodeRoutes);
app.use('/api/admin-settings', adminSettingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🔍 Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  console.log('🧪 Test route accessed');
  res.json({
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {} 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Server accessible at: http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Dashboard stats: http://localhost:${PORT}/api/customers/stats/dashboard`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', err);
  }
});

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  
  // Stop scheduled email tasks
  scheduledEmailService.stopAll();
  
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
});

module.exports = app;