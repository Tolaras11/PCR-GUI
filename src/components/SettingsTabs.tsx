import React, { useState } from 'react';
import { Box, Paper, Tab, Tabs } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import { PCRSettings } from './PCRSettings';
import { LogDisplay } from './LogDisplay';

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
      {value === index && <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{children}</Box>}
    </Box>
  );
};

export const SettingsTabs: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab icon={<SettingsIcon />} label="PCR Settings" iconPosition="start" />
          <Tab icon={<DescriptionIcon />} label="Log" iconPosition="start" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <TabPanel value={currentTab} index={0}>
          <PCRSettings />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <LogDisplay />
        </TabPanel>
      </Box>
    </Paper>
  );
};
