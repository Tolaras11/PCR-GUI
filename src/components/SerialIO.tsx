import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSerialStore } from '../stores/serialStore';
import { serialService } from '../services/serialService';

interface SerialMessage {
  id: string;
  timestamp: Date;
  data: string;
}

/**
 * Escape non-printable characters for display
 */
const escapeNonPrintable = (str: string): string => {
  return str.split('').map(char => {
    const code = char.charCodeAt(0);

    // Printable ASCII characters (space to tilde)
    if (code >= 32 && code <= 126) {
      return char;
    }

    // Common escape sequences
    switch (code) {
      case 9: return '\\t';   // Tab
      case 10: return '\\n';  // Line feed
      case 13: return '\\r';  // Carriage return
      case 27: return '\\e';  // Escape
      default:
        // Show as hex for other non-printable characters
        return `\\x${code.toString(16).padStart(2, '0')}`;
    }
  }).join('');
};

export const SerialIO: React.FC = () => {
  const [messages, setMessages] = useState<SerialMessage[]>([]);
  const isConnected = useSerialStore((state) => state.isConnected);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    // Set up serial data callback
    const handleSerialData = (chunk: string) => {
      const newMessage: SerialMessage = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        data: chunk,
      };

      setMessages(prev => [...prev, newMessage]);
    };

    serialService.onData(handleSerialData);

    return () => {
      // Cleanup handled by TemperaturePlot
    };
  }, [isConnected]);

  const handleClear = () => {
    setMessages([]);
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Serial I/O</Typography>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={handleClear}
          startIcon={<DeleteIcon />}
        >
          Clear
        </Button>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          p: 1,
          fontFamily: 'monospace',
          fontSize: '0.8rem',
        }}
      >
        {!isConnected ? (
          <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Not connected. Serial data will appear here when connected.
          </Typography>
        ) : messages.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No data received yet...
          </Typography>
        ) : (
          messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                mb: 0.5,
                wordBreak: 'break-all',
                whiteSpace: 'pre-wrap',
              }}
            >
              <span style={{ color: '#666' }}>[{formatTimestamp(msg.timestamp)}]</span>{' '}
              <span style={{ color: '#0a0' }}>{escapeNonPrintable(msg.data)}</span>
            </Box>
          ))
        )}
        <div ref={logEndRef} />
      </Box>

      <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
        Non-printable characters are escaped (e.g., \n, \r, \t, \xHH)
      </Typography>
    </Box>
  );
};
