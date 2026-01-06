const express = require('express');
const router = express.Router();
const EmailConfig = require('../models/EmailConfig');
const emailService = require('../services/emailService');

// Get active email configuration
router.get('/active', async (req, res) => {
  try {
    const config = await EmailConfig.findOne({ isActive: true });
    
    if (!config) {
      return res.status(404).json({ message: 'No active email configuration found' });
    }

    // Don't send password to frontend
    const configObj = config.toObject();
    delete configObj.smtpPassword;

    res.json(configObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all email configurations
router.get('/', async (req, res) => {
  try {
    const configs = await EmailConfig.find().select('-smtpPassword').sort({ createdAt: -1 });
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new email configuration
router.post('/', async (req, res) => {
  try {
    const {
      provider,
      fromEmail,
      senderName,
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpSecure,
      isActive,
      createdBy
    } = req.body;

    const config = new EmailConfig({
      provider,
      fromEmail,
      senderName,
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpSecure,
      isActive,
      createdBy
    });

    await config.save();

    // Don't send password back
    const configObj = config.toObject();
    delete configObj.smtpPassword;

    res.status(201).json({
      message: 'Email configuration created successfully',
      config: configObj
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update email configuration
router.put('/:id', async (req, res) => {
  try {
    const {
      provider,
      fromEmail,
      senderName,
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpSecure,
      isActive,
      updatedBy
    } = req.body;

    const updateData = {
      provider,
      fromEmail,
      senderName,
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpSecure,
      isActive,
      updatedBy
    };

    // Only update password if provided
    if (smtpPassword) {
      updateData.smtpPassword = smtpPassword;
    }

    const config = await EmailConfig.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!config) {
      return res.status(404).json({ message: 'Email configuration not found' });
    }

    // Don't send password back
    const configObj = config.toObject();
    delete configObj.smtpPassword;

    res.json({
      message: 'Email configuration updated successfully',
      config: configObj
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Test email connection
router.post('/test-connection', async (req, res) => {
  try {
    const { smtpHost, smtpPort, smtpUsername, smtpPassword, smtpSecure } = req.body;

    const result = await emailService.testConnection({
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpSecure
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send test email
router.post('/send-test', async (req, res) => {
  try {
    const {
      recipientEmail,
      provider,
      fromEmail,
      senderName,
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpSecure
    } = req.body;

    const result = await emailService.sendTestEmail(recipientEmail, {
      provider,
      fromEmail,
      senderName,
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpSecure
    });

    // Update last tested timestamp if configuration ID provided
    if (req.body.configId) {
      await EmailConfig.findByIdAndUpdate(req.body.configId, {
        lastTested: new Date(),
        testResult: {
          success: result.success,
          message: result.message,
          testedAt: new Date()
        }
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete email configuration
router.delete('/:id', async (req, res) => {
  try {
    const config = await EmailConfig.findById(req.params.id);

    if (!config) {
      return res.status(404).json({ message: 'Email configuration not found' });
    }

    if (config.isActive) {
      return res.status(400).json({ 
        message: 'Cannot delete active configuration. Please activate another configuration first.' 
      });
    }

    await config.deleteOne();

    res.json({ message: 'Email configuration deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
