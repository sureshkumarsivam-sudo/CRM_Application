import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  ButtonGroup,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  AccountBox as AccountBoxIcon,
  Description as DocumentsIcon,
  Assessment as ReportsIcon,
  Gavel as CollectionsIcon,
  Payment as SettlementsIcon,
  Receipt as AllocationsIcon,
  Verified as AuditIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  TextFields as TextFieldsIcon,
  DirectionsRun as FieldExecutiveIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Storage as StorageIcon,
  Category as CategoryIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/AuthService';

// All available menu items with privilege keys
const allMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', privilegeKey: 'dashboard' },
  { text: 'Accounts', icon: <AccountBoxIcon />, path: '/accounts', privilegeKey: 'accounts' },
  { text: 'Allocations', icon: <AllocationsIcon />, path: '/allocations', privilegeKey: 'allocations' },
  { text: 'Collections', icon: <CollectionsIcon />, path: '/collections', privilegeKey: 'collections' },
  { text: 'Settlements', icon: <SettlementsIcon />, path: '/settlements', privilegeKey: 'settlements' },
  { text: 'Field Executive', icon: <FieldExecutiveIcon />, path: '/field-executive', privilegeKey: 'field_executive' },
  { text: 'Documents', icon: <DocumentsIcon />, path: '/documents', privilegeKey: 'documents' },
  { text: 'Reports', icon: <ReportsIcon />, path: '/reports', privilegeKey: 'reports' },
  { 
    text: 'Settings', 
    icon: <SettingsIcon />, 
    privilegeKey: 'settings',
    submenu: [
      { text: 'General Settings', icon: <SettingsIcon />, path: '/settings', privilegeKey: 'settings' },
      { text: 'Admin Settings', icon: <AdminIcon />, path: '/settings/admin', privilegeKey: 'admin_settings' }
    ]
  },
  { text: 'Employees', icon: <PeopleIcon />, path: '/employees', privilegeKey: 'employees' },
  { text: 'Audit', icon: <AuditIcon />, path: '/audit', privilegeKey: 'audit' },
  { 
    text: 'Master Menu', 
    icon: <StorageIcon />, 
    privilegeKey: 'admin',
    submenu: [
      { text: 'Status Code', icon: <CategoryIcon />, path: '/master/status-code', privilegeKey: 'manage_status_codes' },
      { text: 'Process', icon: <WorkIcon />, path: '/master/process', privilegeKey: 'manage_status_codes' },
      { text: 'Privilege', icon: <SecurityIcon />, path: '/admin/privileges', privilegeKey: 'grant_privileges' }
    ]
  },
];

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [masterMenuAnchor, setMasterMenuAnchor] = useState(null);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState(null);
  const [fontSize, setFontSize] = useState(14);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  // Filter menu items based on user privileges
  const getFilteredMenuItems = () => {
    const currentUser = AuthService.getCurrentUser();
    const userRole = currentUser?.role?.toLowerCase();
    
    return allMenuItems.filter(item => {
      // For Super Admin or Admin, show Master Menu and Settings submenu regardless of specific privileges
      if ((item.text === 'Master Menu' || item.text === 'Settings') && (userRole === 'super admin' || userRole === 'admin')) {
        // For Settings submenu, filter admin-only items
        if (item.submenu) {
          item.submenu = item.submenu.filter(subItem => {
            // Admin Settings is only for Admin roles
            if (subItem.text === 'Admin Settings') {
              return userRole === 'super admin' || userRole === 'admin';
            }
            return true;
          });
          // Only show Settings menu if there are accessible subitems
          return item.submenu.length > 0;
        }
        return true;
      }
      
      // Check if user has menu access
      if (!AuthService.hasMenuAccess(item.privilegeKey)) {
        return false;
      }
      
      // For items with submenu, filter submenu items and check if any are accessible
      if (item.submenu) {
        const filteredSubmenu = item.submenu.filter(subItem => {
          // Check if user has the specific privilege for submenu item
          return AuthService.hasPrivilege(subItem.privilegeKey);
        });
        
        // Only show parent menu if at least one submenu item is accessible
        if (filteredSubmenu.length === 0) {
          return false;
        }
        
        // Update item with filtered submenu
        item.submenu = filteredSubmenu;
      }
      
      return true;
    });
  };

  const menuItems = getFilteredMenuItems();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMasterMenuOpen = (event) => {
    setMasterMenuAnchor(event.currentTarget);
  };

  const handleMasterMenuClose = () => {
    setMasterMenuAnchor(null);
  };

  const handleSettingsMenuOpen = (event) => {
    setSettingsMenuAnchor(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsMenuAnchor(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
    handleMasterMenuClose();
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    console.log('Logging out...');
    navigate('/login');
  };

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 2, 10));
  };

  const resetFontSize = () => {
    setFontSize(14);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ 
        p: 2, 
        background: 'linear-gradient(135deg, #5B9BD5 0%, #8BB7E0 100%)',
        color: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            fontFamily: "'Roboto', 'Segoe UI', sans-serif",
            letterSpacing: '0.5px',
          }}
        >
          📊 Debtrix
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: '#FFFFFF' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          item.submenu ? (
            <Box key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  sx={{
                    backgroundColor: (
                      (item.text === 'Master Menu' && (location.pathname.startsWith('/master') || location.pathname.startsWith('/admin'))) ||
                      (item.text === 'Settings' && location.pathname.startsWith('/settings'))
                    ) ? 'rgba(91, 155, 213, 0.1)' : 'transparent',
                    borderLeft: (
                      (item.text === 'Master Menu' && (location.pathname.startsWith('/master') || location.pathname.startsWith('/admin'))) ||
                      (item.text === 'Settings' && location.pathname.startsWith('/settings'))
                    ) ? '4px solid #5B9BD5' : 'none',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: (
                        (item.text === 'Master Menu' && (location.pathname.startsWith('/master') || location.pathname.startsWith('/admin'))) ||
                        (item.text === 'Settings' && location.pathname.startsWith('/settings'))
                      ) ? '#5B9BD5' : 'inherit',
                      fontSize: '20px',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ fontSize: '16px', fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
              <List component="div" disablePadding>
                {item.submenu.map((subItem) => (
                  <ListItemButton
                    key={subItem.text}
                    onClick={() => handleNavigation(subItem.path)}
                    selected={location.pathname === subItem.path}
                    sx={{
                      pl: 4,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(91, 155, 213, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: location.pathname === subItem.path ? '#5B9BD5' : 'inherit',
                        fontSize: '18px',
                      }}
                    >
                      {subItem.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={subItem.text} 
                      primaryTypographyProps={{ fontSize: '14px', fontWeight: 500 }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          ) : (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(91, 155, 213, 0.1)',
                    borderLeft: '4px solid #5B9BD5',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? '#5B9BD5' : 'inherit',
                    fontSize: '20px',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: '16px', fontWeight: 500 }}
                />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', m: 0, p: 0, overflow: 'hidden' }}>
      {/* Top Navigation Bar */}
      <AppBar 
        position="static" 
        sx={{ 
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          borderBottom: '1px solid #E8EDF2',
          width: '100%',
          flexShrink: 0,
          zIndex: 1100
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', px: { xs: 1, sm: 2, md: 3 } }}>
          {/* Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography 
              variant="h5" 
              noWrap 
              component="div"
              sx={{
                fontWeight: 700,
                fontFamily: "'Roboto', 'Segoe UI', sans-serif",
                mr: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                letterSpacing: '0.5px',
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                color: '#5B9BD5',
              }}
              onClick={() => navigate('/dashboard')}
            >
              📊 Debtrix
            </Typography>

            {/* Desktop Menu */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {menuItems.map((item) => (
                item.submenu ? (
                  <Box key={item.text}>
                    <Button
                      onClick={item.text === 'Master Menu' ? handleMasterMenuOpen : handleSettingsMenuOpen}
                      startIcon={item.icon}
                      endIcon={<ArrowDropDownIcon />}
                      sx={{
                        color: '#2C3E50',
                        backgroundColor: (
                          (item.text === 'Master Menu' && (location.pathname.startsWith('/master') || location.pathname.startsWith('/admin'))) ||
                          (item.text === 'Settings' && location.pathname.startsWith('/settings'))
                        ) ? 'rgba(91, 155, 213, 0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(91, 155, 213, 0.08)',
                        },
                        borderRadius: 2,
                        px: 2,
                        textTransform: 'none',
                        fontWeight: (
                          (item.text === 'Master Menu' && (location.pathname.startsWith('/master') || location.pathname.startsWith('/admin'))) ||
                          (item.text === 'Settings' && location.pathname.startsWith('/settings'))
                        ) ? 600 : 500,
                        fontSize: '0.875rem',
                      }}
                    >
                      {item.text}
                    </Button>
                    <Menu
                      anchorEl={item.text === 'Master Menu' ? masterMenuAnchor : settingsMenuAnchor}
                      open={item.text === 'Master Menu' ? Boolean(masterMenuAnchor) : Boolean(settingsMenuAnchor)}
                      onClose={item.text === 'Master Menu' ? handleMasterMenuClose : handleSettingsMenuClose}
                      sx={{
                        '& .MuiPaper-root': {
                          borderRadius: 2,
                          mt: 1,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      {item.submenu.map((subItem) => (
                        <MenuItem
                          key={subItem.text}
                          onClick={() => handleNavigation(subItem.path)}
                          sx={{
                            minWidth: 200,
                            backgroundColor: location.pathname === subItem.path ? 'rgba(91, 155, 213, 0.1)' : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(91, 155, 213, 0.08)',
                            }
                          }}
                        >
                          <ListItemIcon sx={{ color: '#5B9BD5' }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={subItem.text}
                            primaryTypographyProps={{
                              fontWeight: location.pathname === subItem.path ? 600 : 400
                            }}
                          />
                        </MenuItem>
                      ))}
                    </Menu>
                  </Box>
                ) : (
                  <Button
                    key={item.text}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: '#2C3E50',
                      backgroundColor: location.pathname === item.path ? 'rgba(91, 155, 213, 0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(91, 155, 213, 0.08)',
                      },
                      borderRadius: 2,
                      px: 2,
                      textTransform: 'none',
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      fontSize: '0.875rem',
                    }}
                  >
                    {item.text}
                  </Button>
                )
              ))}
            </Box>
          </Box>

          {/* User Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Font Size Controls */}
            <Tooltip title="Adjust Font Size">
              <ButtonGroup size="small" variant="outlined" sx={{ 
                borderColor: '#D1DBE5',
                '& .MuiButton-outlined': {
                  borderColor: '#D1DBE5',
                  color: '#546E7A',
                  '&:hover': {
                    borderColor: '#5B9BD5',
                    backgroundColor: 'rgba(91, 155, 213, 0.08)',
                  }
                }
              }}>
                <IconButton 
                  size="small" 
                  onClick={decreaseFontSize}
                  sx={{ 
                    color: '#546E7A',
                    border: '1px solid #D1DBE5',
                    borderRadius: '6px 0 0 6px',
                    '&:hover': { backgroundColor: 'rgba(91, 155, 213, 0.08)', color: '#5B9BD5' }
                  }}
                >
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
                <Button 
                  size="small"
                  onClick={resetFontSize}
                  sx={{ 
                    color: '#546E7A',
                    fontWeight: 600,
                    borderLeft: '1px solid #D1DBE5',
                    borderRight: '1px solid #D1DBE5',
                    borderTop: '1px solid #D1DBE5',
                    borderBottom: '1px solid #D1DBE5',
                    minWidth: '45px',
                    '&:hover': { backgroundColor: 'rgba(91, 155, 213, 0.08)', color: '#5B9BD5' }
                  }}
                >
                  {fontSize}
                </Button>
                <IconButton 
                  size="small" 
                  onClick={increaseFontSize}
                  sx={{ 
                    color: '#546E7A',
                    border: '1px solid #D1DBE5',
                    borderRadius: '0 6px 6px 0',
                    '&:hover': { backgroundColor: 'rgba(91, 155, 213, 0.08)', color: '#5B9BD5' }
                  }}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </ButtonGroup>
            </Tooltip>

            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, color: '#2C3E50', fontWeight: 600 }}>
              Super Admin
            </Typography>
            <Button 
              variant="contained" 
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ 
                backgroundColor: '#E57373',
                color: 'white',
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#EF5350',
                  boxShadow: '0 2px 8px rgba(229, 115, 115, 0.3)',
                },
                textTransform: 'none',
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          background: 'transparent',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%',
          position: 'relative',
          fontSize: `${fontSize}px`,
          '& *': {
            fontSize: 'inherit',
          },
          '& .MuiTypography-h4': {
            fontSize: `${fontSize * 1.7}px`,
          },
          '& .MuiTypography-h5': {
            fontSize: `${fontSize * 1.5}px`,
          },
          '& .MuiTypography-h6': {
            fontSize: `${fontSize * 1.2}px`,
          },
          '& .MuiTableCell-root': {
            fontSize: `${fontSize}px`,
          },
          '& .MuiButton-root': {
            fontSize: `${fontSize}px`,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
