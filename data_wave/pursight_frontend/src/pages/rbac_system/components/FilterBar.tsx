import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Button,
  Divider,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check';

const FilterBarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  marginBottom: theme.spacing(2),
}));

interface FilterOption {
  id: string;
  label: string;
  options: {
    value: string | number;
    label: string;
  }[];
  multiple?: boolean;
}

interface ActiveFilter {
  id: string;
  value: (string | number)[];
  displayValue: string;
}

interface FilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterOptions?: FilterOption[];
  activeFilters?: ActiveFilter[];
  onFilterChange?: (filters: ActiveFilter[]) => void;
  onFilterRemove?: (filterId: string) => void;
  onFiltersClear?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filterOptions = [],
  activeFilters = [],
  onFilterChange,
  onFilterRemove,
  onFiltersClear,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(null);
  const [tempFilterValues, setTempFilterValues] = useState<(string | number)[]>([]);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterOptionSelect = (filter: FilterOption) => {
    setSelectedFilter(filter);
    // Initialize with current values if filter is already active
    const activeFilter = activeFilters.find(f => f.id === filter.id);
    setTempFilterValues(activeFilter ? activeFilter.value : []);
  };

  const handleFilterValueToggle = (value: string | number) => {
    if (!selectedFilter) return;

    if (selectedFilter.multiple) {
      setTempFilterValues(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev, value]
      );
    } else {
      setTempFilterValues([value]);
    }
  };

  const handleFilterApply = () => {
    if (!selectedFilter || !onFilterChange) return;

    const newFilters = [...activeFilters];
    const filterIndex = newFilters.findIndex(f => f.id === selectedFilter.id);

    if (tempFilterValues.length === 0) {
      // Remove filter if no values selected
      if (filterIndex !== -1) {
        newFilters.splice(filterIndex, 1);
      }
    } else {
      // Create display value string
      const displayValues = tempFilterValues.map(value => {
        const option = selectedFilter.options.find(opt => opt.value === value);
        return option ? option.label : value.toString();
      });

      const displayValue = displayValues.join(', ');

      // Update or add filter
      if (filterIndex !== -1) {
        newFilters[filterIndex] = {
          ...newFilters[filterIndex],
          value: tempFilterValues,
          displayValue,
        };
      } else {
        newFilters.push({
          id: selectedFilter.id,
          value: tempFilterValues,
          displayValue,
        });
      }
    }

    onFilterChange(newFilters);
    setSelectedFilter(null);
    setAnchorEl(null);
  };

  const handleFilterRemove = (filterId: string) => {
    if (onFilterRemove) {
      onFilterRemove(filterId);
    }
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <FilterBarContainer>
      {/* Search field */}
      <TextField
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        sx={{ minWidth: 240 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: searchValue ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClearSearch}
                edge="end"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* Filter button */}
      {filterOptions.length > 0 && (
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleFilterClick}
          size="small"
        >
          Filter
        </Button>
      )}

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {activeFilters.map((filter) => {
            const filterOption = filterOptions.find(opt => opt.id === filter.id);
            return (
              <Chip
                key={filter.id}
                label={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" component="span" sx={{ fontWeight: 'bold', mr: 0.5 }}>
                      {filterOption?.label || filter.id}:
                    </Typography>
                    <Typography variant="body2" component="span">
                      {filter.displayValue}
                    </Typography>
                  </Box>
                }
                onDelete={() => handleFilterRemove(filter.id)}
                size="small"
                sx={{ maxWidth: '300px' }}
              />
            );
          })}
          {activeFilters.length > 1 && onFiltersClear && (
            <Tooltip title="Clear all filters">
              <Chip
                label="Clear all"
                onDelete={onFiltersClear}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>
      )}

      {/* Filter menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { width: 320, maxHeight: 500 },
        }}
      >
        {!selectedFilter ? (
          // Filter options menu
          filterOptions.map((filter) => (
            <MenuItem key={filter.id} onClick={() => handleFilterOptionSelect(filter)}>
              {filter.label}
            </MenuItem>
          ))
        ) : (
          // Filter values menu
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ px: 1, py: 0.5 }}>
              {selectedFilter.label}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {selectedFilter.options.map((option) => {
                const isSelected = tempFilterValues.includes(option.value);
                return (
                  <MenuItem
                    key={option.value.toString()}
                    onClick={() => handleFilterValueToggle(option.value)}
                    sx={{
                      backgroundColor: isSelected ? 'action.selected' : 'inherit',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ flexGrow: 1 }}>{option.label}</Typography>
                      {isSelected && <CheckIcon color="primary" fontSize="small" />}
                    </Box>
                  </MenuItem>
                );
              })}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, px: 1 }}>
              <Button
                size="small"
                onClick={() => {
                  setSelectedFilter(null);
                  setAnchorEl(null);
                }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleFilterApply}
              >
                Apply
              </Button>
            </Box>
          </Box>
        )}
      </Menu>
    </FilterBarContainer>
  );
};

export default FilterBar;