import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Switch, FormControlLabel, Typography } from '@mui/material';

interface UIToggleProps {
  label?: string;
}

const UIToggle: React.FC<UIToggleProps> = ({ label = 'Use new UI' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const useNewUI = searchParams.get('newUI') === 'true';

  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParams = new URLSearchParams(location.search);
    if (event.target.checked) {
      newSearchParams.set('newUI', 'true');
    } else {
      newSearchParams.delete('newUI');
    }
    
    navigate({
      pathname: location.pathname,
      search: newSearchParams.toString()
    });
  };

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 16, 
      right: 16, 
      zIndex: 1000,
      backgroundColor: 'white',
      borderRadius: 1,
      boxShadow: 3,
      p: 1
    }}>
      <FormControlLabel
        control={
          <Switch
            checked={useNewUI}
            onChange={handleToggle}
            color="primary"
          />
        }
        label={<Typography variant="body2">{label}</Typography>}
      />
    </Box>
  );
};

export default UIToggle;