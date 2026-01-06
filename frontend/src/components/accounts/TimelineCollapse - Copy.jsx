import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import FeedbackService from '../../services/FeedbackService';

const TimelineCollapse = ({ customerId, loanId, onRefresh, onEditFeedback }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  useEffect(() => {
    if (expanded && customerId) {
      fetchFeedback();
    }
  }, [expanded, customerId]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await FeedbackService.getFeedbackByCustomerId(customerId);
      setFeedbackHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedback) => {
    if (onEditFeedback) {
      onEditFeedback(feedback);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (statusCode) => {
    const colorMap = {
      'NC': '#9E9E9E',
      'RNR': '#FF9800',
      'CB': '#FFC107',
      'PDC': '#4CAF50',
      'PTP': '#8BC34A',
      'NI': '#F44336',
      'SETTLEMENT': '#2196F3',
      'PAYMENT': '#4CAF50',
      'FIELD_VISIT': '#9C27B0',
      'BROKEN_PTP': '#F44336',
      'LEGAL': '#D32F2F',
      'OTHER': '#607D8B'
    };
    return colorMap[statusCode] || '#757575';
  };

  return (
    <Paper 
      sx={{ 
        mb: 3, 
        borderRadius: '15px',
        border: '2px solid #FFA500',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(255, 107, 53, 0.15)'
      }}
    >
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8D6 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': { backgroundColor: '#FFE8D6' }
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon sx={{ color: '#FF6B35' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: '#FF6B35'
            }}
          >
            Feedback History
          </Typography>
          {feedbackHistory.length > 0 && !expanded && (
            <Chip 
              label={feedbackHistory.length} 
              size="small" 
              sx={{ 
                backgroundColor: '#FF6B35',
                color: 'white',
                fontWeight: 'bold'
              }} 
            />
          )}
        </Box>
        <IconButton sx={{ color: '#FF6B35' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress sx={{ color: '#FF6B35' }} />
            </Box>
          ) : feedbackHistory.length === 0 ? (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ textAlign: 'center', p: 3 }}
            >
              No feedback history available
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                      Date & Time
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                      Activity Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                      Remarks
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#FF6B35' }}>
                      Created By
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#FF6B35' }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feedbackHistory.map((feedback, index) => (
                    <TableRow 
                      key={feedback._id || index}
                      sx={{ 
                        '&:hover': { backgroundColor: '#f9f9f9' },
                        '&:nth-of-type(odd)': { backgroundColor: '#fafafa' }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(feedback.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {feedback.activityType || 'Feedback'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={feedback.statusLabel || feedback.statusCode}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(feedback.statusCode),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {feedback.remarks}
                        </Typography>
                        {feedback.followUpDate && (
                          <Typography variant="caption" color="text.secondary">
                            Follow-up: {new Date(feedback.followUpDate).toLocaleDateString()}
                          </Typography>
                        )}
                        {feedback.promiseAmount && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Amount: ₹{feedback.promiseAmount.toLocaleString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {feedback.createdBy}
                        </Typography>
                        {feedback.userRole && (
                          <Typography variant="caption" color="text.secondary">
                            ({feedback.userRole})
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(feedback)}
                          sx={{
                            color: '#FF6B35',
                            '&:hover': {
                              backgroundColor: 'rgba(44, 140, 153, 0.1)'
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default TimelineCollapse;

