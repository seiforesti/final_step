import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Collapse,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckIcon from '@mui/icons-material/Check';

const JsonContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.shape.borderRadius,
  fontFamily: '"Roboto Mono", monospace',
  fontSize: '0.875rem',
  overflow: 'auto',
  maxHeight: '500px',
  position: 'relative',
}));

const JsonHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const JsonContent = styled(Box)(({ theme }) => ({
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}));

const DiffHighlight = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'type',
})<{ type: 'added' | 'removed' | 'unchanged' }>(({ theme, type }) => ({
  display: 'inline',
  backgroundColor:
    type === 'added'
      ? theme.palette.success.light + '40'
      : type === 'removed'
      ? theme.palette.error.light + '40'
      : 'transparent',
  color:
    type === 'added'
      ? theme.palette.success.dark
      : type === 'removed'
      ? theme.palette.error.dark
      : 'inherit',
}));

interface JsonViewerProps {
  data: any;
  title?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  maxHeight?: string | number;
  compareWith?: any;
  showDiff?: boolean;
}

const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  title,
  collapsible = false,
  defaultCollapsed = false,
  maxHeight,
  compareWith,
  showDiff = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Function to create a diff view of two JSON objects
  const renderDiff = (before: any, after: any, indent = 0): React.ReactNode => {
    if (before === undefined && after === undefined) return null;

    // Handle primitive values
    if (
      (typeof before !== 'object' || before === null) &&
      (typeof after !== 'object' || after === null)
    ) {
      if (before === after) {
        return <DiffHighlight type="unchanged">{JSON.stringify(before)}</DiffHighlight>;
      } else {
        return (
          <>
            <DiffHighlight type="removed">{JSON.stringify(before)}</DiffHighlight>
            {' → '}
            <DiffHighlight type="added">{JSON.stringify(after)}</DiffHighlight>
          </>
        );
      }
    }

    // Handle arrays
    if (Array.isArray(before) && Array.isArray(after)) {
      const maxLength = Math.max(before.length, after.length);
      const elements: React.ReactNode[] = [];

      for (let i = 0; i < maxLength; i++) {
        const beforeItem = before[i];
        const afterItem = after[i];

        if (i < before.length && i < after.length) {
          elements.push(
            <Box key={i} sx={{ ml: indent * 2 }}>
              {i}: {renderDiff(beforeItem, afterItem, indent + 1)}
            </Box>
          );
        } else if (i < before.length) {
          elements.push(
            <Box key={i} sx={{ ml: indent * 2 }}>
              <DiffHighlight type="removed">
                {i}: {JSON.stringify(beforeItem, null, 2)}
              </DiffHighlight>
            </Box>
          );
        } else {
          elements.push(
            <Box key={i} sx={{ ml: indent * 2 }}>
              <DiffHighlight type="added">
                {i}: {JSON.stringify(afterItem, null, 2)}
              </DiffHighlight>
            </Box>
          );
        }
      }

      return (
        <>
          [<br />
          {elements}
          <Box sx={{ ml: (indent - 1) * 2 }}>]</Box>
        </>
      );
    }

    // Handle objects
    if (
      typeof before === 'object' &&
      before !== null &&
      typeof after === 'object' &&
      after !== null
    ) {
      const allKeys = new Set([
        ...Object.keys(before || {}),
        ...Object.keys(after || {}),
      ]);

      const elements: React.ReactNode[] = [];

      allKeys.forEach((key) => {
        const beforeValue = before?.[key];
        const afterValue = after?.[key];

        if (key in (before || {}) && key in (after || {})) {
          elements.push(
            <Box key={key} sx={{ ml: indent * 2 }}>
              {key}: {renderDiff(beforeValue, afterValue, indent + 1)}
            </Box>
          );
        } else if (key in (before || {})) {
          elements.push(
            <Box key={key} sx={{ ml: indent * 2 }}>
              <DiffHighlight type="removed">
                {key}: {JSON.stringify(beforeValue, null, 2)}
              </DiffHighlight>
            </Box>
          );
        } else {
          elements.push(
            <Box key={key} sx={{ ml: indent * 2 }}>
              <DiffHighlight type="added">
                {key}: {JSON.stringify(afterValue, null, 2)}
              </DiffHighlight>
            </Box>
          );
        }
      });

      return (
        <>
          {'{'}
          <br />
          {elements}
          <Box sx={{ ml: (indent - 1) * 2 }}>{'}'}
          </Box>
        </>
      );
    }

    // Fallback
    return (
      <>
        <DiffHighlight type="removed">{JSON.stringify(before, null, 2)}</DiffHighlight>
        {' → '}
        <DiffHighlight type="added">{JSON.stringify(after, null, 2)}</DiffHighlight>
      </>
    );
  };

  return (
    <JsonContainer elevation={0} sx={{ maxHeight }}>
      {(title || collapsible) && (
        <JsonHeader>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {collapsible && (
              <IconButton size="small" onClick={toggleCollapse} sx={{ mr: 1 }}>
                {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
              </IconButton>
            )}
            {title && (
              <Typography variant="subtitle2" fontWeight="medium">
                {title}
              </Typography>
            )}
          </Box>
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton size="small" onClick={handleCopy}>
              {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </JsonHeader>
      )}

      <Collapse in={!collapsed}>
        <JsonContent>
          {showDiff && compareWith !== undefined ? (
            renderDiff(compareWith, data)
          ) : (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          )}
        </JsonContent>
      </Collapse>
    </JsonContainer>
  );
};

export default JsonViewer;