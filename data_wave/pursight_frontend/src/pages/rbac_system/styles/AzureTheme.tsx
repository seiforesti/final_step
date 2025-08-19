import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Azure-inspired theme for the RBAC system
export const azureTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0078d4', // Azure blue
      light: '#50a9ff',
      dark: '#004578',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#773adc', // Azure purple
      light: '#a67af4',
      dark: '#5c2d99',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d13438', // Azure red
      light: '#ff6b70',
      dark: '#a4262c',
    },
    warning: {
      main: '#ffaa44', // Azure orange
      light: '#ffd599',
      dark: '#d18822',
    },
    info: {
      main: '#0078d4', // Azure blue
      light: '#50a9ff',
      dark: '#004578',
    },
    success: {
      main: '#107c10', // Azure green
      light: '#5db35d',
      dark: '#054b05',
    },
    text: {
      primary: '#323130',
      secondary: '#605e5c',
      disabled: '#a19f9d',
    },
    background: {
      default: '#faf9f8',
      paper: '#ffffff',
    },
    divider: '#edebe9',
    action: {
      active: '#323130',
      hover: alpha('#0078d4', 0.04),
      selected: alpha('#0078d4', 0.12),
      disabled: '#c8c6c4',
      disabledBackground: '#f3f2f1',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '0.875rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.75rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    subtitle2: {
      fontSize: '0.75rem',
      fontWeight: 400,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.75rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '6px 20px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: '#8a8886',
          '&:hover': {
            borderColor: '#0078d4',
            backgroundColor: alpha('#0078d4', 0.04),
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '8px 16px',
          borderBottom: '1px solid #edebe9',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f3f2f1',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha('#0078d4', 0.04),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 24,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minWidth: 'auto',
          padding: '8px 16px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Common styles for RBAC pages
export const commonStyles = {
  pageContainer: {
    padding: '24px',
    maxWidth: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    margin: 0,
  },
  actionBar: {
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
    backgroundColor: alpha('#0078d4', 0.05),
    borderLeft: `4px solid #0078d4`,
  },
  warningCard: {
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: alpha('#ffaa44', 0.05),
    borderLeft: `4px solid #ffaa44`,
  },
  errorCard: {
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: alpha('#d13438', 0.05),
    borderLeft: `4px solid #d13438`,
  },
  successCard: {
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: alpha('#107c10', 0.05),
    borderLeft: `4px solid #107c10`,
  },
};