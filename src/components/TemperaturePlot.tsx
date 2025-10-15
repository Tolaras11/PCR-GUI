import React, { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTemperatureStore } from '../stores/temperatureStore';
import { useSerialStore } from '../stores/serialStore';
import { serialService } from '../services/serialService';

// Regex patterns for parsing temperature data
const PELTIER_REGEX = /Peltier>\s*T:([+-]?\d+(?:\.\d+)?)\*C;/;
const LID_REGEX = /Lid>\s*T:([+-]?\d+(?:\.\d+)?)\*C;/;

export const TemperaturePlot: React.FC = () => {
  const { data, addDataPoint, setIsParsing } = useTemperatureStore();
  const isConnected = useSerialStore((state) => state.isConnected);
  const bufferRef = useRef<string>('');

  useEffect(() => {
    if (!isConnected) {
      return;
    }

    setIsParsing(true);

    // Set up serial data callback
    const handleSerialData = (chunk: string) => {
      bufferRef.current += chunk;

      // Process complete lines
      const lines = bufferRef.current.split('\n');
      bufferRef.current = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Try to parse temperature data
        const peltierMatch = trimmedLine.match(PELTIER_REGEX);
        const lidMatch = trimmedLine.match(LID_REGEX);

        if (peltierMatch && lidMatch) {
          try {
            const peltierTemp = parseFloat(peltierMatch[1]);
            const lidTemp = parseFloat(lidMatch[1]);

            if (!isNaN(peltierTemp) && !isNaN(lidTemp)) {
              addDataPoint(peltierTemp, lidTemp);
            }
          } catch (error) {
            console.error('Error parsing temperature:', error);
          }
        }
      }
    };

    serialService.onData(handleSerialData);

    return () => {
      setIsParsing(false);
      bufferRef.current = '';
    };
  }, [isConnected, addDataPoint, setIsParsing]);

  // Calculate axis ranges
  const minTemp = data.length > 0
    ? Math.min(...data.map((d) => Math.min(d.peltier, d.lid))) - 5
    : 0;

  const maxTemp = data.length > 0
    ? Math.max(...data.map((d) => Math.max(d.peltier, d.lid))) + 5
    : 100;

  return (
    <Box sx={{ p: 2, height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            domain={[minTemp, maxTemp]}
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(1)}°C`}
            labelFormatter={(label) => `Time: ${label}s`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="peltier"
            stroke="#1976d2"
            strokeWidth={2}
            dot={false}
            name="Peltier Temp"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="lid"
            stroke="#d32f2f"
            strokeWidth={2}
            dot={false}
            name="Lid Temp"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {!isConnected && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <Typography color="text.secondary">
            Connect to serial port to view temperature data
          </Typography>
        </Box>
      )}
    </Box>
  );
};
