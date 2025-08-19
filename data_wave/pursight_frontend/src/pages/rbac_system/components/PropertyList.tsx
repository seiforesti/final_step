import React from 'react';
import {
  Box,
  Typography,
  Divider,
  Chip,
  Link,
  Tooltip,
  IconButton,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

const PropertyContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

const PropertyRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
}));

const PropertyLabel = styled(Typography)(({ theme }) => ({
  width: '30%',
  minWidth: 120,
  maxWidth: 200,
  fontWeight: 500,
  color: theme.palette.text.secondary,
  flexShrink: 0,
}));

const PropertyValue = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(0.5),
}));

const PropertySection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

interface PropertyItem {
  label: string;
  value: React.ReactNode | string | number | boolean | null | undefined;
  type?: 'text' | 'code' | 'date' | 'boolean' | 'chip' | 'link' | 'json';
  copyable?: boolean;
  chipColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  href?: string;
  onClick?: () => void;
  tooltip?: string;
}

interface PropertyListProps {
  properties: PropertyItem[];
  sections?: {
    title: string;
    properties: PropertyItem[];
  }[];
  dense?: boolean;
  dividers?: boolean;
  elevation?: number;
  variant?: 'outlined' | 'elevation';
  sx?: any;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties = [],
  sections = [],
  dense = false,
  dividers = true,
  elevation = 0,
  variant = 'outlined',
  sx = {},
}) => {
  const formatValue = (property: PropertyItem) => {
    const { value, type, copyable, chipColor, href, onClick, tooltip } = property;

    // Handle null or undefined
    if (value === null || value === undefined) {
      return <Typography variant="body2" color="text.disabled">Not set</Typography>;
    }

    // Handle React node
    if (React.isValidElement(value)) {
      return value;
    }

    // Format based on type
    switch (type) {
      case 'code':
        return (
          <Box
            component="code"
            sx={{
              backgroundColor: 'grey.100',
              padding: '2px 4px',
              borderRadius: 1,
              fontFamily: '"Roboto Mono", monospace',
              fontSize: '0.875rem',
            }}
          >
            {String(value)}
          </Box>
        );

      case 'date':
        const date = value instanceof Date ? value : new Date(String(value));
        return (
          <Typography variant="body2">
            {date.toLocaleString()}
          </Typography>
        );

      case 'boolean':
        return (
          <Chip
            label={value ? 'Yes' : 'No'}
            size="small"
            color={value ? 'success' : 'default'}
            variant="outlined"
          />
        );

      case 'chip':
        return (
          <Chip
            label={String(value)}
            size="small"
            color={chipColor || 'default'}
            variant="outlined"
          />
        );

      case 'link':
        return (
          <Link
            href={href}
            onClick={onClick}
            underline="hover"
            sx={{ cursor: onClick ? 'pointer' : 'default' }}
          >
            {String(value)}
          </Link>
        );

      case 'json':
        try {
          const jsonStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
          return (
            <Box
              component="pre"
              sx={{
                backgroundColor: 'grey.50',
                padding: 1,
                borderRadius: 1,
                fontSize: '0.75rem',
                overflow: 'auto',
                maxHeight: 200,
                maxWidth: '100%',
                margin: 0,
              }}
            >
              {jsonStr}
            </Box>
          );
        } catch (e) {
          return String(value);
        }

      default:
        return (
          <Typography variant="body2">
            {String(value)}
          </Typography>
        );
    }
  };

  const renderProperty = (property: PropertyItem, index: number, isLastItem: boolean) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
      const valueToCopy = typeof property.value === 'object' && property.value !== null
        ? JSON.stringify(property.value)
        : String(property.value);
      navigator.clipboard.writeText(valueToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const formattedValue = formatValue(property);

    return (
      <React.Fragment key={index}>
        <PropertyRow>
          <PropertyLabel variant="body2">
            {property.tooltip ? (
              <Tooltip title={property.tooltip} placement="top-start">
                <span>{property.label}</span>
              </Tooltip>
            ) : (
              property.label
            )}
          </PropertyLabel>
          <PropertyValue>
            {formattedValue}
            {property.copyable && property.value !== null && property.value !== undefined && (
              <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                <IconButton size="small" onClick={handleCopy} sx={{ ml: 0.5 }}>
                  {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}
          </PropertyValue>
        </PropertyRow>
        {dividers && !isLastItem && <Divider />}
      </React.Fragment>
    );
  };

  const content = (
    <PropertyContainer sx={{ p: dense ? 1 : 2 }}>
      {properties.length > 0 && (
        <>
          {properties.map((property, index) =>
            renderProperty(property, index, index === properties.length - 1 && sections.length === 0)
          )}
        </>
      )}

      {sections.map((section, sectionIndex) => (
        <React.Fragment key={sectionIndex}>
          <PropertySection>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              {section.title}
            </Typography>
            {section.properties.map((property, propIndex) =>
              renderProperty(
                property,
                `section-${sectionIndex}-prop-${propIndex}`,
                propIndex === section.properties.length - 1 &&
                  sectionIndex === sections.length - 1
              )
            )}
          </PropertySection>
        </React.Fragment>
      ))}
    </PropertyContainer>
  );

  // If no elevation and no variant, just return the content
  if (elevation === 0 && !variant) {
    return content;
  }

  // Otherwise wrap in Paper
  return (
    <Paper elevation={elevation} variant={variant} sx={sx}>
      {content}
    </Paper>
  );
};

export default PropertyList;