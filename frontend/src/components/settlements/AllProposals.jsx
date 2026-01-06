import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TableSortLabel,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import { Visibility, Edit, Delete, Cancel as CancelIcon } from '@mui/icons-material';
import SettlementService from '../../services/SettlementService';
import CancellationRequestModal from './CancellationRequestModal';

const AllProposals = ({ onRefresh }) => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    proposalType: 'All',
    search: ''
  });
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState(null);
  const [orderBy, setOrderBy] = useState('proposalDate');
  const [order, setOrder] = useState('desc');
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [proposalToCancel, setProposalToCancel] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadProposals();
  }, [filters]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await SettlementService.getProposals(filters);
      setProposals(data.proposals || []);
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedProposals = React.useMemo(() => {
    const comparator = (a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle numeric fields
      if (['totalOutstanding', 'proposedAmount', 'waiverAmount', 'waiverPercentage'].includes(orderBy)) {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      // Handle date fields
      if (orderBy === 'proposalDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (bValue < aValue) {
        return order === 'asc' ? 1 : -1;
      }
      if (bValue > aValue) {
        return order === 'asc' ? -1 : 1;
      }
      return 0;
    };

    return [...proposals].sort(comparator);
  }, [proposals, order, orderBy]);

  const handleView = (proposal) => {
    setSelectedProposal(proposal);
    setViewDialog(true);
  };

  const handleEdit = (proposal) => {
    // Navigate to edit page or open edit modal
    navigate(`/settlements/edit/${proposal._id}`);
  };

  const handleDeleteClick = (proposal) => {
    setProposalToDelete(proposal);
    setDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await SettlementService.deleteProposal(proposalToDelete._id);
      setDeleteDialog(false);
      setProposalToDelete(null);
      loadProposals(); // Reload list
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting proposal:', error);
      alert('Failed to delete proposal. It may have payments or be in an active state.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog(false);
    setProposalToDelete(null);
  };

  // Handle cancellation request
  const handleCancellationClick = (proposal) => {
    setProposalToCancel(proposal);
    setCancellationModalOpen(true);
  };

  const handleCancellationSuccess = (result) => {
    setSnackbar({
      open: true,
      message: 'Cancellation request submitted successfully! Awaiting L1 Manager review.',
      severity: 'success'
    });
    loadProposals();
    if (onRefresh) onRefresh();
  };

  // Check if proposal can be edited or deleted based on status
  const canEdit = (proposal) => {
    return ['Pending L1', 'Rejected'].includes(proposal.status);
  };

  const canDelete = (proposal) => {
    return ['Pending L1', 'Rejected'].includes(proposal.status);
  };

  // Check if cancellation can be requested
  const canRequestCancellation = (proposal) => {
    return ['Pending L1', 'L1 Approved', 'Pending L2', 'Active', 'Broken Settlement'].includes(proposal.status);
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, color: '#1A237E' }}>
          All Proposals
        </Typography>
        
        <TextField
          select
          size="small"
          label="Type"
          value={filters.proposalType}
          onChange={(e) => setFilters({ ...filters, proposalType: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="All">All Types</MenuItem>
          <MenuItem value="Settlement">Settlement</MenuItem>
          <MenuItem value="Closure">Closure</MenuItem>
        </TextField>

        <TextField
          select
          size="small"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="All">All Status</MenuItem>
          <MenuItem value="Pending L1">Pending L1</MenuItem>
          <MenuItem value="Pending L2">Pending L2</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
        </TextField>

        <TextField
          size="small"
          label="Search"
          placeholder="Letter ID, Account, Customer..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          sx={{ minWidth: 250 }}
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F7FA' }}>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'letterId'}
                  direction={orderBy === 'letterId' ? order : 'asc'}
                  onClick={() => handleRequestSort('letterId')}
                >
                  Letter ID
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'proposalType'}
                  direction={orderBy === 'proposalType' ? order : 'asc'}
                  onClick={() => handleRequestSort('proposalType')}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'customerName'}
                  direction={orderBy === 'customerName' ? order : 'asc'}
                  onClick={() => handleRequestSort('customerName')}
                >
                  Customer
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'accountNumber'}
                  direction={orderBy === 'accountNumber' ? order : 'asc'}
                  onClick={() => handleRequestSort('accountNumber')}
                >
                  Account
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'totalOutstanding'}
                  direction={orderBy === 'totalOutstanding' ? order : 'asc'}
                  onClick={() => handleRequestSort('totalOutstanding')}
                >
                  Outstanding
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'proposedAmount'}
                  direction={orderBy === 'proposedAmount' ? order : 'asc'}
                  onClick={() => handleRequestSort('proposedAmount')}
                >
                  Proposed
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'waiverAmount'}
                  direction={orderBy === 'waiverAmount' ? order : 'asc'}
                  onClick={() => handleRequestSort('waiverAmount')}
                >
                  Waiver
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={orderBy === 'proposalDate'}
                  direction={orderBy === 'proposalDate' ? order : 'asc'}
                  onClick={() => handleRequestSort('proposalDate')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProposals.map((proposal) => {
              const statusColor = SettlementService.getStatusColor(proposal.status);
              const typeColor = SettlementService.getProposalTypeColor(proposal.proposalType);
              
              return (
                <TableRow key={proposal._id} hover>
                  <TableCell sx={{ color: '#FFAB40', fontWeight: 600 }}>{proposal.letterId}</TableCell>
                  <TableCell>
                    <Chip label={proposal.proposalType} size="small" sx={{ ...typeColor }} />
                  </TableCell>
                  <TableCell>{proposal.customerName}</TableCell>
                  <TableCell>{proposal.accountNumber}</TableCell>
                  <TableCell>{SettlementService.formatCurrency(proposal.totalOutstanding)}</TableCell>
                  <TableCell>{SettlementService.formatCurrency(proposal.proposedAmount)}</TableCell>
                  <TableCell>
                    {SettlementService.formatCurrency(proposal.waiverAmount)}
                    <Typography variant="caption" display="block" color="text.secondary">
                      ({proposal.waiverPercentage}%)
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={proposal.status} 
                      size="small" 
                      sx={{ 
                        backgroundColor: statusColor.bg,
                        color: statusColor.color,
                        borderLeft: `3px solid ${statusColor.border}`,
                        fontWeight: 600
                      }} 
                    />
                  </TableCell>
                  <TableCell>{SettlementService.formatDate(proposal.proposalDate)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" sx={{ color: '#FFAB40' }} onClick={() => handleView(proposal)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={canEdit(proposal) ? "Edit Proposal" : "Cannot edit (already processed)"}>
                        <span>
                          <IconButton 
                            size="small" 
                            sx={{ color: '#FFB74D' }} 
                            onClick={() => handleEdit(proposal)}
                            disabled={!canEdit(proposal)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={canRequestCancellation(proposal) ? "Request Letter Cancellation" : "Cannot cancel (already cancelled/completed/rejected)"}>
                        <span>
                          <IconButton 
                            size="small" 
                            sx={{ color: '#FF9800' }} 
                            onClick={() => handleCancellationClick(proposal)}
                            disabled={!canRequestCancellation(proposal)}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={canDelete(proposal) ? "Delete Proposal" : "Cannot delete (already processed)"}>
                        <span>
                          <IconButton 
                            size="small" 
                            sx={{ color: '#f44336' }} 
                            onClick={() => handleDeleteClick(proposal)}
                            disabled={!canDelete(proposal)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Proposal Details</DialogTitle>
        <DialogContent>
          {selectedProposal && (
            <Box>
              <Typography><strong>Letter ID:</strong> {selectedProposal.letterId}</Typography>
              <Typography><strong>Customer:</strong> {selectedProposal.customerName}</Typography>
              <Typography><strong>Account:</strong> {selectedProposal.accountNumber}</Typography>
              <Typography><strong>Proposal Type:</strong> {selectedProposal.proposalType}</Typography>
              <Typography><strong>Total Outstanding:</strong> {SettlementService.formatCurrency(selectedProposal.totalOutstanding)}</Typography>
              <Typography><strong>Proposed Amount:</strong> {SettlementService.formatCurrency(selectedProposal.proposedAmount)}</Typography>
              <Typography><strong>Waiver Amount:</strong> {SettlementService.formatCurrency(selectedProposal.waiverAmount)} ({selectedProposal.waiverPercentage}%)</Typography>
              <Typography><strong>Status:</strong> {selectedProposal.status}</Typography>
              <Typography><strong>Installments:</strong> {selectedProposal.numberOfInstallments}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Proposal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete proposal <strong>{proposalToDelete?.letterId}</strong>?
            <br />
            Customer: {proposalToDelete?.customerName}
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancellation Request Modal */}
      {proposalToCancel && (
        <CancellationRequestModal
          open={cancellationModalOpen}
          onClose={() => {
            setCancellationModalOpen(false);
            setProposalToCancel(null);
          }}
          proposal={proposalToCancel}
          onSuccess={handleCancellationSuccess}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AllProposals;
