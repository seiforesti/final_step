import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Box,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(2),
  minWidth: 400,
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(1, 2, 2),
}));

interface FormDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disableBackdropClick?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disableSubmit?: boolean;
  subtitle?: string;
  hideActions?: boolean;
  hideCancel?: boolean;
  showDividers?: boolean;
}

const FormDialog: React.FC<FormDialogProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  children,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  loading = false,
  disableBackdropClick = false,
  maxWidth = 'sm',
  fullWidth = true,
  disableSubmit = false,
  subtitle,
  hideActions = false,
  hideCancel = false,
  showDividers = true,
}) => {
  const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      aria-labelledby="form-dialog-title"
    >
      <StyledDialogTitle id="form-dialog-title">
        <Box>
          <Typography variant="h6">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          disabled={loading}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </StyledDialogTitle>
      
      {showDividers && <Divider />}
      
      <StyledDialogContent>
        {children}
      </StyledDialogContent>
      
      {!hideActions && (
        <>
          {showDividers && <Divider />}
          <StyledDialogActions>
            {!hideCancel && (
              <Button
                onClick={onClose}
                color="inherit"
                disabled={loading}
              >
                {cancelLabel}
              </Button>
            )}
            <Button
              onClick={onSubmit}
              color="primary"
              variant="contained"
              disabled={loading || disableSubmit}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
            >
              {submitLabel}
            </Button>
          </StyledDialogActions>
        </>
      )}
    </Dialog>
  );
};

export default FormDialog;