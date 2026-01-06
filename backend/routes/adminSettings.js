const express = require('express');
const router = express.Router();
const {
  UserRoleWaiverLimit,
  GlobalWaiverPolicy,
  InstallmentDefaults,
  LetterTemplate,
  SettingsAuditTrail
} = require('../models/AdminSettings');

// Middleware to log settings changes
const logSettingChange = async (req, settingType, settingName, action, oldValue, newValue, details = '') => {
  try {
    const auditLog = new SettingsAuditTrail({
      settingName,
      settingType,
      action,
      oldValue,
      newValue,
      modifiedBy: {
        userId: req.user?.id || req.user?._id,
        name: req.user?.fullName || req.user?.name,
        role: req.user?.role
      },
      details
    });
    await auditLog.save();
  } catch (error) {
    console.error('Error logging setting change:', error);
  }
};

// ===== USER ROLE WAIVER LIMITS =====

// Get all user role waiver limits
router.get('/waiver-limits', async (req, res) => {
  try {
    const limits = await UserRoleWaiverLimit.find().sort({ role: 1 });
    res.json(limits);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching waiver limits', error: error.message });
  }
});

// Get waiver limit by role
router.get('/waiver-limits/:role', async (req, res) => {
  try {
    const limit = await UserRoleWaiverLimit.findOne({ role: req.params.role });
    if (!limit) {
      return res.status(404).json({ message: 'Waiver limit not found for this role' });
    }
    res.json(limit);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching waiver limit', error: error.message });
  }
});

// Create or update waiver limit
router.post('/waiver-limits', async (req, res) => {
  try {
    const { role, maxWaiverPercentage, maxWaiverAmount, approvalRequired } = req.body;

    // Validation
    if (!role || maxWaiverPercentage === undefined || maxWaiverAmount === undefined) {
      return res.status(400).json({ message: 'Role, maxWaiverPercentage, and maxWaiverAmount are required' });
    }

    if (maxWaiverPercentage < 0 || maxWaiverPercentage > 100) {
      return res.status(400).json({ message: 'Max waiver percentage must be between 0 and 100' });
    }

    if (maxWaiverAmount < 0) {
      return res.status(400).json({ message: 'Max waiver amount must be non-negative' });
    }

    const existingLimit = await UserRoleWaiverLimit.findOne({ role });
    
    if (existingLimit) {
      const oldValue = { ...existingLimit.toObject() };
      
      existingLimit.maxWaiverPercentage = maxWaiverPercentage;
      existingLimit.maxWaiverAmount = maxWaiverAmount;
      existingLimit.approvalRequired = approvalRequired;
      
      await existingLimit.save();
      
      await logSettingChange(
        req,
        'User Role Waiver Limits',
        `${role} Waiver Limit`,
        'Updated',
        oldValue,
        existingLimit.toObject(),
        `Max Waiver % changed from ${oldValue.maxWaiverPercentage}% to ${maxWaiverPercentage}%, Max Amount from ₹${oldValue.maxWaiverAmount} to ₹${maxWaiverAmount}`
      );
      
      return res.json(existingLimit);
    }

    const newLimit = new UserRoleWaiverLimit({
      role,
      maxWaiverPercentage,
      maxWaiverAmount,
      approvalRequired
    });
    
    await newLimit.save();
    
    await logSettingChange(
      req,
      'User Role Waiver Limits',
      `${role} Waiver Limit`,
      'Created',
      null,
      newLimit.toObject(),
      `New waiver limit created for ${role}`
    );
    
    res.status(201).json(newLimit);
  } catch (error) {
    res.status(500).json({ message: 'Error saving waiver limit', error: error.message });
  }
});

