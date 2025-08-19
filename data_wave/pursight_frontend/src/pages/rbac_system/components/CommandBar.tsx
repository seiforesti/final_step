import React from 'react';
import { Box, Button, Divider, Menu, MenuItem, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import RefreshIcon from '@mui/icons-material/Refresh';
import { commonStyles } from '../styles/AzureTheme';

const CommandBarContainer = styled(Box)(({ theme }) => ({
  ...commonStyles.commandBar,
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1, 0),
}));

interface CommandBarAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

interface CommandBarProps {
  primaryActions?: CommandBarAction[];
  secondaryActions?: CommandBarAction[];
  overflowActions?: CommandBarAction[];
  filterComponent?: React.ReactNode;
  refreshAction?: () => void;
}

const CommandBar: React.FC<CommandBarProps> = ({
  primaryActions = [],
  secondaryActions = [],
  overflowActions = [],
  filterComponent,
  refreshAction,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: CommandBarAction) => {
    action.onClick();
    handleClose();
  };

  return (
    <CommandBarContainer>
      {/* Primary actions */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {primaryActions.map((action, index) => (
          <Tooltip key={index} title={action.tooltip || action.label}>
            <span>
              <Button
                variant={action.primary ? 'contained' : 'outlined'}
                color="primary"
                startIcon={action.icon || <AddIcon />}
                onClick={action.onClick}
                disabled={action.disabled}
                size="small"
              >
                {action.label}
              </Button>
            </span>
          </Tooltip>
        ))}
      </Box>

      {/* Divider if we have both primary and secondary actions */}
      {primaryActions.length > 0 && secondaryActions.length > 0 && (
        <Divider orientation="vertical" flexItem />
      )}

      {/* Secondary actions */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {secondaryActions.map((action, index) => (
          <Tooltip key={index} title={action.tooltip || action.label}>
            <span>
              <Button
                variant="outlined"
                color="primary"
                startIcon={action.icon}
                onClick={action.onClick}
                disabled={action.disabled}
                size="small"
              >
                {action.label}
              </Button>
            </span>
          </Tooltip>
        ))}
      </Box>

      {/* Filter component */}
      {filterComponent && (
        <>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1, color: 'action.active' }} />
            {filterComponent}
          </Box>
        </>
      )}

      {/* Spacer */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Refresh button */}
      {refreshAction && (
        <Tooltip title="Refresh">
          <Button
            variant="text"
            color="primary"
            onClick={refreshAction}
            size="small"
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <RefreshIcon />
          </Button>
        </Tooltip>
      )}

      {/* Overflow menu */}
      {overflowActions.length > 0 && (
        <>
          <Tooltip title="More actions">
            <Button
              id="overflow-button"
              aria-controls={open ? 'overflow-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
              variant="text"
              color="primary"
              size="small"
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <MoreVertIcon />
            </Button>
          </Tooltip>
          <Menu
            id="overflow-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'overflow-button',
              dense: true,
            }}
          >
            {overflowActions.map((action, index) => (
              <MenuItem
                key={index}
                onClick={() => handleActionClick(action)}
                disabled={action.disabled}
              >
                {action.icon && (
                  <Box component="span" sx={{ mr: 1, display: 'flex' }}>
                    {action.icon}
                  </Box>
                )}
                {action.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </CommandBarContainer>
  );
};

export default CommandBar;