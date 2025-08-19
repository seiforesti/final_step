import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
  Skeleton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5),
  '&.MuiTableCell-head': {
    backgroundColor: theme.palette.grey[50],
    fontWeight: 600,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: { value: string | number; label: string }[];
}

interface Action<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
  divider?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  actions?: Action<T>[];
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  pagination?: boolean;
  defaultSortBy?: string;
  defaultSortDirection?: 'asc' | 'desc';
  onSortChange?: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  onFilterChange?: (filterId: string, values: (string | number)[]) => void;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string;
  stickyHeader?: boolean;
  maxHeight?: number | string;
}

function DataTable<T>(
  {
    columns,
    data,
    keyExtractor,
    loading = false,
    emptyMessage = 'No data available',
    actions,
    selectable = false,
    onSelectionChange,
    pagination = true,
    defaultSortBy,
    defaultSortDirection = 'asc',
    onSortChange,
    onFilterChange,
    rowsPerPageOptions = [10, 25, 50, 100],
    defaultRowsPerPage = 10,
    onRowClick,
    getRowClassName,
    stickyHeader = false,
    maxHeight,
  }: DataTableProps<T>
) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [sortBy, setSortBy] = useState<string | undefined>(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<T | null>(null);
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeFilterColumn, setActiveFilterColumn] = useState<Column<T> | null>(null);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map(row => keyExtractor(row));
      setSelected(newSelected);
      if (onSelectionChange) {
        onSelectionChange(data);
      }
    } else {
      setSelected([]);
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  };

  const handleRowSelect = (event: React.MouseEvent<HTMLButtonElement>, row: T) => {
    event.stopPropagation();
    const id = keyExtractor(row);
    const selectedIndex = selected.indexOf(id);
    let newSelected: (string | number)[] = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter(item => item !== id);
    }

    setSelected(newSelected);

    if (onSelectionChange) {
      const selectedRows = data.filter(row => newSelected.includes(keyExtractor(row)));
      onSelectionChange(selectedRows);
    }
  };

  const handleSort = (columnId: string) => {
    const isAsc = sortBy === columnId && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setSortBy(columnId);
    setSortDirection(newDirection);

    if (onSortChange) {
      onSortChange(columnId, newDirection);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, row: T) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setActiveRow(row);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveRow(null);
  };

  const handleActionClick = (action: Action<T>) => {
    if (activeRow) {
      action.onClick(activeRow);
    }
    handleMenuClose();
  };

  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, column: Column<T>) => {
    event.stopPropagation();
    setFilterMenuAnchorEl(event.currentTarget);
    setActiveFilterColumn(column);
  };

  const handleFilterMenuClose = () => {
    setFilterMenuAnchorEl(null);
    setActiveFilterColumn(null);
  };

  const handleFilterSelect = (value: string | number) => {
    if (activeFilterColumn && onFilterChange) {
      onFilterChange(activeFilterColumn.id, [value]);
    }
    handleFilterMenuClose();
  };

  const isSelected = (row: T) => selected.indexOf(keyExtractor(row)) !== -1;

  // Calculate visible rows based on pagination
  const visibleRows = pagination
    ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : data;

  // Loading state
  if (loading) {
    return (
      <StyledTableContainer component={Paper} sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader} size="small">
          <TableHead>
            <TableRow>
              {selectable && (
                <StyledTableCell padding="checkbox">
                  <Skeleton variant="rectangular" width={24} height={24} />
                </StyledTableCell>
              )}
              {columns.map(column => (
                <StyledTableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  <Skeleton variant="text" width="80%" />
                </StyledTableCell>
              ))}
              {actions && actions.length > 0 && (
                <StyledTableCell align="right" style={{ width: 48 }}>
                  <Skeleton variant="rectangular" width={24} height={24} />
                </StyledTableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from(new Array(5)).map((_, index) => (
              <StyledTableRow key={index}>
                {selectable && (
                  <StyledTableCell padding="checkbox">
                    <Skeleton variant="rectangular" width={24} height={24} />
                  </StyledTableCell>
                )}
                {columns.map(column => (
                  <StyledTableCell key={column.id} align={column.align || 'left'}>
                    <Skeleton variant="text" width="80%" />
                  </StyledTableCell>
                ))}
                {actions && actions.length > 0 && (
                  <StyledTableCell align="right">
                    <Skeleton variant="rectangular" width={24} height={24} />
                  </StyledTableCell>
                )}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
          border: theme => `1px solid ${theme.palette.divider}`,
          borderRadius: theme => theme.shape.borderRadius,
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <StyledTableContainer component={Paper} sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader} size="small">
          <TableHead>
            <TableRow>
              {selectable && (
                <StyledTableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                    inputProps={{ 'aria-label': 'select all' }}
                    size="small"
                  />
                </StyledTableCell>
              )}
              {columns.map(column => (
                <StyledTableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {column.sortable ? (
                      <TableSortLabel
                        active={sortBy === column.id}
                        direction={sortBy === column.id ? sortDirection : 'asc'}
                        onClick={() => handleSort(column.id)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                    {column.filterable && column.filterOptions && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleFilterMenuOpen(e, column)}
                        sx={{ ml: 0.5 }}
                      >
                        <FilterListIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </StyledTableCell>
              ))}
              {actions && actions.length > 0 && (
                <StyledTableCell align="right" style={{ width: 48 }}>
                  Actions
                </StyledTableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map(row => {
              const isItemSelected = isSelected(row);
              const rowKey = keyExtractor(row);
              const rowClassName = getRowClassName ? getRowClassName(row) : '';

              return (
                <StyledTableRow
                  hover
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={rowKey}
                  selected={isItemSelected}
                  className={rowClassName}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {selectable && (
                    <StyledTableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onClick={(event) => handleRowSelect(event, row)}
                        size="small"
                      />
                    </StyledTableCell>
                  )}
                  {columns.map(column => {
                    const value = (row as any)[column.id];
                    return (
                      <StyledTableCell key={column.id} align={column.align || 'left'}>
                        {column.format ? column.format(value, row) : value}
                      </StyledTableCell>
                    );
                  })}
                  {actions && actions.length > 0 && (
                    <StyledTableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, row)}
                        aria-label="actions"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </StyledTableCell>
                  )}
                </StyledTableRow>
              );
            })}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {/* Actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180 },
        }}
      >
        {actions &&
          activeRow &&
          actions
            .filter(action => !action.hidden || !action.hidden(activeRow))
            .map((action, index) => (
              <React.Fragment key={action.label}>
                <MenuItem
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled ? action.disabled(activeRow) : false}
                >
                  {action.icon && <ListItemIcon>{action.icon}</ListItemIcon>}
                  <ListItemText>{action.label}</ListItemText>
                </MenuItem>
                {action.divider && index < actions.length - 1 && <Box component="hr" sx={{ my: 0.5 }} />}
              </React.Fragment>
            ))}
      </Menu>

      {/* Filter menu */}
      <Menu
        anchorEl={filterMenuAnchorEl}
        open={Boolean(filterMenuAnchorEl)}
        onClose={handleFilterMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 180 },
        }}
      >
        {activeFilterColumn?.filterOptions?.map(option => (
          <MenuItem key={option.value.toString()} onClick={() => handleFilterSelect(option.value)}>
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default DataTable;