// Update waiver limit
router.put('/waiver-limits/:role', async (req, res) => {
  try {
    const { maxWaiverPercentage, maxWaiverAmount, approvalRequired } = req.body;
    
    const limit = await UserRoleWaiverLimit.findOne({ role: req.params.role });
    if (!limit) {
      return res.status(404).json({ message: 'Waiver limit not found' });
    }

    const oldValue = { ...limit.toObject() };
    
    if (maxWaiverPercentage !== undefined) limit.maxWaiverPercentage = maxWaiverPercentage;
    if (maxWaiverAmount !== undefined) limit.maxWaiverAmount = maxWaiverAmount;
    if (approvalRequired !== undefined) limit.approvalRequired = approvalRequired;
    
    await limit.save();
    
    await logSettingChange(
      req,
      'User Role Waiver Limits',
      `${req.params.role} Waiver Limit`,
      'Updated',
      oldValue,
      limit.toObject(),
      `Waiver limit updated for ${req.params.role}`
    );
    
    res.json(limit);
  } catch (error) {
    res.status(500).json({ message: 'Error updating waiver limit', error: error.message });
  }
});

// ===== GLOBAL WAIVER POLICY =====

// Get global waiver policy
router.get('/global-policy', async (req, res) => {
  try {
    let policy = await GlobalWaiverPolicy.findOne();
    if (!policy) {
      // Create default policy if none exists
      policy = new GlobalWaiverPolicy({
        minWaiverPercentage: 5,
        maxWaiverPercentage: 80,
        colorThresholds: {
          green: { min: 0, max: 40 },
          amber: { min: 40, max: 60 },
          red: { min: 60, max: 100 }
        }
      });
      await policy.save();
    }
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching global policy', error: error.message });
  }
});

// Update global waiver policy
router.post('/global-policy', async (req, res) => {
  try {
    const { minWaiverPercentage, maxWaiverPercentage, colorThresholds } = req.body;

    // Validation
    if (minWaiverPercentage >= maxWaiverPercentage) {
      return res.status(400).json({ message: 'Minimum percentage must be less than maximum percentage' });
    }

    if (colorThresholds) {
      const { green, amber, red } = colorThresholds;
      if (green.max !== amber.min || amber.max !== red.min) {
        return res.status(400).json({ message: 'Color threshold ranges must not overlap' });
      }
    }

    let policy = await GlobalWaiverPolicy.findOne();
    const oldValue = policy ? { ...policy.toObject() } : null;
    
    if (policy) {
      policy.minWaiverPercentage = minWaiverPercentage;
      policy.maxWaiverPercentage = maxWaiverPercentage;
      policy.colorThresholds = colorThresholds;
      await policy.save();
    } else {
      policy = new GlobalWaiverPolicy({
        minWaiverPercentage,
        maxWaiverPercentage,
        colorThresholds
      });
      await policy.save();
    }

    await logSettingChange(
      req,
      'Global Waiver Policy',
      'Global Waiver Policy',
      oldValue ? 'Updated' : 'Created',
      oldValue,
      policy.toObject(),
      `Global policy updated: Min ${minWaiverPercentage}%, Max ${maxWaiverPercentage}%`
    );

    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Error updating global policy', error: error.message });
  }
});

// ===== INSTALLMENT DEFAULTS =====

// Get installment defaults
router.get('/installment-defaults', async (req, res) => {
  try {
    let defaults = await InstallmentDefaults.findOne();
    if (!defaults) {
      // Create default values if none exist
      defaults = new InstallmentDefaults({
        minInstallmentCount: 1,
        maxInstallmentCount: 10
      });
      await defaults.save();
    }
    res.json(defaults);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching installment defaults', error: error.message });
  }
});

// Update installment defaults
router.post('/installment-defaults', async (req, res) => {
  try {
    const { minInstallmentCount, maxInstallmentCount } = req.body;

    // Validation
    if (minInstallmentCount < 1) {
      return res.status(400).json({ message: 'Minimum installment count must be at least 1' });
    }

    if (maxInstallmentCount <= minInstallmentCount) {
      return res.status(400).json({ message: 'Maximum installment count must be greater than minimum' });
    }

    let defaults = await InstallmentDefaults.findOne();
    const oldValue = defaults ? { ...defaults.toObject() } : null;
    
    if (defaults) {
      defaults.minInstallmentCount = minInstallmentCount;
      defaults.maxInstallmentCount = maxInstallmentCount;
      await defaults.save();
    } else {
      defaults = new InstallmentDefaults({
        minInstallmentCount,
        maxInstallmentCount
      });
      await defaults.save();
    }

    await logSettingChange(
      req,
      'Installment Defaults',
      'Installment Defaults',
      oldValue ? 'Updated' : 'Created',
      oldValue,
      defaults.toObject(),
      `Installment defaults: Min ${minInstallmentCount}, Max ${maxInstallmentCount}`
    );

    res.json(defaults);
  } catch (error) {
    res.status(500).json({ message: 'Error updating installment defaults', error: error.message });
  }
});

