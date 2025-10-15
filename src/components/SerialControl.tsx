import React, { useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSerialStore } from '../stores/serialStore';
import { useLogStore } from '../stores/logStore';
import { serialService } from '../services/serialService';

export const SerialControl: React.FC = () => {
  const {
    isConnected,
    selectedPort,
    baudRate,
    status,
    statusColor,
    availablePorts,
    setPort,
    setIsConnected,
    setSelectedPort,
    setStatus,
    setAvailablePorts,
  } = useSerialStore();

  const addLog = useLogStore((state) => state.addLog);

  useEffect(() => {
    // Check browser support
    if (!serialService.isSupported()) {
      setStatus('Web Serial API not supported', 'error');
      addLog('Web Serial API not supported in this browser', 'error');
    }
  }, [setStatus, addLog]);

  const handleRefreshPorts = async () => {
    try {
      const ports = await serialService.getAvailablePorts();
      const portNames = ports.map((_, index) => `Port ${index + 1}`);
      setAvailablePorts(portNames);
      addLog(`Found ${ports.length} port(s)`, 'info');
    } catch (error) {
      addLog(`Error refreshing ports: ${error}`, 'error');
    }
  };

  const handleConnect = async () => {
    try {
      // Request port from user
      const port = await serialService.requestPort();

      // Connect to port
      await serialService.connect(port, baudRate);

      setPort(port);
      setIsConnected(true);
      setStatus(`Connected @ ${baudRate} Bd`, 'success');
      addLog(`Connected to serial port at ${baudRate} baud`, 'success');

      // Set up data callback
      serialService.onData((data) => {
        // This will be handled by TemperaturePlot component
        console.log('Serial data:', data);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`Error: ${message}`, 'error');
      addLog(`Connection error: ${message}`, 'error');
    }
  };

  const handleDisconnect = async () => {
    try {
      await serialService.disconnect();
      setPort(null);
      setIsConnected(false);
      setStatus('Disconnected', 'error');
      addLog('Disconnected from serial port', 'info');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Disconnect error: ${message}`, 'error');
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Serial Communication Settings
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Port Selection */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl fullWidth size="small" disabled={isConnected}>
            <InputLabel>COM Port</InputLabel>
            <Select
              value={selectedPort}
              label="COM Port"
              onChange={(e) => setSelectedPort(e.target.value)}
            >
              {availablePorts.length === 0 ? (
                <MenuItem value="" disabled>
                  No ports available
                </MenuItem>
              ) : (
                availablePorts.map((port) => (
                  <MenuItem key={port} value={port}>
                    {port}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            onClick={handleRefreshPorts}
            disabled={isConnected}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>

        {/* Baud Rate Info */}
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Baud Rate: 115200 (fixed)
        </Typography>

        {/* Connect/Disconnect Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConnect}
            disabled={isConnected}
            fullWidth
          >
            Connect
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={handleDisconnect}
            disabled={!isConnected}
            fullWidth
          >
            Disconnect
          </Button>
        </Box>

        {/* Status Display */}
        <Alert severity={statusColor === 'success' ? 'success' : 'error'}>
          Status: {status}
        </Alert>
      </Box>
    </Paper>
  );
};
