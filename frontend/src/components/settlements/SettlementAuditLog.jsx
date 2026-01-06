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
} from '@mui/material';
import { FileDownload } from '@mui/icons-material';
import SettlementService from '../../services/SettlementService';

const SettlementAuditLog = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await SettlementService.getAllAuditLogs({ limit: 100 });
      setAuditLogs(data.logs || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await SettlementService.exportAuditLogs();
    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 2, md: 3 }, width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Audit Log
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={handleExport}
          sx={{ bordercolor: '#FFAB40', color: '#FFAB40' }}
        >
          Export Log
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#F5F5F5' }}>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>Timestamp</TableCell>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>Action</TableCell>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>Proposal ID</TableCell>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>User</TableCell>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontSize: '16px', fontWeight: 600 }}>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogs.map((log) => (
              <TableRow key={log._id} hover>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <Chip label={log.action} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell sx={{ color: '#FFAB40', fontWeight: 600 }}>
                  {log.letterId}
                </TableCell>
                <TableCell>{log.user.name}</TableCell>
                <TableCell>{log.user.role}</TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {auditLogs.length === 0 && !loading && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No audit logs found
        </Typography>
      )}
    </Paper>
  );
};

export default SettlementAuditLog;
