import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from '../context/ThemeContext';

// Mock du hook useTheme
jest.mock('../context/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useTheme: () => ({
    theme: 'light',
    toggleTheme: jest.fn(),
  }),
}));

describe('ThemeToggle', () => {
  it('renders correctly in light mode', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    // Vérifie que l'icône de lune est présente en mode clair
    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    const mockToggleTheme = jest.fn();
    
    // Remplace temporairement l'implémentation du hook useTheme
    jest.spyOn(require('../context/ThemeContext'), 'useTheme').mockImplementation(() => ({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    }));

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    
    // Clique sur le bouton de bascule
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    // Vérifie que toggleTheme a été appelé
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});