// ===== LETTER TEMPLATES =====

// Get all letter templates
router.get('/letter-templates', async (req, res) => {
  try {
    const templates = await LetterTemplate.find()
      .select('-versionHistory')
      .sort({ templateType: 1, templateName: 1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching letter templates', error: error.message });
  }
});

// Get letter template by ID
router.get('/letter-templates/:id', async (req, res) => {
  try {
    const template = await LetterTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching template', error: error.message });
  }
});

// Create letter template
router.post('/letter-templates', async (req, res) => {
  try {
    const { templateName, templateType, content, placeholders, status } = req.body;

    if (!templateName || !templateType || !content) {
      return res.status(400).json({ message: 'Template name, type, and content are required' });
    }

    const template = new LetterTemplate({
      templateName,
      templateType,
      content,
      placeholders: placeholders || [],
      status: status || 'Active',
      version: 1,
      createdBy: {
        userId: req.user?.id || req.user?._id,
        name: req.user?.fullName || req.user?.name
      },
      modifiedBy: {
        userId: req.user?.id || req.user?._id,
        name: req.user?.fullName || req.user?.name
      }
    });

    await template.save();

    await logSettingChange(
      req,
      'Letter Templates',
      templateName,
      'Created',
      null,
      template.toObject(),
      `New ${templateType} template created`
    );

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Error creating template', error: error.message });
  }
});

// Update letter template
router.put('/letter-templates/:id', async (req, res) => {
  try {
    const { templateName, templateType, content, placeholders, status } = req.body;

    const template = await LetterTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const oldValue = { ...template.toObject() };

    // Add current version to history before updating
    template.versionHistory.push({
      version: template.version,
      content: template.content,
      modifiedBy: template.modifiedBy,
      modifiedAt: template.updatedAt
    });

    // Update template
    template.templateName = templateName || template.templateName;
    template.templateType = templateType || template.templateType;
    template.content = content || template.content;
    template.placeholders = placeholders || template.placeholders;
    template.status = status || template.status;
    template.version += 1;
    template.modifiedBy = {
      userId: req.user?.id || req.user?._id,
      name: req.user?.fullName || req.user?.name
    };

    await template.save();

    await logSettingChange(
      req,
      'Letter Templates',
      template.templateName,
      'Updated',
      { version: oldValue.version, content: oldValue.content },
      { version: template.version, content: template.content },
      `${template.templateType} template updated to version ${template.version}`
    );

    res.json(template);
  } catch (error) {
    res.status(500).json({ message: 'Error updating template', error: error.message });
  }
});

// Delete letter template
router.delete('/letter-templates/:id', async (req, res) => {
  try {
    const template = await LetterTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const oldValue = { ...template.toObject() };
    
    await LetterTemplate.findByIdAndDelete(req.params.id);

    await logSettingChange(
      req,
      'Letter Templates',
      template.templateName,
      'Deleted',
      oldValue,
      null,
      `${template.templateType} template deleted`
    );

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting template', error: error.message });
  }
});

// ===== AUDIT TRAIL =====

// Get settings audit trail with filters
router.get('/audit-trail', async (req, res) => {
  try {
    const {
      settingType,
      modifiedBy,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    if (settingType) {
      query.settingType = settingType;
    }

    if (modifiedBy) {
      query['modifiedBy.userId'] = modifiedBy;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [auditLogs, total] = await Promise.all([
      SettingsAuditTrail.find(query)
        .populate('modifiedBy.userId', 'fullName email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SettingsAuditTrail.countDocuments(query)
    ]);

    res.json({
      auditLogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit trail', error: error.message });
  }
});

// Initialize default settings (useful for first-time setup)
router.post('/initialize', async (req, res) => {
  try {
    // Initialize User Role Waiver Limits
    const roles = ['Admin', 'Manager L2', 'Manager L1', 'User'];
    const defaultLimits = {
      'Admin': { maxWaiverPercentage: 100, maxWaiverAmount: 10000000, approvalRequired: false },
      'Manager L2': { maxWaiverPercentage: 70, maxWaiverAmount: 5000000, approvalRequired: true },
      'Manager L1': { maxWaiverPercentage: 40, maxWaiverAmount: 1000000, approvalRequired: true },
      'User': { maxWaiverPercentage: 20, maxWaiverAmount: 500000, approvalRequired: true }
    };

    for (const role of roles) {
      const existing = await UserRoleWaiverLimit.findOne({ role });
      if (!existing) {
        await UserRoleWaiverLimit.create({
          role,
          ...defaultLimits[role]
        });
      }
    }

    // Initialize Global Waiver Policy
    let globalPolicy = await GlobalWaiverPolicy.findOne();
    if (!globalPolicy) {
      globalPolicy = await GlobalWaiverPolicy.create({
        minWaiverPercentage: 5,
        maxWaiverPercentage: 80,
        colorThresholds: {
          green: { min: 0, max: 40 },
          amber: { min: 40, max: 60 },
          red: { min: 60, max: 100 }
        }
      });
    }

    // Initialize Installment Defaults
    let installmentDefaults = await InstallmentDefaults.findOne();
    if (!installmentDefaults) {
      installmentDefaults = await InstallmentDefaults.create({
        minInstallmentCount: 1,
        maxInstallmentCount: 10
      });
    }

    // Initialize Letter Templates
    const defaultTemplates = [
      {
        templateName: 'Settlement Letter',
        templateType: 'Settlement',
        content: 'Dear {{CustomerName}},\n\nThis is to confirm your settlement agreement for Account No: {{AccountNo}}.\n\nSettlement Amount: ₹{{Amount}}\n\nThank you for your cooperation.\n\nSincerely,\nCollections Team',
        placeholders: [
          { name: '{{CustomerName}}', description: 'Customer full name' },
          { name: '{{AccountNo}}', description: 'Account number' },
          { name: '{{Amount}}', description: 'Settlement amount' }
        ],
        status: 'Active'
      },
      {
        templateName: 'Closure Letter',
        templateType: 'Closure',
        content: 'Dear {{CustomerName}},\n\nYour account {{AccountNo}} has been successfully closed.\n\nThank you for being a valued customer.\n\nRegards,\nCustomer Service',
        placeholders: [
          { name: '{{CustomerName}}', description: 'Customer full name' },
          { name: '{{AccountNo}}', description: 'Account number' }
        ],
        status: 'Active'
      },
      {
        templateName: 'NOC Template',
        templateType: 'NOC',
        content: 'NO OBJECTION CERTIFICATE\n\nThis is to certify that {{CustomerName}} has cleared all outstanding dues for Account No: {{AccountNo}}.\n\nWe have no objection to the closure of this account.',
        placeholders: [
          { name: '{{CustomerName}}', description: 'Customer full name' },
          { name: '{{AccountNo}}', description: 'Account number' }
        ],
        status: 'Active'
      },
      {
        templateName: 'NDC Template',
        templateType: 'NDC',
        content: 'NO DUE CERTIFICATE\n\nThis certifies that {{CustomerName}} (Account No: {{AccountNo}}) has no pending dues as of {{Date}}.\n\nAmount Cleared: ₹{{Amount}}',
        placeholders: [
          { name: '{{CustomerName}}', description: 'Customer full name' },
          { name: '{{AccountNo}}', description: 'Account number' },
          { name: '{{Date}}', description: 'Clearance date' },
          { name: '{{Amount}}', description: 'Total amount cleared' }
        ],
        status: 'Active'
      }
    ];

    for (const templateData of defaultTemplates) {
      const existing = await LetterTemplate.findOne({ 
        templateName: templateData.templateName,
        templateType: templateData.templateType
      });
      if (!existing) {
        await LetterTemplate.create({
          ...templateData,
          version: 1,
          createdBy: {
            userId: req.user?.id || req.user?._id,
            name: 'System'
          },
          modifiedBy: {
            userId: req.user?.id || req.user?._id,
            name: 'System'
          }
        });
      }
    }

    res.json({ message: 'Admin settings initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing settings', error: error.message });
  }
});

module.exports = router;
