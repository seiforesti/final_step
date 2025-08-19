import React from 'react';
import { IconButton, Tooltip, useTheme as useMuiTheme } from '@mui/material';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
  iconSize?: number;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  tooltipPlacement = 'bottom',
  iconSize = 20,
}) => {
  const { theme, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <Tooltip 
      title={theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}
      placement={tooltipPlacement}
    >
      <IconButton
        onClick={toggleTheme}
        size={size}
        aria-label="Changer de thème"
        sx={{
          color: muiTheme.palette.text.primary,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        }}
      >
        {theme === 'light' ? <FiMoon size={iconSize} /> : <FiSun size={iconSize} />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;