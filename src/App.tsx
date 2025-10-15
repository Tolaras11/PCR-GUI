import { useState, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, Container, CssBaseline, Divider, IconButton, Typography, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { getTheme } from './theme';
import { SerialControl } from './components/SerialControl';
import { FirmwareUpgrade } from './components/FirmwareUpgrade';
import { DataTabs } from './components/DataTabs';
import { SettingsTabs } from './components/SettingsTabs';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  const theme = useMemo(() => getTheme(darkMode ? 'dark' : 'light'), [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h3" component="h1" gutterBottom>
                EasyPCR
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                PCR Control Interface
              </Typography>
            </Box>

            <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                onClick={toggleDarkMode}
                color="inherit"
                sx={{ position: 'absolute', right: 0, top: 8 }}
              >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '480px 1fr' },
              gap: 2,
              minHeight: '800px',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <SerialControl />
              <FirmwareUpgrade />
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <SettingsTabs />
              </Box>
            </Box>

            <Box sx={{ minHeight: 0 }}>
              <DataTabs />
            </Box>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              EasyPCR Web Application v1.0.0 | Web Serial API Required (Chrome/Edge/Opera)
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
