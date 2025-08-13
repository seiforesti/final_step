import React from 'react';
import {
  Box,
  Typography,
  Drawer,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Button,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  overflow: 'auto',
}));

interface DetailPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  width?: number;
  loading?: boolean;
  tabs?: {
    label: string;
    content: React.ReactNode;
  }[];
  actions?: {
    label: string;
    onClick: () => void;
    color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    variant?: 'text' | 'outlined' | 'contained';
    disabled?: boolean;
  }[];
  children?: React.ReactNode;
}

const DetailPanel: React.FC<DetailPanelProps> = ({
  open,
  onClose,
  title,
  width = 400,
  loading = false,
  tabs,
  actions,
  children,
}) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          boxShadow: 3,
        },
      }}
    >
      <DrawerHeader>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DrawerHeader>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tabs ? (
            <>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                {tabs.map((tab, index) => (
                  <Tab key={index} label={tab.label} />
                ))}
              </Tabs>
              <DrawerContent>
                {tabs[activeTab]?.content}
              </DrawerContent>
            </>
          ) : (
            <DrawerContent>{children}</DrawerContent>
          )}

          {actions && actions.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1,
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              {actions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.onClick}
                  color={action.color || 'primary'}
                  variant={action.variant || 'contained'}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          )}
        </>
      )}
    </Drawer>
  );
};

export default DetailPanel;

// Property display component for detail panels
export const PropertyList: React.FC<{
  properties: {
    name: string;
    value: React.ReactNode;
    copyable?: boolean;
  }[];
}> = ({ properties }) => {
  return (
    <List disablePadding>
      {properties.map((prop, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Divider component="li" />}
          <ListItem sx={{ px: 0, py: 1 }}>
            <ListItemText
              primary={
                <Typography variant="body2" color="text.secondary">
                  {prop.name}
                </Typography>
              }
              secondary={
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {prop.value || '-'}
                </Typography>
              }
              disableTypography
            />
          </ListItem>
        </React.Fragment>
      ))}
    </List>
  );
};