import React, { useEffect, useRef } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLogStore } from '../stores/logStore';

const LOG_COLORS_LIGHT = {
  info: '#000000',
  success: '#2e7d32',
  error: '#d32f2f',
  warning: '#ed6c02',
};

const LOG_COLORS_DARK = {
  info: '#e0e0e0',
  success: '#66bb6a',
  error: '#f44336',
  warning: '#ffa726',
};

export const LogDisplay: React.FC = () => {
  const { messages, clearLogs } = useLogStore();
  const logEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const LOG_COLORS = isDark ? LOG_COLORS_DARK : LOG_COLORS_LIGHT;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6">Log</Typography>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={clearLogs}
          startIcon={<DeleteIcon />}
        >
          Clear Log
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
          fontSize: '0.875rem',
        }}
      >
        {messages.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No log messages
          </Typography>
        ) : (
          messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                mb: 0.5,
                color: LOG_COLORS[msg.type],
                wordBreak: 'break-word',
              }}
            >
              <span style={{ color: isDark ? '#999' : '#666' }}>[{formatTimestamp(msg.timestamp)}]</span>{' '}
              {msg.message}
            </Box>
          ))
        )}
        <div ref={logEndRef} />
      </Box>
    </Box>
  );
};
