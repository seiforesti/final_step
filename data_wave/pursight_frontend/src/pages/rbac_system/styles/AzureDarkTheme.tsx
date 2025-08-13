import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Azure-inspired dark theme for the RBAC system
export const azureDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#50a9ff', // Azure blue (lighter for dark mode)
      light: '#7bc0ff',
      dark: '#0078d4',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#a67af4', // Azure purple (lighter for dark mode)
      light: '#c9a7ff',
      dark: '#773adc',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ff6b70', // Azure red (lighter for dark mode)
      light: '#ff9ea1',
      dark: '#d13438',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ffaa44', // Azure orange (lighter for dark mode)
      light: '#ffc77d',
      dark: '#ca5010',
      contrastText: '#000000',
    },
    info: {
      main: '#50e6ff', // Azure cyan (lighter for dark mode)
      light: '#89efff',
      dark: '#00b7c3',
      contrastText: '#000000',
    },
    success: {
      main: '#6ccb5f', // Azure green (lighter for dark mode)
      light: '#9ee493',
      dark: '#107c10',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
      disabled: '#6e6e6e',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '0.9rem',
      fontWeight: 400,
    },
    subtitle2: {
      fontSize: '0.8rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.8rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 2,
          padding: '6px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minWidth: 'auto',
          padding: '12px 16px',
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});

// Common styles for RBAC pages
export const rbacStyles = {
  pageContainer: {
    padding: '24px',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  searchAndFilters: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  card: {
    marginBottom: '16px',
    overflow: 'visible',
    backgroundColor: '#1e1e1e',
  },
  infoText: {
    marginTop: '16px',
    fontSize: '0.875rem',
  },
  breadcrumbs: {
    marginBottom: '16px',
  },
  tabsContainer: {
    marginBottom: '24px',
  },
  commandBar: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  infoCard: {
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: alpha('#50a9ff', 0.1),
    borderLeft: `4px solid #50a9ff`,
  },
  warningCard: {
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: alpha('#ffaa44', 0.1),
    borderLeft: `4px solid #ffaa44`,
  },
  errorCard: {
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: alpha('#ff6b70', 0.1),
    borderLeft: `4px solid #ff6b70`,
  },
  successCard: {
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: alpha('#6ccb5f', 0.1),
    borderLeft: `4px solid #6ccb5f`,
  },
};