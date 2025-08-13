import React from 'react';
import { Box, Tabs, Tab, Typography, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const TabContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 48,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minHeight: 48,
  padding: theme.spacing(1, 2),
  fontWeight: theme.typography.fontWeightMedium,
  '&.Mui-selected': {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.primary.main,
  },
}));

const TabContentContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2, 0),
}));

interface TabPanelProps {
  value: number;
  index: number;
  children: React.ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

interface TabData {
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: number | string;
}

interface TabsContainerProps {
  tabs: TabData[];
  value?: number;
  onChange?: (newValue: number) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'standard' | 'fullWidth' | 'scrollable';
  centered?: boolean;
  showDivider?: boolean;
}

const TabsContainer: React.FC<TabsContainerProps> = ({
  tabs,
  value = 0,
  onChange,
  orientation = 'horizontal',
  variant = 'standard',
  centered = false,
  showDivider = true,
}) => {
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <TabContainer>
      <StyledTabs
        value={value}
        onChange={handleChange}
        orientation={orientation}
        variant={variant}
        centered={centered}
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {tabs.map((tab, index) => (
          <StyledTab
            key={index}
            label={
              tab.badge ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {tab.label}
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      fontSize: '0.75rem',
                    }}
                  >
                    {tab.badge}
                  </Box>
                </Box>
              ) : (
                tab.label
              )
            }
            icon={tab.icon}
            iconPosition="start"
            disabled={tab.disabled}
            id={`tab-${index}`}
            aria-controls={`tabpanel-${index}`}
          />
        ))}
      </StyledTabs>
      {showDivider && <Divider />}
      <TabContentContainer>
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={value} index={index}>
            {tab.content}
          </TabPanel>
        ))}
      </TabContentContainer>
    </TabContainer>
  );
};

export { TabPanel, TabsContainer };