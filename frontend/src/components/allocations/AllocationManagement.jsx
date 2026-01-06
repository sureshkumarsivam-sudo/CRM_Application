import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Checkbox,
} from '@mui/material';
import {
  Search as SearchIcon,
} from '@mui/icons-material';
import AllocationService from '../../services/AllocationService';
import CustomerService from '../../services/CustomerService';

const AllocationManagement = () => {
  // Individual Account Allocation
  const [loanAccountNumber, setLoanAccountNumber] = useState('');
  const [searchedAccount, setSearchedAccount] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Bulk Allocation Filters
  const [bulkFilters, setBulkFilters] = useState({
    state: '',
    city: '',
    dpdBucket: '',
    product: '',
    statusCode: '',
    teamUser: '',
    allocationValidity: '30'
  });

  // Accounts data
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Summary cards
  const [summary, setSummary] = useState({
    total: 0,
    allocated: 0,
    nonAllocated: 0,
    contacted: 0,
    contactable: 0
  });

  // Dropdown options
  const [states, setStates] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadAccounts();
    loadDropdownOptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bulkFilters, accounts]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📋 Loading accounts for allocation management...');
      
      const response = await CustomerService.getCustomers({ limit: 1000 });
      console.log('✅ Received customer response:', response);
      
      const accountsData = response?.data || [];
      console.log(`✅ Loaded ${accountsData.length} accounts`);
      
      setAccounts(accountsData);
      updateSummary(accountsData);
    } catch (err) {
      const errorMsg = err.message || 'Failed to load accounts';
      setError(errorMsg);
      console.error('❌ Error loading accounts:', err);
      setAccounts([]);
      setFilteredAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownOptions = async () => {
    try {
      console.log('📋 Loading dropdown options...');
      
      const response = await CustomerService.getCustomers({ limit: 1000 });
      const accountsData = response?.data || [];
      
      console.log(`✅ Processing ${accountsData.length} accounts for dropdown options`);
      
      const uniqueStates = [...new Set(accountsData.map(acc => acc.state).filter(Boolean))];
      const uniqueProducts = [...new Set(accountsData.map(acc => acc.productType || acc.product).filter(Boolean))];
      
      console.log('✅ States:', uniqueStates);
      console.log('✅ Products:', uniqueProducts);
      
      setStates(uniqueStates);
      setProducts(uniqueProducts);
    } catch (err) {
      console.error('❌ Error loading dropdown options:', err);
    }
  };

  const updateSummary = (accountsData) => {
    const total = accountsData.length;
    const allocated = accountsData.filter(acc => acc.allocation?.allocationId).length;
    const nonAllocated = total - allocated;
    
    setSummary({
      total,
      allocated,
      nonAllocated,
      contacted: 0,
      contactable: 0
    });
  };

  const applyFilters = () => {
    let filtered = [...accounts];

    if (bulkFilters.state) {
      filtered = filtered.filter(acc => acc.state === bulkFilters.state);
    }

    if (bulkFilters.city) {
      filtered = filtered.filter(acc => 
        acc.city?.toLowerCase().includes(bulkFilters.city.toLowerCase())
      );
    }

    if (bulkFilters.product) {
      filtered = filtered.filter(acc => 
        (acc.productType || acc.product) === bulkFilters.product
      );
    }

    if (bulkFilters.dpdBucket) {
      const [min, max] = bulkFilters.dpdBucket.split('-').map(v => parseInt(v));
      filtered = filtered.filter(acc => {
        const dpd = parseInt(acc.dpd || 0);
        if (max) {
          return dpd >= min && dpd <= max;
        }
        return dpd >= min;
      });
    }

    setFilteredAccounts(filtered);
    updateSummary(filtered);
  };

  const handleSearchAccount = async () => {
    if (!loanAccountNumber.trim()) {
      setError('Please enter a loan account number');
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      console.log('🔍 Searching for account:', loanAccountNumber.trim());
      
      const response = await CustomerService.getCustomers({ 
        search: loanAccountNumber.trim(),
        limit: 100 
      });
      
      const accountsData = response?.data || [];
      const account = accountsData.find(acc => acc.loanId === loanAccountNumber.trim());
      
      console.log('🔍 Search results:', accountsData.length, 'accounts found');
      
      if (account) {
        setSearchedAccount(account);
        console.log('✅ Account found:', account.loanId);
      } else {
        setSearchedAccount(null);
        setError('Account not found');
        console.warn('⚠️ Account not found:', loanAccountNumber.trim());
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to search account';
      setError(errorMsg);
      console.error('❌ Error searching account:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBulkAllocate = async () => {
    if (selectedAccounts.length === 0) {
      setError('Please select accounts to allocate');
      return;
    }

    if (!bulkFilters.teamUser) {
      setError('Please enter Team Leader/Collector for allocation');
      return;
    }

    try {
      setLoading(true);
      
      const allocationData = {
        accountIds: selectedAccounts.map(loanId => {
          const account = filteredAccounts.find(acc => acc.loanId === loanId);
          return account._id;
        }),
        allocatedTo: {
          callerName: bulkFilters.teamUser,
        },
        allocationType: 'Manual',
        priority: 'Medium',
        deadline: new Date(Date.now() + parseInt(bulkFilters.allocationValidity) * 24 * 60 * 60 * 1000),
        notes: `Bulk allocation of ${selectedAccounts.length} accounts`,
        createdBy: {
          name: 'Admin',
          userId: 'admin123',
          role: 'Administrator'
        }
      };

      console.log('📤 Sending allocation data:', allocationData);
      await AllocationService.createAllocation(allocationData);
      
      setSelectedAccounts([]);
      setBulkFilters({ ...bulkFilters, teamUser: '' });
      loadAccounts();
      setError(null);
      alert('Allocation created successfully!');
    } catch (err) {
      setError('Failed to create allocation');
      console.error('Error creating allocation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (loanId) => {
    setSelectedAccounts(prev => {
      if (prev.includes(loanId)) {
        return prev.filter(id => id !== loanId);
      }
      return [...prev, loanId];
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedAccounts(filteredAccounts.map(acc => acc.loanId));
    } else {
      setSelectedAccounts([]);
    }
  };

  return (
    <Box sx={{ p: 2, width: '100%', height: '100%' }}>
        {/* Header */}
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 2, 
            fontWeight: 600, 
            color: '#1E40AF'
          }}
        >
          Master Allocation Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Individual Account Allocation */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#ffffff', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1E40AF' }}>
          Individual Account Allocation
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
              Search Loan Account Number
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter loan account number"
              value={loanAccountNumber}
              onChange={(e) => setLoanAccountNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchAccount()}
              sx={{ backgroundColor: 'white' }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={searchLoading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
            onClick={handleSearchAccount}
            disabled={searchLoading}
            sx={{
              mt: 3,
              background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
              color: 'white',
              '&:hover': { 
                background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
              },
              textTransform: 'none',
              px: 4,
            }}
          >
            Search Account
          </Button>
        </Box>

        {searchedAccount && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'white', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Typography variant="caption" color="text.secondary">Loan ID</Typography>
                <Typography variant="body2" fontWeight={600}>{searchedAccount.loanId}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="caption" color="text.secondary">Customer Name</Typography>
                <Typography variant="body2" fontWeight={600}>{searchedAccount.accountName || searchedAccount.customerName || '-'}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="caption" color="text.secondary">Outstanding</Typography>
                <Typography variant="body2" fontWeight={600}>₹{(searchedAccount.totalOutstanding || searchedAccount.currentOutstanding || 0).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {searchedAccount.allocation?.allocationId ? 'Allocated' : 'Not Allocated'}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Bulk Allocation */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1E40AF' }}>
          Bulk Allocation
        </Typography>

        <Grid container spacing={2}>
          {/* Row 1 */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>State</InputLabel>
              <Select
                value={bulkFilters.state}
                onChange={(e) => setBulkFilters({ ...bulkFilters, state: e.target.value })}
                label="State"
              >
                <MenuItem value="">--Select State--</MenuItem>
                {states.map(state => (
                  <MenuItem key={state} value={state}>{state}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="City/District"
              placeholder="Enter city or postal code"
              value={bulkFilters.city}
              onChange={(e) => setBulkFilters({ ...bulkFilters, city: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>DPD Bucket (Days Past Due)</InputLabel>
              <Select
                value={bulkFilters.dpdBucket}
                onChange={(e) => setBulkFilters({ ...bulkFilters, dpdBucket: e.target.value })}
                label="DPD Bucket (Days Past Due)"
              >
                <MenuItem value="">--Select DPD--</MenuItem>
                <MenuItem value="0-30">0-30 days</MenuItem>
                <MenuItem value="31-60">31-60 days</MenuItem>
                <MenuItem value="61-90">61-90 days</MenuItem>
                <MenuItem value="91-999">91+ days</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Row 2 */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Product Type</InputLabel>
              <Select
                value={bulkFilters.product}
                onChange={(e) => setBulkFilters({ ...bulkFilters, product: e.target.value })}
                label="Product Type"
              >
                <MenuItem value="">--Select Product--</MenuItem>
                {products.map(product => (
                  <MenuItem key={product} value={product}>{product}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Code</InputLabel>
              <Select
                value={bulkFilters.statusCode}
                onChange={(e) => setBulkFilters({ ...bulkFilters, statusCode: e.target.value })}
                label="Status Code"
              >
                <MenuItem value="">--Select Status--</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Mid">Mid</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Uncontacted">Uncontacted</MenuItem>
                <MenuItem value="PTP">PTP</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Team/User"
              placeholder="Team Leader/Collector Name"
              value={bulkFilters.teamUser}
              onChange={(e) => setBulkFilters({ ...bulkFilters, teamUser: e.target.value })}
            />
          </Grid>

          {/* Row 3 */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Allocation Validity (days)</InputLabel>
              <Select
                value={bulkFilters.allocationValidity}
                onChange={(e) => setBulkFilters({ ...bulkFilters, allocationValidity: e.target.value })}
                label="Allocation Validity (days)"
              >
                <MenuItem value="30">30</MenuItem>
                <MenuItem value="60">60</MenuItem>
                <MenuItem value="90">90</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, mb: 2 }}>
          <Button
            variant="contained"
            onClick={handleBulkAllocate}
            disabled={loading || selectedAccounts.length === 0}
            sx={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
              color: 'white',
              '&:hover': { 
                background: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)'
              },
              textTransform: 'none',
              px: 4,
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Bulk Allocate'}
          </Button>
          <Typography 
            variant="caption" 
            sx={{ 
              ml: 2, 
              color: '#D32F2F',
              fontStyle: 'italic'
            }}
          >
            Please enter Team Leader/Collector for allocation.
          </Typography>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight={700}>{summary.total}</Typography>
                <Typography variant="body2">Total Accounts</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ backgroundColor: '#DBEAFE', border: '2px solid #1E40AF' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight={700} color="#1E40AF">{summary.allocated}</Typography>
                <Typography variant="body2" color="text.secondary">Allocated</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ backgroundColor: '#EFF6FF', border: '2px solid #2563EB' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight={700} color="#1E40AF">{summary.nonAllocated}</Typography>
                <Typography variant="body2" color="text.secondary">Non-Allocated</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ backgroundColor: '#EFF6FF', border: '2px solid #3B82F6' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight={700} color="#2563EB">{summary.contacted}</Typography>
                <Typography variant="body2" color="text.secondary">Contacted</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2.4}>
            <Card sx={{ backgroundColor: '#BFDBFE', border: '2px solid #1E40AF' }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" fontWeight={700} color="#2563EB">{summary.contactable}</Typography>
                <Typography variant="body2" color="text.secondary">Contactable</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Accounts Table */}
        <TableContainer sx={{ maxHeight: 500, overflowX: 'auto', width: '100%' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 60 }}>
                  <Checkbox
                    checked={selectedAccounts.length === filteredAccounts.length && filteredAccounts.length > 0}
                    indeterminate={selectedAccounts.length > 0 && selectedAccounts.length < filteredAccounts.length}
                    onChange={handleSelectAll}
                    sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 50 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 120 }}>Account ID</TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 100 }}>State</TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 100 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 100 }}>Product</TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 70 }}>DPD</TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 100 }}>Value</TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 100 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 120 }}>Allocated To</TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 110 }}>Allocated On</TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 90 }}>Validity</TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 100 }}>Expiry</TableCell>
                <TableCell sx={{ fontWeight: 600, background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)', color: 'white', minWidth: 120 }}>Remarks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 4 }}>
                    No accounts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.slice(0, 50).map((account, index) => (
                  <TableRow 
                    key={account._id}
                    selected={selectedAccounts.includes(account.loanId)}
                    sx={{ 
                      '&:hover': { backgroundColor: '#FFF9E6' },
                      backgroundColor: index % 2 === 0 ? 'white' : '#FAFAFA'
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedAccounts.includes(account.loanId)}
                        onChange={() => handleSelectAccount(account.loanId)}
                      />
                    </TableCell>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{account.loanId}</TableCell>
                    <TableCell>{account.state || '-'}</TableCell>
                    <TableCell>{account.city || '-'}</TableCell>
                    <TableCell>{account.productType || account.product || '-'}</TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: account.dpd > 90 ? '#D32F2F' : account.dpd > 30 ? '#F57C00' : '#2E7D32',
                          fontWeight: 600
                        }}
                      >
                        {account.dpd || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>₹{(account.totalOutstanding || account.currentOutstanding || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      {account.allocation?.allocationId ? (
                        <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 600 }}>
                          Allocated
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#F57C00', fontWeight: 600 }}>
                          Uncontacted
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{account.allocation?.callerName || '-'}</TableCell>
                    <TableCell>
                      {account.allocation?.allocatedDate 
                        ? new Date(account.allocation.allocatedDate).toLocaleDateString() 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {account.allocation?.validityDays 
                        ? `${account.allocation.validityDays} days` 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {account.allocation?.expiryDate 
                        ? new Date(account.allocation.expiryDate).toLocaleDateString() 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {account.allocation?.remarks || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredAccounts.length > 50 && (
          <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
            Showing 50 of {filteredAccounts.length} accounts
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default AllocationManagement;

