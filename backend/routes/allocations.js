const express = require('express');
const router = express.Router();
const Allocation = require('../models/Allocation');
const AllocationHistory = require('../models/AllocationHistory');
const Customer = require('../models/Customer');

// Get all allocations with filtering, pagination, and search
router.get('/', async (req, res) => {
  try {
    console.log('📋 Allocations list request:', req.query);
    
    const {
      page = 1,
      limit = 20,
      search = '',
      status,
      callerName,
      team,
      allocationType,
      startDate,
      endDate,
      sortBy = 'allocationDate',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { allocationId: { $regex: search, $options: 'i' } },
        { 'allocatedTo.callerName': { $regex: search, $options: 'i' } },
        { 'team.teamName': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (status) query.status = status;
    if (callerName) query['allocatedTo.callerName'] = { $regex: callerName, $options: 'i' };
    if (team) query['team.teamName'] = { $regex: team, $options: 'i' };
    if (allocationType) query.allocationType = allocationType;
    
    // Date range filter
    if (startDate || endDate) {
      query.allocationDate = {};
      if (startDate) query.allocationDate.$gte = new Date(startDate);
      if (endDate) query.allocationDate.$lte = new Date(endDate);
    }

    console.log('📊 Query:', JSON.stringify(query, null, 2));

    // Get total count for pagination
    const totalRecords = await Allocation.countDocuments(query);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get allocations
    const allocations = await Allocation.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .lean();

    console.log(`✅ Found ${allocations.length} allocations out of ${totalRecords} total`);

    res.json({
      success: true,
      data: allocations,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum),
        totalRecords,
        limit: limitNum,
        hasMore: skip + allocations.length < totalRecords
      }
    });

  } catch (error) {
    console.error('❌ Error fetching allocations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching allocations',
      error: error.message
    });
  }
});

// Get single allocation by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`📄 Allocation detail request: ${req.params.id}`);
    
    const allocation = await Allocation.findById(req.params.id).lean();
    
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
    }

    // Get allocation history
    const history = await AllocationHistory.find({ 
      allocationId: allocation.allocationId 
    })
    .sort({ timestamp: -1 })
    .lean();

    console.log(`✅ Found allocation: ${allocation.allocationId}`);
    
    res.json({
      success: true,
      data: {
        ...allocation,
        history
      }
    });

  } catch (error) {
    console.error('❌ Error fetching allocation:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching allocation details',
      error: error.message
    });
  }
});

// Create new allocation
router.post('/', async (req, res) => {
  try {
    console.log('➕ Create allocation request:', req.body);
    
    const {
      accountIds,
      allocatedTo,
      team,
      allocationType = 'Manual',
      allocationRules,
      priority = 'Medium',
      targetAmount,
      targetContacts,
      deadline,
      notes,
      createdBy
    } = req.body;

    if (!accountIds || accountIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one account must be selected for allocation'
      });
    }

    if (!allocatedTo || !allocatedTo.callerName) {
      return res.status(400).json({
        success: false,
        message: 'Caller name is required'
      });
    }

    // Fetch account details
    const accounts = await Customer.find({ _id: { $in: accountIds } })
      .select('loanId accountName totalOutstanding principalOutstanding dpd bucket')
      .lean();

    if (accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid accounts found'
      });
    }

    // Prepare account data for allocation
    const allocationAccounts = accounts.map(acc => ({
      accountId: acc._id,
      loanId: acc.loanId,
      accountName: acc.accountName,
      totalOutstanding: acc.totalOutstanding || 0,
      principalOutstanding: acc.principalOutstanding || 0,
      dpd: acc.dpd || 0,
      bucket: acc.bucket || ''
    }));

    // Create allocation
    const allocation = new Allocation({
      accounts: allocationAccounts,
      allocatedTo,
      team,
      allocationType,
      allocationRules,
      priority,
      targetAmount,
      targetContacts,
      deadline,
      notes,
      createdBy,
      status: 'Active'
    });

    await allocation.save();

    // Update accounts with allocation info
    await Customer.updateMany(
      { _id: { $in: accountIds } },
      { 
        $set: {
          allocation: allocation.allocationId,
          callerName: allocatedTo.callerName,
          teamLeader: team?.teamLeader || '',
          manager: team?.manager || ''
        }
      }
    );

    // Create history records
    const historyRecords = accounts.map(acc => ({
      allocationId: allocation.allocationId,
      accountId: acc._id,
      loanId: acc.loanId,
      accountName: acc.accountName,
      action: 'Allocated',
      to: {
        callerName: allocatedTo.callerName,
        callerId: allocatedTo.callerId,
        team: team?.teamName,
        allocationId: allocation.allocationId
      },
      notes: notes,
      performedBy: createdBy,
      timestamp: new Date()
    }));

    await AllocationHistory.insertMany(historyRecords);

    console.log(`✅ Created allocation: ${allocation.allocationId} with ${accounts.length} accounts`);

    res.status(201).json({
      success: true,
      message: `Successfully allocated ${accounts.length} accounts`,
      data: allocation
    });

  } catch (error) {
    console.error('❌ Error creating allocation:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating allocation',
      error: error.message
    });
  }
});

