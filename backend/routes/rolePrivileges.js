const express = require('express');
const router = express.Router();
const RolePrivilege = require('../models/RolePrivilege');

// GET all role privileges
router.get('/privileges', async (req, res) => {
  try {
    const rolePrivileges = await RolePrivilege.find({ is_active: true });
    
    res.status(200).json({
      success: true,
      count: rolePrivileges.length,
      privileges: rolePrivileges
    });
  } catch (error) {
    console.error('Error fetching role privileges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role privileges',
      error: error.message
    });
  }
});

// GET privileges by role name
router.get('/privileges/:roleName', async (req, res) => {
  try {
    const { roleName } = req.params;
    
    const rolePrivilege = await RolePrivilege.findOne({ 
      role_name: roleName,
      is_active: true 
    });
    
    if (!rolePrivilege) {
      return res.status(404).json({
        success: false,
        message: `Privileges not found for role: ${roleName}`
      });
    }
    
    res.status(200).json({
      success: true,
      role: roleName,
      privileges: {
        menu_access: rolePrivilege.menu_access,
        privileges: rolePrivilege.privileges
      }
    });
  } catch (error) {
    console.error('Error fetching role privileges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role privileges',
      error: error.message
    });
  }
});

// POST - Create or update role privileges
router.post('/privileges', async (req, res) => {
  try {
    const { role_name, menu_access, privileges, description } = req.body;
    
    if (!role_name) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }
    
    const rolePrivilege = await RolePrivilege.findOneAndUpdate(
      { role_name },
      {
        role_name,
        menu_access,
        privileges,
        description,
        updated_by: req.user?._id // Assuming authentication middleware sets req.user
      },
      { upsert: true, new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Role privileges updated successfully',
      privilege: rolePrivilege
    });
  } catch (error) {
    console.error('Error updating role privileges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role privileges',
      error: error.message
    });
  }
});

// PUT - Update specific privilege for a role
router.put('/privileges/:roleName', async (req, res) => {
  try {
    const { roleName } = req.params;
    const updates = req.body;
    
    const rolePrivilege = await RolePrivilege.findOneAndUpdate(
      { role_name: roleName },
      {
        ...updates,
        updated_by: req.user?._id
      },
      { new: true, runValidators: true }
    );
    
    if (!rolePrivilege) {
      return res.status(404).json({
        success: false,
        message: `Role not found: ${roleName}`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Role privileges updated successfully',
      privilege: rolePrivilege
    });
  } catch (error) {
    console.error('Error updating role privileges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update role privileges',
      error: error.message
    });
  }
});

// POST - Initialize default role privileges
router.post('/privileges/initialize', async (req, res) => {
  try {
    await RolePrivilege.initializeDefaultRoles();
    
    res.status(200).json({
      success: true,
      message: 'Default role privileges initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing default roles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize default role privileges',
      error: error.message
    });
  }
});

// GET - Check if user has specific privilege
router.get('/check-privilege/:roleName/:category/:privilege', async (req, res) => {
  try {
    const { roleName, category, privilege } = req.params;
    
    const rolePrivilege = await RolePrivilege.findOne({ 
      role_name: roleName,
      is_active: true 
    });
    
    if (!rolePrivilege) {
      return res.status(404).json({
        success: false,
        message: `Role not found: ${roleName}`,
        hasPrivilege: false
      });
    }
    
    const hasPrivilege = rolePrivilege.hasPrivilege(category, privilege);
    
    res.status(200).json({
      success: true,
      role: roleName,
      category,
      privilege,
      hasPrivilege
    });
  } catch (error) {
    console.error('Error checking privilege:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check privilege',
      error: error.message
    });
  }
});

// GET - Check menu access
router.get('/check-menu-access/:roleName/:menuKey', async (req, res) => {
  try {
    const { roleName, menuKey } = req.params;
    
    const rolePrivilege = await RolePrivilege.findOne({ 
      role_name: roleName,
      is_active: true 
    });
    
    if (!rolePrivilege) {
      return res.status(404).json({
        success: false,
        message: `Role not found: ${roleName}`,
        hasAccess: false
      });
    }
    
    const hasAccess = rolePrivilege.hasMenuAccess(menuKey);
    
    res.status(200).json({
      success: true,
      role: roleName,
      menuKey,
      hasAccess
    });
  } catch (error) {
    console.error('Error checking menu access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check menu access',
      error: error.message
    });
  }
});

// DELETE - Deactivate role privilege (soft delete)
router.delete('/privileges/:roleName', async (req, res) => {
  try {
    const { roleName } = req.params;
    
    const rolePrivilege = await RolePrivilege.findOneAndUpdate(
      { role_name: roleName },
      { is_active: false },
      { new: true }
    );
    
    if (!rolePrivilege) {
      return res.status(404).json({
        success: false,
        message: `Role not found: ${roleName}`
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Role privileges deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating role privileges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate role privileges',
      error: error.message
    });
  }
});

module.exports = router;
