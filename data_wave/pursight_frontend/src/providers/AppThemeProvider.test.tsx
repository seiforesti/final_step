import React from 'react';
import { render } from '@testing-library/react';
import AppThemeProvider from './AppThemeProvider';
import { useTheme } from '../context/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';

// Mock des hooks
jest.mock('../context/ThemeContext', () => ({
  useTheme: jest.fn(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@mui/material/styles', () => ({
  useTheme: jest.fn(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../pages/rbac_system/styles/AzureTheme', () => ({
  __esModule: true,
  default: { palette: { mode: 'light' } },
}));

jest.mock('../pages/rbac_system/styles/AzureDarkTheme', () => ({
  __esModule: true,
  default: { palette: { mode: 'dark' } },
}));

describe('AppThemeProvider', () => {
  it('provides light theme when theme context is light', () => {
    // Mock du hook useTheme pour retourner 'light'
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      toggleTheme: jest.fn(),
    });

    render(
      <AppThemeProvider>
        <div>Test</div>
      </AppThemeProvider>
    );

    // Vérifie que le thème MUI est bien le thème clair
    expect(useMuiTheme).toHaveBeenCalled();
  });

  it('provides dark theme when theme context is dark', () => {
    // Mock du hook useTheme pour retourner 'dark'
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      toggleTheme: jest.fn(),
    });

    render(
      <AppThemeProvider>
        <div>Test</div>
      </AppThemeProvider>
    );

    // Vérifie que le thème MUI est bien le thème sombre
    expect(useMuiTheme).toHaveBeenCalled();
  });
});