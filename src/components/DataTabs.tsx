import React, { useState } from 'react';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TerminalIcon from '@mui/icons-material/Terminal';
import { TemperaturePlot } from './TemperaturePlot';
import { SerialIO } from './SerialIO';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ height: '100%', display: value === index ? 'flex' : 'none', flexDirection: 'column' }}
    >
      {value === index && <Box sx={{ flex: 1, minHeight: 0 }}>{children}</Box>}
    </Box>
  );
};

export const DataTabs: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab icon={<ShowChartIcon />} label="Temperature Plot" iconPosition="start" />
          <Tab icon={<TerminalIcon />} label="Serial I/O" iconPosition="start" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <TabPanel value={currentTab} index={0}>
          <TemperaturePlot />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <SerialIO />
        </TabPanel>
      </Box>
    </Paper>
  );
};