// Update allocation
router.put('/:id', async (req, res) => {
  try {
    console.log(`✏️ Update allocation request: ${req.params.id}`);
    
    const allocation = await Allocation.findById(req.params.id);
    
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
    }

    const updates = req.body;
    const modifiedBy = updates.modifiedBy;
    delete updates.modifiedBy;

    // Update fields
    Object.keys(updates).forEach(key => {
      allocation[key] = updates[key];
    });

    allocation.modifiedBy = {
      ...modifiedBy,
      timestamp: new Date()
    };

    await allocation.save();

    console.log(`✅ Updated allocation: ${allocation.allocationId}`);

    res.json({
      success: true,
      message: 'Allocation updated successfully',
      data: allocation
    });

  } catch (error) {
    console.error('❌ Error updating allocation:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating allocation',
      error: error.message
    });
  }
});

// Reallocate accounts
router.post('/reallocate', async (req, res) => {
  try {
    console.log('🔄 Reallocation request:', req.body);
    
    const {
      sourceAllocationId,
      accountIds,
      newAllocatedTo,
      newTeam,
      reason,
      notes,
      performedBy
    } = req.body;

    if (!sourceAllocationId || !accountIds || accountIds.length === 0 || !newAllocatedTo) {
      return res.status(400).json({
        success: false,
        message: 'Source allocation, accounts, and new assignee are required'
      });
    }

    // Get source allocation
    const sourceAllocation = await Allocation.findOne({ allocationId: sourceAllocationId });
    
    if (!sourceAllocation) {
      return res.status(404).json({
        success: false,
        message: 'Source allocation not found'
      });
    }

    // Get accounts to reallocate
    const accountsToReallocate = sourceAllocation.accounts.filter(acc => 
      accountIds.includes(acc.accountId.toString())
    );

    if (accountsToReallocate.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid accounts found in source allocation'
      });
    }

    // Create new allocation
    const newAllocation = new Allocation({
      accounts: accountsToReallocate,
      allocatedTo: newAllocatedTo,
      team: newTeam || sourceAllocation.team,
      allocationType: 'Reallocation',
      priority: sourceAllocation.priority,
      notes: notes || `Reallocated from ${sourceAllocation.allocatedTo.callerName}`,
      reallocatedFrom: {
        allocationId: sourceAllocationId,
        callerName: sourceAllocation.allocatedTo.callerName,
        reason: reason,
        date: new Date()
      },
      createdBy: performedBy,
      status: 'Active'
    });

    await newAllocation.save();

    // Remove accounts from source allocation
    sourceAllocation.accounts = sourceAllocation.accounts.filter(acc => 
      !accountIds.includes(acc.accountId.toString())
    );
    
    if (sourceAllocation.accounts.length === 0) {
      sourceAllocation.status = 'Reassigned';
    }
    
    await sourceAllocation.save();

    // Update customer records
    await Customer.updateMany(
      { _id: { $in: accountIds } },
      { 
        $set: {
          allocation: newAllocation.allocationId,
          callerName: newAllocatedTo.callerName,
          teamLeader: (newTeam || sourceAllocation.team).teamLeader || '',
          manager: (newTeam || sourceAllocation.team).manager || ''
        }
      }
    );

    // Create history records
    const historyRecords = accountsToReallocate.map(acc => ({
      allocationId: newAllocation.allocationId,
      accountId: acc.accountId,
      loanId: acc.loanId,
      accountName: acc.accountName,
      action: 'Reassigned',
      from: {
        callerName: sourceAllocation.allocatedTo.callerName,
        callerId: sourceAllocation.allocatedTo.callerId,
        team: sourceAllocation.team?.teamName,
        allocationId: sourceAllocationId
      },
      to: {
        callerName: newAllocatedTo.callerName,
        callerId: newAllocatedTo.callerId,
        team: (newTeam || sourceAllocation.team).teamName,
        allocationId: newAllocation.allocationId
      },
      reason: reason,
      notes: notes,
      performedBy: performedBy,
      timestamp: new Date()
    }));

    await AllocationHistory.insertMany(historyRecords);

    console.log(`✅ Reallocated ${accountsToReallocate.length} accounts from ${sourceAllocationId} to ${newAllocation.allocationId}`);

    res.json({
      success: true,
      message: `Successfully reallocated ${accountsToReallocate.length} accounts`,
      data: {
        newAllocation,
        sourceAllocation
      }
    });

  } catch (error) {
    console.error('❌ Error reallocating accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Error reallocating accounts',
      error: error.message
    });
  }
});

