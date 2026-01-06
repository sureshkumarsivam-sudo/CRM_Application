const express = require('express');
const router = express.Router();
const FieldExecutive = require('../models/FieldExecutive');

// Get all field executives with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      region,
      team,
      isActive,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Apply filters
    if (region && region !== 'All Regions') {
      query.region = region;
    }
    if (team && team !== 'All Teams') {
      query.team = team;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const fieldExecutives = await FieldExecutive.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FieldExecutive.countDocuments(query);

    res.json({
      fieldExecutives,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching field executives:', error);
    res.status(500).json({ message: 'Error fetching field executives', error: error.message });
  }
});

// Get field executive by ID
router.get('/:id', async (req, res) => {
  try {
    const fieldExecutive = await FieldExecutive.findById(req.params.id);
    
    if (!fieldExecutive) {
      return res.status(404).json({ message: 'Field Executive not found' });
    }
    
    res.json(fieldExecutive);
  } catch (error) {
    console.error('Error fetching field executive:', error);
    res.status(500).json({ message: 'Error fetching field executive', error: error.message });
  }
});

// Get dashboard statistics
router.get('/stats/dashboard', async (req, res) => {
  try {
    const { region, team, fromDate, toDate } = req.query;
    
    const matchQuery = { isActive: true };
    if (region && region !== 'All Regions') matchQuery.region = region;
    if (team && team !== 'All Teams') matchQuery.team = team;
    if (fromDate || toDate) {
      matchQuery.createdAt = {};
      if (fromDate) matchQuery.createdAt.$gte = new Date(fromDate);
      if (toDate) matchQuery.createdAt.$lte = new Date(toDate);
    }

    // Get aggregated stats
    const stats = await FieldExecutive.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalFEs: { $sum: 1 },
          totalAllocated: { $sum: '$allocated' },
          totalVisited: { $sum: '$visited' },
          totalValidVisits: { $sum: '$validVisits' },
          totalDistance: { $sum: '$distance' },
          totalPhotos: { $sum: '$photos' },
          avgEfficiency: { $avg: '$efficiencyScore' },
          totalCollection: { $sum: '$collectionAmount' },
          avgAttendance: { $avg: '$attendance' }
        }
      }
    ]);

    // Get top performers
    const topPerformers = await FieldExecutive.find(matchQuery)
      .sort({ efficiencyScore: -1 })
      .limit(5)
      .select('name employeeId region team efficiencyScore collectionAmount');

    // Get region-wise distribution
    const regionDistribution = await FieldExecutive.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          totalCollection: { $sum: '$collectionAmount' }
        }
      }
    ]);

    // Get performance trends (daily visits)
    const performanceTrends = await FieldExecutive.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActiveDate' } },
          totalVisits: { $sum: '$visited' },
          validVisits: { $sum: '$validVisits' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    res.json({
      summary: stats[0] || {
        totalFEs: 0,
        totalAllocated: 0,
        totalVisited: 0,
        totalValidVisits: 0,
        totalDistance: 0,
        totalPhotos: 0,
        avgEfficiency: 0,
        totalCollection: 0,
        avgAttendance: 0
      },
      topPerformers,
      regionDistribution,
      performanceTrends
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

// Create new field executive
router.post('/', async (req, res) => {
  try {
    const fieldExecutive = new FieldExecutive(req.body);
    await fieldExecutive.save();
    res.status(201).json(fieldExecutive);
  } catch (error) {
    console.error('Error creating field executive:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }
    res.status(500).json({ message: 'Error creating field executive', error: error.message });
  }
});

// Update field executive
router.put('/:id', async (req, res) => {
  try {
    const fieldExecutive = await FieldExecutive.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastActiveDate: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!fieldExecutive) {
      return res.status(404).json({ message: 'Field Executive not found' });
    }
    
    res.json(fieldExecutive);
  } catch (error) {
    console.error('Error updating field executive:', error);
    res.status(500).json({ message: 'Error updating field executive', error: error.message });
  }
});

// Delete field executive
router.delete('/:id', async (req, res) => {
  try {
    const fieldExecutive = await FieldExecutive.findByIdAndDelete(req.params.id);
    
    if (!fieldExecutive) {
      return res.status(404).json({ message: 'Field Executive not found' });
    }
    
    res.json({ message: 'Field Executive deleted successfully' });
  } catch (error) {
    console.error('Error deleting field executive:', error);
    res.status(500).json({ message: 'Error deleting field executive', error: error.message });
  }
});

// Bulk import field executives
router.post('/bulk-import', async (req, res) => {
  try {
    const { fieldExecutives } = req.body;
    
    if (!Array.isArray(fieldExecutives) || fieldExecutives.length === 0) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const results = await FieldExecutive.insertMany(fieldExecutives, { ordered: false });
    
    res.status(201).json({
      message: `Successfully imported ${results.length} field executives`,
      count: results.length
    });
  } catch (error) {
    console.error('Error bulk importing:', error);
    res.status(500).json({ message: 'Error bulk importing field executives', error: error.message });
  }
});

// Get unique regions
router.get('/filters/regions', async (req, res) => {
  try {
    const regions = await FieldExecutive.distinct('region');
    res.json(regions.sort());
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ message: 'Error fetching regions', error: error.message });
  }
});

// Get unique teams
router.get('/filters/teams', async (req, res) => {
  try {
    const teams = await FieldExecutive.distinct('team');
    res.json(teams.sort());
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
});

module.exports = router;
