import { createTheme, PaletteMode } from '@mui/material/styles';

/**
 * MUI Theme Configuration for EasyPCR
 * Supports both light and dark modes
 */
export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#90caf9' : '#1976d2',
    },
    secondary: {
      main: mode === 'dark' ? '#f48fb1' : '#dc004e',
    },
    success: {
      main: mode === 'dark' ? '#66bb6a' : '#2e7d32',
    },
    error: {
      main: mode === 'dark' ? '#f44336' : '#d32f2f',
    },
    warning: {
      main: mode === 'dark' ? '#ffa726' : '#ed6c02',
    },
    info: {
      main: mode === 'dark' ? '#29b6f6' : '#0288d1',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f0f0f0',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
