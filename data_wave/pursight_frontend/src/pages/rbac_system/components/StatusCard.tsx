import React from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const StatusCardContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

type StatusType = 'info' | 'warning' | 'error' | 'success' | 'loading';

interface StatusCardProps {
  type: StatusType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
  onClose?: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  type,
  title,
  message,
  action,
  secondaryAction,
  onClose,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'info':
        return <InfoOutlinedIcon color="info" />;
      case 'warning':
        return <WarningAmberOutlinedIcon color="warning" />;
      case 'error':
        return <ErrorOutlineIcon color="error" />;
      case 'success':
        return <CheckCircleOutlineIcon color="success" />;
      case 'loading':
        return <CircularProgress size={24} />;
      default:
        return <InfoOutlinedIcon color="info" />;
    }
  };

  const getBackgroundColor = (theme: any) => {
    switch (type) {
      case 'info':
        return theme.palette.info.light + '10'; // 10% opacity
      case 'warning':
        return theme.palette.warning.light + '10';
      case 'error':
        return theme.palette.error.light + '10';
      case 'success':
        return theme.palette.success.light + '10';
      case 'loading':
        return theme.palette.grey[100];
      default:
        return theme.palette.background.paper;
    }
  };

  const getBorderColor = (theme: any) => {
    switch (type) {
      case 'info':
        return theme.palette.info.main;
      case 'warning':
        return theme.palette.warning.main;
      case 'error':
        return theme.palette.error.main;
      case 'success':
        return theme.palette.success.main;
      case 'loading':
        return theme.palette.primary.main;
      default:
        return theme.palette.divider;
    }
  };

  return (
    <StatusCardContainer
      elevation={0}
      sx={(theme) => ({
        backgroundColor: getBackgroundColor(theme),
        borderLeft: `4px solid ${getBorderColor(theme)}`,
      })}
    >
      <Box sx={{ pt: 0.5 }}>{getIcon()}</Box>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {title}
        </Typography>
        {message && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {message}
          </Typography>
        )}
        {(action || secondaryAction) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            {action && (
              <Button
                size="small"
                variant="contained"
                onClick={action.onClick}
                disabled={action.disabled || type === 'loading'}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                size="small"
                variant="outlined"
                onClick={secondaryAction.onClick}
                disabled={secondaryAction.disabled || type === 'loading'}
              >
                {secondaryAction.label}
              </Button>
            )}
          </Box>
        )}
      </Box>
      {onClose && (
        <Button size="small" color="inherit" onClick={onClose}>
          Dismiss
        </Button>
      )}
    </StatusCardContainer>
  );
};

export default StatusCard;