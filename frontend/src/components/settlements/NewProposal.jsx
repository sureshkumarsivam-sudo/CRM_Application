import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import SettlementService from '../../services/SettlementService';
import CustomerService from '../../services/CustomerService';
import AccountLockModal from './AccountLockModal';
import ProposalBlockedModal from './ProposalBlockedModal';

const NewProposal = ({ onRefresh, proposalId = null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editId = proposalId || id;
  const isEdit = Boolean(editId);

  const [formData, setFormData] = useState({
    proposalType: 'Settlement',
    accountNumber: '',
    customerId: '',
    customerName: '',
    totalOutstanding: 0,
    principalOutstanding: 0,
    proposedAmount: 0,
    waiverAmount: 0,
    waiverPercentage: 0,
    numberOfInstallments: 2,
    installments: []
  });

  const [loading, setLoading] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [accountLock, setAccountLock] = useState({ open: false, lockInfo: null });
  const [proposalBlocked, setProposalBlocked] = useState({ open: false, reason: '', accountStatus: '' });

  // Fetch proposal data if in edit mode
  useEffect(() => {
    if (isEdit) {
      fetchProposal();
    }
  }, [editId]);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      const response = await SettlementService.getProposalById(editId);
      const proposal = response.proposal || response;
      
      setFormData({
        proposalType: proposal.proposalType || 'Settlement',
        accountNumber: proposal.accountNumber || '',
        customerId: proposal.customerId?._id || proposal.customerId || '',
        customerName: proposal.customerName || '',
        totalOutstanding: proposal.totalOutstanding || 0,
        principalOutstanding: proposal.principalOutstanding || 0,
        proposedAmount: proposal.proposedAmount || 0,
        waiverAmount: proposal.waiverAmount || 0,
        waiverPercentage: proposal.waiverPercentage || 0,
        numberOfInstallments: proposal.numberOfInstallments || 2,
        installments: proposal.installments || []
      });
    } catch (err) {
      console.error('Error fetching proposal:', err);
      setSnackbar({ open: true, message: 'Failed to load proposal data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-populate customer data when account number changes
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (formData.accountNumber && formData.accountNumber.length >= 3) {
        try {
          setSearchingCustomer(true);
          
          // First check if account is locked
          const lockCheck = await SettlementService.checkAccountLock(formData.accountNumber);
          
          if (lockCheck.locked) {
            // Account is locked, show modal
            setAccountLock({ 
              open: true, 
              lockInfo: {
                reason: lockCheck.reason,
                letterId: lockCheck.letterId,
                status: lockCheck.status,
                proposalType: lockCheck.proposalType,
                lockDate: lockCheck.lockDate
              }
            });
            
            // Clear form data
            setFormData(prev => ({
              ...prev,
              customerId: '',
              customerName: '',
              totalOutstanding: 0,
              principalOutstanding: 0
            }));
            setSearchingCustomer(false);
            return;
          }

          // If not locked, proceed to fetch customer
          const customer = await CustomerService.getCustomerByLoanId(formData.accountNumber);
          
          if (customer) {
            // **VALIDATION: Check if account is already closed or settled**
            const accountStatus = customer.status || customer.accountStatus || '';
            const statusLower = accountStatus.toLowerCase();
            
            // Block proposal if account is CLOSED or SETTLED
            if (statusLower.includes('closed') || statusLower === 'closed ✓' ||
                statusLower.includes('settlement done') || statusLower.includes('settled') || statusLower === 'settlement done ✓') {
              
              let reason = '';
              if (statusLower.includes('closed') || statusLower === 'closed ✓') {
                reason = 'This account is already closed. No new proposal can be created.';
              } else if (statusLower.includes('settlement done') || statusLower.includes('settled') || statusLower === 'settlement done ✓') {
                reason = 'This account has already been settled. No new proposal can be created.';
              }
              
              // Show blocked modal
              setProposalBlocked({
                open: true,
                reason: reason,
                accountStatus: accountStatus
              });
              
              // Clear form data
              setFormData(prev => ({
                ...prev,
                accountNumber: '',
                customerId: '',
                customerName: '',
                totalOutstanding: 0,
                principalOutstanding: 0
              }));
              
              setSearchingCustomer(false);
              return;
            }
            
            // Auto-populate all available fields
            const totalOut = customer.totalOutstanding || 0;
            const proposed = formData.proposedAmount || 0;
            const waiverAmt = totalOut - proposed;
            const waiverPct = totalOut > 0 ? ((waiverAmt / totalOut) * 100).toFixed(2) : 0;

            setFormData(prev => ({
              ...prev,
              customerId: customer._id || customer.id || '',
              customerName: customer.accountName || '',
              totalOutstanding: totalOut,
              principalOutstanding: customer.principalOutstanding || 0,
              waiverAmount: waiverAmt,
              waiverPercentage: waiverPct
            }));

            setSnackbar({ open: true, message: 'Customer data loaded successfully!', severity: 'success' });
          } else {
            // Clear customer data if not found
            setFormData(prev => ({
              ...prev,
              customerId: '',
              customerName: '',
              totalOutstanding: 0,
              principalOutstanding: 0
            }));
            setSnackbar({ open: true, message: 'Customer not found for this account number', severity: 'warning' });
          }
        } catch (error) {
          console.error('Error fetching customer:', error);
          // Clear customer data on error
          setFormData(prev => ({
            ...prev,
            customerId: '',
            customerName: '',
            totalOutstanding: 0,
            principalOutstanding: 0
          }));
          setSnackbar({ 
            open: true, 
            message: error.response?.data?.message || 'Error fetching customer details. Please verify the account number.', 
            severity: 'error' 
          });
        } finally {
          setSearchingCustomer(false);
        }
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(() => {
      fetchCustomerData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.accountNumber]);

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };

    // Auto-calculate waiver when proposed amount or total outstanding changes
    if (field === 'totalOutstanding' || field === 'proposedAmount') {
      const totalOut = parseFloat(newFormData.totalOutstanding) || 0;
      const proposed = parseFloat(newFormData.proposedAmount) || 0;
      newFormData.waiverAmount = totalOut - proposed;
      newFormData.waiverPercentage = totalOut > 0 ? ((newFormData.waiverAmount / totalOut) * 100).toFixed(2) : 0;
    }

    setFormData(newFormData);
  };

  const generateInstallments = () => {
    const installments = [];
    const installmentAmount = formData.proposedAmount / formData.numberOfInstallments;
    
    for (let i = 1; i <= formData.numberOfInstallments; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      
      installments.push({
        installmentNumber: i,
        amount: parseFloat(installmentAmount.toFixed(2)),
        dueDate: dueDate.toISOString().split('T')[0]
      });
    }
    
    setFormData({ ...formData, installments });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.accountNumber) {
      setSnackbar({ open: true, message: 'Please enter account number', severity: 'warning' });
      return;
    }
    if (!formData.proposedAmount || formData.proposedAmount <= 0) {
      setSnackbar({ open: true, message: 'Please enter valid proposed amount', severity: 'warning' });
      return;
    }
    if (!formData.customerId) {
      setSnackbar({ open: true, message: 'Customer not found. Please search for a valid account number', severity: 'warning' });
      return;
    }
    if (!formData.numberOfInstallments || formData.numberOfInstallments < 1) {
      setSnackbar({ open: true, message: 'Please enter number of installments', severity: 'warning' });
      return;
    }
    if (!formData.installments || formData.installments.length === 0) {
      setSnackbar({ open: true, message: 'Please generate installments before submitting', severity: 'warning' });
      return;
    }

    try {
      setLoading(true);
      
      console.log('Submitting proposal with data:', formData);
      
      let response;
      
      if (isEdit) {
        // Update existing proposal
        response = await SettlementService.updateProposal(editId, formData);
        setSnackbar({ open: true, message: `Proposal ${response.proposal?.letterId || ''} updated successfully!`, severity: 'success' });
      } else {
        // Create new proposal
        response = await SettlementService.createProposal(formData);
        console.log('Proposal created:', response);
        setSnackbar({ open: true, message: `Proposal created successfully! Letter ID: ${response.proposal?.letterId || ''}`, severity: 'success' });
        
        // Reset form after create
        setTimeout(() => {
          resetForm();
        }, 2000);
      }
      
      // Refresh parent component if callback provided
      if (onRefresh) {
        setTimeout(() => onRefresh(), 1000);
      }
      
      // Navigate back to proposals list after a delay
      if (isEdit && navigate) {
        setTimeout(() => navigate('/settlements'), 2000);
      }
      
    } catch (error) {
      console.error('Error saving proposal:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || (isEdit ? 'Error updating proposal' : 'Error creating proposal');
      setSnackbar({ open: true, message: errorMsg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      proposalType: 'Settlement',
      accountNumber: '',
      customerId: '',
      customerName: '',
      totalOutstanding: 0,
      principalOutstanding: 0,
      proposedAmount: 0,
      waiverAmount: 0,
      waiverPercentage: 0,
      numberOfInstallments: 2,
      installments: []
    });
  };

  return (
    <Box sx={{ p: 2, width: '100%', height: '100%' }}>
    <Paper sx={{ 
      p: { xs: 2, sm: 2, md: 3 }, 
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3, 
        gap: 2,
        pb: 2,
        borderBottom: '2px solid #e0e0e0'
      }}>
        {isEdit && (
          <IconButton 
            onClick={() => navigate ? navigate('/settlements') : window.history.back()} 
            sx={{ 
              color: '#1A237E',
              '&:hover': { backgroundColor: 'rgba(26, 35, 126, 0.08)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1A237E', mb: 0.5 }}>
            {isEdit ? 'Edit Settlement/Closure Proposal' : 'New Settlement/Closure Proposal'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#1A237E' }}>
            {isEdit ? 'Update proposal details and installment schedule' : 'Create a new settlement or closure proposal for customer account'}
          </Typography>
        </Box>
        {isEdit && formData.accountNumber && (
          <Chip 
            label={`Account: ${formData.accountNumber}`} 
            sx={{
              backgroundColor: '#E3F2FD',
              color: '#1976D2',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          />
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Proposal Type */}
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontSize: '15px', fontWeight: 500, color: '#1A237E' }}>Proposal Type *</InputLabel>
            <Select
              value={formData.proposalType}
              onChange={(e) => handleChange('proposalType', e.target.value)}
              label="Proposal Type *"
              sx={{ fontSize: '15px', color: '#1A237E' }}
            >
              <MenuItem value="Settlement" sx={{ fontSize: '15px', color: '#1A237E' }}>Settlement</MenuItem>
              <MenuItem value="Closure" sx={{ fontSize: '15px', color: '#1A237E' }}>Closure</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Account Number */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Account Number *"
            value={formData.accountNumber}
            onChange={(e) => handleChange('accountNumber', e.target.value)}
            placeholder="Enter account number..."
            InputLabelProps={{ sx: { fontSize: '15px', fontWeight: 500, color: '#1A237E' } }}
            InputProps={{ sx: { fontSize: '15px', color: '#1A237E' } }}
          />
        </Grid>

        {/* Customer Name */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Customer Name"
            value={formData.customerName}
            InputProps={{ 
              readOnly: true,
              sx: { fontSize: '15px', color: '#1A237E' }
            }}
            InputLabelProps={{ sx: { fontSize: '15px', fontWeight: 500, color: '#1A237E' } }}
            sx={{ backgroundColor: '#F5F5F5' }}
          />
        </Grid>

        {/* Total Outstanding and Principal Outstanding */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Total Outstanding"
            type="number"
            value={formData.totalOutstanding}
            InputProps={{ 
              readOnly: true,
              startAdornment: <Typography sx={{ mr: 1, fontSize: '15px', color: '#1A237E' }}>₹</Typography>,
              sx: { fontSize: '15px', color: '#1A237E' }
            }}
            InputLabelProps={{ sx: { fontSize: '15px', fontWeight: 500, color: '#1A237E' } }}
            sx={{ backgroundColor: '#F5F5F5' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Principal Outstanding"
            type="number"
            value={formData.principalOutstanding}
            InputProps={{ 
              readOnly: true,
              startAdornment: <Typography sx={{ mr: 1, fontSize: '15px', color: '#1A237E' }}>₹</Typography>,
              sx: { fontSize: '15px', color: '#1A237E' }
            }}
            InputLabelProps={{ sx: { fontSize: '15px', fontWeight: 500, color: '#1A237E' } }}
            sx={{ backgroundColor: '#F5F5F5' }}
          />
        </Grid>

        {/* Settlement Proposal - 3 columns */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Proposed Settlement Amount *"
            type="number"
            value={formData.proposedAmount}
            onChange={(e) => handleChange('proposedAmount', e.target.value)}
            InputProps={{ 
              startAdornment: <Typography sx={{ mr: 1, fontSize: '15px', color: '#1A237E' }}>₹</Typography>,
              sx: { fontSize: '15px', color: '#1A237E' }
            }}
            InputLabelProps={{ sx: { fontSize: '15px', fontWeight: 500, color: '#1A237E' } }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Waiver Amount"
            type="number"
            value={formData.waiverAmount}
            InputProps={{ 
              readOnly: true,
              startAdornment: <Typography sx={{ mr: 1, fontSize: '15px', color: '#1A237E' }}>₹</Typography>,
              sx: { fontSize: '15px', color: '#1A237E' }
            }}
            InputLabelProps={{ sx: { fontSize: '15px', fontWeight: 500, color: '#1A237E' } }}
            sx={{ backgroundColor: '#FFF3E0' }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Waiver Percentage"
            value={`${formData.waiverPercentage}%`}
            InputProps={{ 
              readOnly: true,
              sx: { fontSize: '15px', color: '#1A237E' }
            }}
            InputLabelProps={{ sx: { fontSize: '15px', fontWeight: 500, color: '#1A237E' } }}
            sx={{ backgroundColor: '#FFF3E0' }}
          />
        </Grid>

        {/* Number of Installments */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Number of Installments (1-10) *"
            type="number"
            value={formData.numberOfInstallments}
            onChange={(e) => {
              const value = Math.min(10, Math.max(1, parseInt(e.target.value) || 1));
              handleChange('numberOfInstallments', value);
              // Auto-generate installments when number changes
              if (formData.proposedAmount > 0) {
                const installments = [];
                const installmentAmount = formData.proposedAmount / value;
                
                for (let i = 1; i <= value; i++) {
                  const dueDate = new Date();
                  dueDate.setMonth(dueDate.getMonth() + i);
                  
                  installments.push({
                    installmentNumber: i,
                    amount: parseFloat(installmentAmount.toFixed(2)),
                    dueDate: dueDate.toISOString().split('T')[0]
                  });
                }
                
                setFormData(prev => ({ ...prev, numberOfInstallments: value, installments }));
              }
            }}
            InputLabelProps={{ sx: { fontSize: '15px', fontWeight: 500, color: '#1A237E' } }}
            InputProps={{ sx: { fontSize: '15px', color: '#1A237E' } }}
            inputProps={{ min: 1, max: 10 }}
            helperText="Note: Any value between 1 and 10"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#1A237E',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1A237E',
                }
              },
              '& .MuiFormHelperText-root': {
                color: '#1A237E'
              }
            }}
          />
        </Grid>

        {/* Installments Table */}
        {formData.installments.length > 0 && (
          <Grid item xs={12}>
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1A237E', mb: 1 }}>
                Installment Schedule
              </Typography>
              <Typography variant="body2" sx={{ color: '#1A237E' }}>
                Configure payment amounts and due dates for each installment
              </Typography>
            </Box>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)', color: '#1A237E', fontWeight: 600, fontSize: '15px' }}>Installment #</TableCell>
                    <TableCell sx={{ background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)', color: '#1A237E', fontWeight: 600, fontSize: '15px' }}>Amount *</TableCell>
                    <TableCell sx={{ background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)', color: '#1A237E', fontWeight: 600, fontSize: '15px' }}>Payment Date *</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.installments.map((inst, index) => (
                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.05)' } }}>
                      <TableCell sx={{ fontSize: '15px', fontWeight: 500, color: '#1A237E' }}>Installment {inst.installmentNumber}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={inst.amount}
                          onChange={(e) => {
                            const newInstallments = [...formData.installments];
                            newInstallments[index].amount = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, installments: newInstallments });
                          }}
                          InputProps={{ 
                            startAdornment: <Typography sx={{ mr: 0.5, fontSize: '15px', color: '#1A237E' }}>₹</Typography>,
                            sx: { fontSize: '15px', color: '#1A237E' }
                          }}
                          sx={{ width: '150px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          size="small"
                          value={inst.dueDate}
                          onChange={(e) => {
                            const newInstallments = [...formData.installments];
                            newInstallments[index].dueDate = e.target.value;
                            setFormData({ ...formData, installments: newInstallments });
                          }}
                          InputProps={{ sx: { fontSize: '15px', color: '#1A237E' } }}
                          sx={{ width: '160px' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        )}

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !formData.accountNumber || !formData.proposedAmount}
              startIcon={loading ? <CircularProgress size={20} sx={{ color: '#1A237E' }} /> : null}
              sx={{ 
                background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)',
                color: '#1A237E',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #FB8C00 0%, #FFAB40 100%)',
                  boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)'
                },
                textTransform: 'none',
                px: 3,
                py: 1,
                fontWeight: 600,
                fontSize: '15px',
                borderRadius: 2,
                boxShadow: 'none'
              }}
            >
              {isEdit ? 'Update Proposal' : 'Submit Proposal'}
            </Button>
            <Button
              variant="outlined"
              onClick={resetForm}
              sx={{ 
                color: '#1A237E',
                borderColor: '#1A237E',
                '&:hover': { 
                  borderColor: '#1A237E',
                  backgroundColor: 'rgba(26, 35, 126, 0.04)'
                },
                textTransform: 'none',
                px: 3,
                py: 1,
                fontWeight: 600,
                fontSize: '15px',
                borderRadius: 2
              }}
            >
              Reset
            </Button>
            <Button
              variant="text"
              onClick={() => window.history.back()}
              sx={{ 
                color: '#1A237E',
                textTransform: 'none',
                px: 3,
                py: 1,
                fontSize: '15px',
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <AccountLockModal 
        open={accountLock.open}
        onClose={() => setAccountLock({ open: false, lockInfo: null })}
        lockInfo={accountLock.lockInfo}
      />

      <ProposalBlockedModal
        open={proposalBlocked.open}
        onClose={() => {
          setProposalBlocked({ open: false, reason: '', accountStatus: '' });
          // Optionally navigate away or clear form
          resetForm();
        }}
        reason={proposalBlocked.reason}
        accountStatus={proposalBlocked.accountStatus}
      />
    </Paper>
    </Box>
  );
};

export default NewProposal;
