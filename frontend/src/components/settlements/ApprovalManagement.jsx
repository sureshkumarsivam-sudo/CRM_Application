import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from '@mui/material';
import { CheckCircle, Cancel, Payment as PaymentIcon } from '@mui/icons-material';
import SettlementService from '../../services/SettlementService';
import PaymentMonitoring from './PaymentMonitoring';

const ApprovalManagement = ({ onRefresh }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [comments, setComments] = useState('');
  const [approvalAction, setApprovalAction] = useState(null);
  
  // Payment Monitoring will be in its own tab (index 3)
  const showPaymentMonitoring = activeTab === 3;

  useEffect(() => {
    loadPendingApprovals();
  }, [activeTab]);

  const loadPendingApprovals = async () => {
    try {
      const level = activeTab === 0 ? 'L1' : 'L2';
      const data = await SettlementService.getPendingApprovals(level);
      setProposals(data || []);
    } catch (error) {
      console.error('Error loading pending approvals:', error);
    }
  };

  const handleApprove = (proposal, approved) => {
    setSelectedProposal(proposal);
    setApprovalAction(approved);
    setApprovalDialog(true);
  };

  const submitApproval = async () => {
    try {
      const level = activeTab === 0 ? 'L1' : 'L2';
      if (level === 'L1') {
        await SettlementService.approveL1(selectedProposal._id, approvalAction, comments, 'Manager L1');
      } else {
        await SettlementService.approveL2(selectedProposal._id, approvalAction, comments, 'Manager L2');
      }
      
      setApprovalDialog(false);
      setComments('');
      loadPendingApprovals();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error submitting approval:', error);
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        {showPaymentMonitoring ? 'Payment Monitoring' : 'Approval Management'}
      </Typography>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label={`Pending L1 (${proposals.length})`} />
        <Tab label="Pending L2" />
        <Tab label="History" />
        <Tab 
          label="Payment Monitoring" 
          icon={<PaymentIcon />}
          iconPosition="start"
          sx={{ 
            color: activeTab === 3 ? '#1976D2' : 'inherit',
            fontWeight: activeTab === 3 ? 700 : 400
          }}
        />
      </Tabs>

      {showPaymentMonitoring ? (
        <PaymentMonitoring />
      ) : (
        <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>Letter ID</TableCell>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>Customer</TableCell>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>Proposed Amount</TableCell>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>Waiver %</TableCell>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>Submitted Date</TableCell>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {proposals.map((proposal) => (
              <TableRow key={proposal._id} hover>
                <TableCell sx={{ color: '#FFAB40', fontWeight: 600 }}>{proposal.letterId}</TableCell>
                <TableCell>{proposal.customerName}</TableCell>
                <TableCell>
                  <Chip label={proposal.proposalType} size="small" />
                </TableCell>
                <TableCell>{SettlementService.formatCurrency(proposal.proposedAmount)}</TableCell>
                <TableCell>{proposal.waiverPercentage}%</TableCell>
                <TableCell>{SettlementService.formatDate(proposal.proposalDate)}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => handleApprove(proposal, true)}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => handleApprove(proposal, false)}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {approvalAction ? 'Approve' : 'Reject'} Proposal
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button 
            onClick={submitApproval} 
            variant="contained"
            color={approvalAction ? 'success' : 'error'}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ApprovalManagement;
