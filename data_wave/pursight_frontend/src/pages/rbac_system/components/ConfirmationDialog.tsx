import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2),
}));

type ConfirmationSeverity = 'info' | 'warning' | 'error';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: ConfirmationSeverity;
  loading?: boolean;
  disableBackdropClick?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  confirmButtonColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  additionalContent?: React.ReactNode;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  severity = 'warning',
  loading = false,
  disableBackdropClick = false,
  maxWidth = 'sm',
  confirmButtonColor = 'primary',
  additionalContent,
}) => {
  const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    onCancel();
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'warning':
        return <WarningAmberIcon color="warning" fontSize="large" />;
      case 'error':
        return <ErrorOutlineIcon color="error" fontSize="large" />;
      case 'info':
      default:
        return <InfoOutlinedIcon color="info" fontSize="large" />;
    }
  };

  const getConfirmButtonColor = () => {
    if (severity === 'error' && confirmButtonColor === 'primary') {
      return 'error';
    }
    return confirmButtonColor;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      <StyledDialogTitle id="confirmation-dialog-title">
        <Typography variant="h6">{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={() => onCancel()}
          size="small"
          disabled={loading}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ mr: 2, pt: 0.5 }}>{getSeverityIcon()}</Box>
          <DialogContentText id="confirmation-dialog-description">
            {message}
          </DialogContentText>
        </Box>
        {additionalContent && (
          <Box sx={{ mt: 2 }}>
            {additionalContent}
          </Box>
        )}
      </StyledDialogContent>
      <StyledDialogActions>
        <Button
          onClick={onCancel}
          color="inherit"
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          color={getConfirmButtonColor()}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
        >
          {confirmLabel}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;