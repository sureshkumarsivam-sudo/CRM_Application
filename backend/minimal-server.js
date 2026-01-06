const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5004;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crmdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Import Customer model
const Customer = require('./models/Customer');

// Test routes
app.get('/', (req, res) => {
  res.json({ message: 'CRM API Server is running!', timestamp: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API test successful',
    timestamp: new Date().toISOString()
  });
});

// Simple dashboard stats route
app.get('/api/customers/stats/dashboard', async (req, res) => {
  try {
    console.log('📊 Dashboard stats requested');
    
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ status: 'Active' });
    
    console.log(`Found ${totalCustomers} total customers, ${activeCustomers} active`);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalCustomers,
          activeCustomers,
          overdueCustomers: 0,
          npaCustomers: 0,
          totalSanctionAmount: 0,
          totalOverdueAmount: 0
        },
        customersByState: [],
        recentCustomers: []
      }
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// Simple customers list route
app.get('/api/customers', async (req, res) => {
  try {
    console.log('📋 Customers list requested');
    const customers = await Customer.find().limit(20).lean();
    console.log(`Found ${customers.length} customers`);
    
    res.json({
      success: true,
      data: customers,
      pagination: {
        current: 1,
        total: 1,
        hasNext: false,
        hasPrev: false,
        totalRecords: customers.length,
        limit: 20
      }
    });
  } catch (error) {
    console.error('❌ Customers list error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
  console.log(`🚀 Minimal CRM server running on http://localhost:${PORT}`);
  console.log(`🔍 Test health: http://localhost:${PORT}/api/health`);
});

console.log('Starting minimal server...');