// Get allocation statistics
router.get('/stats/summary', async (req, res) => {
  try {
    console.log('📊 Allocation stats request');
    
    const { startDate, endDate, callerName, team } = req.query;
    
    let query = {};
    
    if (startDate || endDate) {
      query.allocationDate = {};
      if (startDate) query.allocationDate.$gte = new Date(startDate);
      if (endDate) query.allocationDate.$lte = new Date(endDate);
    }
    
    if (callerName) query['allocatedTo.callerName'] = callerName;
    if (team) query['team.teamName'] = team;

    const [
      totalAllocations,
      activeAllocations,
      completedAllocations,
      totalAccountsAllocated,
      totalOutstandingAmount,
      allocationsByType,
      allocationsByCaller,
      recentAllocations
    ] = await Promise.all([
      Allocation.countDocuments(query),
      Allocation.countDocuments({ ...query, status: 'Active' }),
      Allocation.countDocuments({ ...query, status: 'Completed' }),
      Allocation.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totalAccounts' } } }
      ]),
      Allocation.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totalOutstanding' } } }
      ]),
      Allocation.aggregate([
        { $match: query },
        { $group: { _id: '$allocationType', count: { $sum: 1 }, accounts: { $sum: '$totalAccounts' } } }
      ]),
      Allocation.aggregate([
        { $match: query },
        { $group: { 
          _id: '$allocatedTo.callerName', 
          count: { $sum: 1 }, 
          totalAccounts: { $sum: '$totalAccounts' },
          totalOutstanding: { $sum: '$totalOutstanding' },
          collected: { $sum: '$performance.collectionAmount' }
        }},
        { $sort: { totalAccounts: -1 } },
        { $limit: 10 }
      ]),
      Allocation.find(query)
        .sort({ allocationDate: -1 })
        .limit(10)
        .lean()
    ]);

    const response = {
      success: true,
      data: {
        summary: {
          totalAllocations,
          activeAllocations,
          completedAllocations,
          totalAccountsAllocated: totalAccountsAllocated[0]?.total || 0,
          totalOutstandingAmount: totalOutstandingAmount[0]?.total || 0
        },
        allocationsByType,
        allocationsByCaller,
        recentAllocations
      }
    };

    console.log('✅ Allocation stats response ready');
    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching allocation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching allocation statistics',
      error: error.message
    });
  }
});

// Get allocation history
router.get('/history/all', async (req, res) => {
  try {
    console.log('📜 Allocation history request:', req.query);
    
    const {
      page = 1,
      limit = 50,
      allocationId,
      accountId,
      loanId,
      callerName,
      action,
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    
    if (allocationId) query.allocationId = allocationId;
    if (accountId) query.accountId = accountId;
    if (loanId) query.loanId = { $regex: loanId, $options: 'i' };
    if (callerName) query['to.callerName'] = { $regex: callerName, $options: 'i' };
    if (action) query.action = action;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const totalRecords = await AllocationHistory.countDocuments(query);

    const history = await AllocationHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();

    console.log(`✅ Found ${history.length} history records`);

    res.json({
      success: true,
      data: history,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum),
        totalRecords,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('❌ Error fetching allocation history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching allocation history',
      error: error.message
    });
  }
});

// Cancel allocation
router.post('/:id/cancel', async (req, res) => {
  try {
    console.log(`❌ Cancel allocation request: ${req.params.id}`);
    
    const { reason, cancelledBy } = req.body;
    
    const allocation = await Allocation.findById(req.params.id);
    
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
    }

    if (allocation.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Allocation is already cancelled'
      });
    }

    allocation.status = 'Cancelled';
    allocation.cancelledBy = {
      ...cancelledBy,
      reason,
      timestamp: new Date()
    };

    await allocation.save();

    // Create history record
    await AllocationHistory.create({
      allocationId: allocation.allocationId,
      accountId: allocation.accounts[0]?.accountId,
      loanId: allocation.accounts[0]?.loanId,
      action: 'Cancelled',
      reason: reason,
      performedBy: cancelledBy,
      timestamp: new Date()
    });

    console.log(`✅ Cancelled allocation: ${allocation.allocationId}`);

    res.json({
      success: true,
      message: 'Allocation cancelled successfully',
      data: allocation
    });

  } catch (error) {
    console.error('❌ Error cancelling allocation:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling allocation',
      error: error.message
    });
  }
});

module.exports = router;
