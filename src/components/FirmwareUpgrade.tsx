import { useRef } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Paper,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useFirmwareStore } from '../stores/firmwareStore';
import { useSerialStore } from '../stores/serialStore';
import { useLogStore } from '../stores/logStore';
import { ymodemService } from '../services/ymodemService';
import { hexConverter } from '../services/hexConverter';

export const FirmwareUpgrade: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    fileName,
    progress,
    status,
    isUploading,
    setFilePath,
    setFileName,
    setProgress,
    setStatus,
    setIsUploading,
  } = useFirmwareStore();

  const isConnected = useSerialStore((state) => state.isConnected);
  const addLog = useLogStore((state) => state.addLog);

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFilePath(file.name);
      addLog(`Selected: ${file.name}`, 'info');
    }
  };

  const handleStartUpgrade = async () => {
    if (!isConnected) {
      setStatus('No serial port connected');
      addLog('No serial port chosen', 'error');
      return;
    }

    if (!fileName) {
      setStatus('No file selected');
      addLog('Select .hex or .bin file', 'error');
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setStatus('Preparing...');
    addLog('Starting firmware upgrade...', 'info');

    try {
      let binaryData: Uint8Array;

      // Convert HEX to BIN if needed
      if (file.name.toLowerCase().endsWith('.hex')) {
        addLog('Converting HEX to BIN...', 'info');
        const hexContent = await file.text();
        binaryData = hexConverter.hexToBinary(hexContent);
        addLog('HEX converted to BIN', 'success');
      } else {
        // Read binary file
        const buffer = await file.arrayBuffer();
        binaryData = new Uint8Array(buffer);
      }

      // Send via YMODEM
      addLog('YMODEM: start transfer...', 'info');
      setStatus('Transferring...');

      const result = await ymodemService.sendFile(
        binaryData,
        file.name,
        (_index, _name, total, done) => {
          const percent = Math.round((done / total) * 100);
          setProgress(percent);
          setStatus(`${percent}%`);
        }
      );

      if (result.success) {
        setProgress(100);
        setStatus('Firmware uploaded OK');
        addLog('Firmware uploaded OK', 'success');
      } else {
        setStatus('Transfer failed');
        addLog(`Firmware transfer failed: ${result.error}`, 'error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus('Error occurred');
      addLog(`Firmware upgrade error: ${message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Firmware Upgrade
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* File Selection */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="File Selected"
            value={fileName}
            InputProps={{ readOnly: true }}
            placeholder="No file selected"
          />

          <Button
            variant="outlined"
            onClick={handleBrowse}
            disabled={isUploading}
            startIcon={<UploadFileIcon />}
          >
            Browse
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".hex,.bin"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </Box>

        {/* Progress Bar */}
        <Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
            {progress}%
          </Typography>
        </Box>

        {/* Upload Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartUpgrade}
          disabled={!fileName || isUploading || !isConnected}
          fullWidth
        >
          {isUploading ? 'Uploading...' : 'Start Upgrade'}
        </Button>

        {/* Status */}
        <Alert severity={status.includes('OK') ? 'success' : 'info'}>
          {status}
        </Alert>
      </Box>
    </Paper>
  );
};
