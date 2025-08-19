import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '../context/ThemeContext';
import { azureTheme } from '../pages/rbac_system/styles/AzureTheme';
import { azureDarkTheme } from '../pages/rbac_system/styles/AzureDarkTheme';
import { useTheme } from '../context/ThemeContext';

interface AppThemeProviderProps {
  children: React.ReactNode;
}

// Wrapper component that uses the theme context
const MuiThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  
  // Select the appropriate MUI theme based on the current theme context
  const currentTheme = theme === 'dark' ? azureDarkTheme : azureTheme;

  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

// Main theme provider that combines both context providers
const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <MuiThemeWrapper>
        {children}
      </MuiThemeWrapper>
    </ThemeProvider>
  );
};

export default AppThemeProvider;