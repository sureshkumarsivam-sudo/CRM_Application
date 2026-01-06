const express = require('express');
const router = express.Router();
const EmailTemplate = require('../models/EmailTemplate');

// Get all email templates
router.get('/', async (req, res) => {
  try {
    const templates = await EmailTemplate.find().sort({ templateType: 1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get template by type
router.get('/type/:templateType', async (req, res) => {
  try {
    const template = await EmailTemplate.findOne({ templateType: req.params.templateType });
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update template
router.put('/:id', async (req, res) => {
  try {
    const { subject, body, modifiedBy } = req.body;

    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      {
        subject,
        body,
        lastModified: new Date(),
        modifiedBy
      },
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({
      message: 'Template updated successfully',
      template
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle template active status
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    template.isActive = !template.isActive;
    await template.save();

    res.json({
      message: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`,
      template
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Preview template with sample data
router.post('/preview', async (req, res) => {
  try {
    const { templateId, sampleData } = req.body;

    const template = await EmailTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    let subject = template.subject;
    let body = template.body;

    // Replace placeholders with sample data
    Object.keys(sampleData).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = sampleData[key] || '';
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      body = body.replace(new RegExp(placeholder, 'g'), value);
    });

    res.json({ subject, body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
