import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Chip, Tooltip, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { commonStyles } from '../styles/AzureTheme';

const HeaderContainer = styled(Box)(({ theme }) => ({
  ...commonStyles.header,
  marginBottom: theme.spacing(3),
}));

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  status?: {
    label: string;
    color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  };
  helpText?: string;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  status,
  helpText,
  action,
}) => {
  return (
    <>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs sx={commonStyles.breadcrumbs}>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary">
                {item.label}
              </Typography>
            ) : (
              <Link
                key={index}
                color="inherit"
                href={item.href}
                onClick={item.onClick}
                underline="hover"
                sx={{ cursor: item.onClick ? 'pointer' : 'default' }}
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <HeaderContainer>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h1" component="h1" sx={commonStyles.title}>
              {title}
            </Typography>
            {status && (
              <Chip
                label={status.label}
                color={status.color || 'default'}
                size="small"
              />
            )}
            {helpText && (
              <Tooltip title={helpText} arrow placement="top">
                <IconButton size="small" color="primary">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </HeaderContainer>
    </>
  );
};

export default PageHeader;