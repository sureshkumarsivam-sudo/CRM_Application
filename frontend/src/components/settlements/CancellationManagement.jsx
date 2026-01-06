import React, { useState, useEffect } from 'react';
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
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { Visibility, Refresh } from '@mui/icons-material';
import CancellationService from '../../services/CancellationService';
import L1ReviewModal from './L1ReviewModal';
import AdminFinalizeModal from './AdminFinalizeModal';

const CancellationManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [pendingL1, setPendingL1] = useState([]);
  const [pendingAdmin, setPendingAdmin] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [l1ReviewModalOpen, setL1ReviewModalOpen] = useState(false);
  const [adminFinalizeModalOpen, setAdminFinalizeModalOpen] = useState(false);

  useEffect(() => {
    loadCancellations();
  }, []);

  const loadCancellations = async () => {
    setLoading(true);
    setError('');
    try {
      const [l1Data, adminData] = await Promise.all([
        CancellationService.getPendingL1Cancellations(),
        CancellationService.getPendingAdminFinalizations()
      ]);

      setPendingL1(l1Data.requests || []);
      setPendingAdmin(adminData.requests || []);
    } catch (err) {
      console.error('Error loading cancellations:', err);
      setError('Failed to load cancellation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenL1Review = (request) => {
    setSelectedRequest(request);
    setL1ReviewModalOpen(true);
  };

  const handleOpenAdminFinalize = (request) => {
    setSelectedRequest(request);
    setAdminFinalizeModalOpen(true);
  };

  const handleL1ReviewSuccess = () => {
    setL1ReviewModalOpen(false);
    setSelectedRequest(null);
    loadCancellations();
  };

  const handleAdminFinalizeSuccess = () => {
    setAdminFinalizeModalOpen(false);
    setSelectedRequest(null);
    loadCancellations();
  };

  const renderL1Queue = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ background: 'linear-gradient(135deg, #FFAB40 0%, #FFAB40 100%)' }}>
            <TableCell sx={{ color: '#1A237E', fontWeight: 700 }}>Letter #</TableCell>
            <TableCell sx={{ color: '#1A237E', fontWeight: 700 }}>Customer Name</TableCell>
            <TableCell sx={{ color: '#1A237E', fontWeight: 700 }}>Account #</TableCell>
            <TableCell sx={{ color: '#1A237E', fontWeight: 700 }}>Reason</TableCell>
            <TableCell sx={{ color: '#1A237E', fontWeight: 700 }}>Request Date</TableCell>
            <TableCell sx={{ color: '#1A237E', fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ color: '#1A237E', fontWeight: 700 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingL1.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  No pending L1 cancellation requests
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            pendingL1.map((request, index) => (
              <TableRow
                key={request._id}
                sx={{
                  backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                  '&:hover': { backgroundColor: 'rgba(255, 152, 0, 0.05)' }
                }}
              >
                <TableCell sx={{ color: '#FFAB40', fontWeight: 600 }}>
                  {request.letterId}
                </TableCell>
                <TableCell>{request.customerName}</TableCell>
                <TableCell>{request.accountNumber}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }}>
                    {request.cancellationReason}
                  </Typography>
                </TableCell>
                <TableCell>
                  {CancellationService.formatDate(request.requestedBy?.requestDate)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    size="small"
                    sx={{
                      backgroundColor: '#FFE0B2',
                      color: '#E65100',
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => handleOpenL1Review(request)}
                    sx={{
                      background: 'linear-gradient(135deg, #FFAB40 0%, #FFB74D 100%)',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #FF9800 0%, #FFAB40 100%)'
                      }
                    }}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderAdminQueue = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)' }}>
            <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>Letter #</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>Customer Name</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>Account #</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>Reason</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>L1 Approved By</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>Approval Date</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>Status</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pendingAdmin.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  No pending admin finalizations
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            pendingAdmin.map((request, index) => (
              <TableRow
                key={request._id}
                sx={{
                  backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                  '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.05)' }
                }}
              >
                <TableCell sx={{ color: '#4CAF50', fontWeight: 600 }}>
                  {request.letterId}
                </TableCell>
                <TableCell>{request.customerName}</TableCell>
                <TableCell>{request.accountNumber}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200 }}>
                    {request.cancellationReason}
                  </Typography>
                </TableCell>
                <TableCell>{request.l1Review?.reviewedBy?.name || 'N/A'}</TableCell>
                <TableCell>
                  {CancellationService.formatDate(request.l1Review?.reviewDate)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    size="small"
                    sx={{
                      backgroundColor: '#C8E6C9',
                      color: '#1B5E20',
                      fontWeight: 600
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Visibility />}
                    onClick={() => handleOpenAdminFinalize(request)}
                    sx={{
                      background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #388E3C 0%, #4CAF50 100%)'
                      }
                    }}
                  >
                    Finalize
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A237E' }}>
            Cancellation Management
          </Typography>
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={loadCancellations}
            disabled={loading}
            sx={{
              borderColor: '#FFAB40',
              color: '#FFAB40',
              '&:hover': {
                borderColor: '#FF9800',
                backgroundColor: 'rgba(255, 152, 0, 0.05)'
              }
            }}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              fontWeight: 600,
              color: '#666',
            },
            '& .Mui-selected': {
              color: '#FFAB40',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#FFAB40',
            }
          }}
        >
          <Tab 
            label={`L1 Review Queue (${pendingL1.length})`} 
            sx={{ textTransform: 'none', fontSize: '1rem' }}
          />
          <Tab 
            label={`Admin Finalization Queue (${pendingAdmin.length})`} 
            sx={{ textTransform: 'none', fontSize: '1rem' }}
          />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#FFAB40' }} />
          </Box>
        ) : (
          <>
            {activeTab === 0 && renderL1Queue()}
            {activeTab === 1 && renderAdminQueue()}
          </>
        )}
      </Paper>

      {/* L1 Review Modal */}
      {selectedRequest && (
        <L1ReviewModal
          open={l1ReviewModalOpen}
          onClose={() => setL1ReviewModalOpen(false)}
          request={selectedRequest}
          onSuccess={handleL1ReviewSuccess}
        />
      )}

      {/* Admin Finalize Modal */}
      {selectedRequest && (
        <AdminFinalizeModal
          open={adminFinalizeModalOpen}
          onClose={() => setAdminFinalizeModalOpen(false)}
          request={selectedRequest}
          onSuccess={handleAdminFinalizeSuccess}
        />
      )}
    </Box>
  );
};

export default CancellationManagement;
