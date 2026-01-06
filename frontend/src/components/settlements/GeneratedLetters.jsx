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
  Chip,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Email as EmailIcon,
  Print as PrintIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import SettlementService from '../../services/SettlementService';

const GeneratedLetters = () => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGeneratedLetters();
  }, []);

  const loadGeneratedLetters = async () => {
    try {
      setLoading(true);
      // Fetch proposals where letterGenerated = true
      const data = await SettlementService.getProposals({
        status: 'Active,Completed',
        letterGenerated: true
      });
      setLetters(data.proposals || []);
    } catch (error) {
      console.error('Error loading generated letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (letter) => {
    // TODO: Implement PDF download
    console.log('Download letter:', letter.letterId);
    alert(`Download functionality for ${letter.letterId} will be implemented`);
  };

  const handleEmail = (letter) => {
    // TODO: Implement email functionality
    console.log('Email letter:', letter.letterId);
    alert(`Email functionality for ${letter.letterId} will be implemented`);
  };

  const handlePrint = (letter) => {
    // TODO: Implement print functionality
    console.log('Print letter:', letter.letterId);
    alert(`Print functionality for ${letter.letterId} will be implemented`);
  };

  const handleView = (letter) => {
    // TODO: Implement view/preview functionality
    console.log('View letter:', letter.letterId);
    alert(`View functionality for ${letter.letterId} will be implemented`);
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Generated Letters
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {letters.length} letters
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundcolor: '#FFAB40' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Letter ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Type</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Customer</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Account</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Amount</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Generated Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '16px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {letters.map((letter) => {
              const typeColor = SettlementService.getProposalTypeColor(letter.proposalType);
              const statusColor = letter.status === 'Active' 
                ? { bg: '#B3E5FC', color: '#01579B' }
                : { bg: '#C8E6C9', color: '#1B5E20' };

              return (
                <TableRow key={letter._id} hover>
                  <TableCell sx={{ color: '#FFAB40', fontWeight: 600 }}>
                    {letter.letterId}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={letter.proposalType} 
                      size="small" 
                      sx={{ 
                        backgroundColor: typeColor.bg,
                        color: typeColor.color,
                        fontWeight: 600
                      }} 
                    />
                  </TableCell>
                  <TableCell>{letter.customerName}</TableCell>
                  <TableCell>{letter.accountNumber}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {SettlementService.formatCurrency(letter.proposedAmount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Waiver: {letter.waiverPercentage}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {SettlementService.formatDate(letter.letterGeneratedDate)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={letter.status} 
                      size="small" 
                      sx={{ 
                        backgroundColor: statusColor.bg,
                        color: statusColor.color,
                        fontWeight: 600
                      }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Download">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDownload(letter)}
                          sx={{ color: '#FFAB40' }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Email">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEmail(letter)}
                          sx={{ color: '#FF9800' }}
                        >
                          <EmailIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print">
                        <IconButton 
                          size="small" 
                          onClick={() => handlePrint(letter)}
                          sx={{ color: '#4CAF50' }}
                        >
                          <PrintIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View">
                        <IconButton 
                          size="small" 
                          onClick={() => handleView(letter)}
                          sx={{ color: '#2196F3' }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {letters.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No generated letters found. Letters are generated after L2 approval.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default GeneratedLetters;
