import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { DataSource, FilterState, SortConfig } from '../types';

export const useDataSourceFilters = (dataSources: DataSource[] = []) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    status: "all",
    location: "all",
    environment: "all",
    criticality: "all",
    tags: [],
    healthScore: [0, 100],
    complianceScore: [0, 100],
    owner: "all",
    team: "all",
    hasIssues: false,
    favorites: false,
    cloud_provider: "all",
    monitoring_enabled: false,
    backup_enabled: false,
    encryption_enabled: false,
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });

  // Debounce search to avoid excessive API calls
  const [debouncedSearch] = useDebounce(filters.search, 300);

  // Get unique filter options from data
  const filterOptions = useMemo(() => {
    return {
      types: [...new Set(dataSources.map(ds => ds.source_type))],
      statuses: [...new Set(dataSources.map(ds => ds.status).filter(Boolean))],
      locations: [...new Set(dataSources.map(ds => ds.location))],
      environments: [...new Set(dataSources.map(ds => ds.environment).filter(Boolean))],
      criticalities: [...new Set(dataSources.map(ds => ds.criticality).filter(Boolean))],
      owners: [...new Set(dataSources.map(ds => ds.owner).filter(Boolean))],
      teams: [...new Set(dataSources.map(ds => ds.team).filter(Boolean))],
      tags: [...new Set(dataSources.flatMap(ds => ds.tags || []))],
      cloud_providers: [...new Set(dataSources.map(ds => ds.cloud_provider).filter(Boolean))],
    };
  }, [dataSources]);

  // Apply filters and sorting
  const filteredAndSortedDataSources = useMemo(() => {
    let filtered = dataSources;

    // Search filter (using debounced value)
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(ds =>
        ds.name.toLowerCase().includes(searchLower) ||
        ds.host.toLowerCase().includes(searchLower) ||
        ds.source_type.toLowerCase().includes(searchLower) ||
        ds.description?.toLowerCase().includes(searchLower) ||
        ds.owner?.toLowerCase().includes(searchLower) ||
        ds.team?.toLowerCase().includes(searchLower) ||
        ds.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
        ds.database_name?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(ds => ds.source_type === filters.type);
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(ds => ds.status === filters.status);
    }

    // Location filter
    if (filters.location !== "all") {
      filtered = filtered.filter(ds => ds.location === filters.location);
    }

    // Environment filter
    if (filters.environment !== "all") {
      filtered = filtered.filter(ds => ds.environment === filters.environment);
    }

    // Criticality filter
    if (filters.criticality !== "all") {
      filtered = filtered.filter(ds => ds.criticality === filters.criticality);
    }

    // Owner filter
    if (filters.owner !== "all") {
      filtered = filtered.filter(ds => ds.owner === filters.owner);
    }

    // Team filter
    if (filters.team !== "all") {
      filtered = filtered.filter(ds => ds.team === filters.team);
    }

    // Cloud provider filter
    if (filters.cloud_provider !== "all") {
      filtered = filtered.filter(ds => ds.cloud_provider === filters.cloud_provider);
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(ds => 
        ds.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    // Health score filter
    filtered = filtered.filter(ds => {
      const healthScore = ds.health_score || 0;
      return healthScore >= filters.healthScore[0] && healthScore <= filters.healthScore[1];
    });

    // Compliance score filter
    filtered = filtered.filter(ds => {
      const complianceScore = ds.compliance_score || 0;
      return complianceScore >= filters.complianceScore[0] && complianceScore <= filters.complianceScore[1];
    });

    // Has issues filter
    if (filters.hasIssues) {
      filtered = filtered.filter(ds => 
        ds.status === 'error' || 
        (ds.health_score && ds.health_score < 80) ||
        (ds.compliance_score && ds.compliance_score < 80) ||
        (ds.error_rate && ds.error_rate > 0.05) ||
        (ds.storage_used_percentage && ds.storage_used_percentage > 85)
      );
    }

    // Favorites filter
    if (filters.favorites) {
      filtered = filtered.filter(ds => ds.favorite);
    }

    // Monitoring enabled filter
    if (filters.monitoring_enabled) {
      filtered = filtered.filter(ds => ds.monitoring_enabled);
    }

    // Backup enabled filter
    if (filters.backup_enabled) {
      filtered = filtered.filter(ds => ds.backup_enabled);
    }

    // Encryption enabled filter
    if (filters.encryption_enabled) {
      filtered = filtered.filter(ds => ds.encryption_enabled);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof DataSource];
      const bValue = b[sortConfig.key as keyof DataSource];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortConfig.direction === "asc" ? comparison : -comparison;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
      }
      
      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      }
      
      // Handle string dates
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          if (aDate < bDate) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aDate > bDate) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        }
      }
      
      // Default string comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [dataSources, debouncedSearch, filters, sortConfig]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "all",
      status: "all",
      location: "all",
      environment: "all",
      criticality: "all",
      tags: [],
      healthScore: [0, 100],
      complianceScore: [0, 100],
      owner: "all",
      team: "all",
      hasIssues: false,
      favorites: false,
      cloud_provider: "all",
      monitoring_enabled: false,
      backup_enabled: false,
      encryption_enabled: false,
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search ||
      filters.type !== "all" ||
      filters.status !== "all" ||
      filters.location !== "all" ||
      filters.environment !== "all" ||
      filters.criticality !== "all" ||
      filters.owner !== "all" ||
      filters.team !== "all" ||
      filters.cloud_provider !== "all" ||
      filters.tags.length > 0 ||
      filters.healthScore[0] > 0 ||
      filters.healthScore[1] < 100 ||
      filters.complianceScore[0] > 0 ||
      filters.complianceScore[1] < 100 ||
      filters.hasIssues ||
      filters.favorites ||
      filters.monitoring_enabled ||
      filters.backup_enabled ||
      filters.encryption_enabled
    );
  }, [filters]);

  // Get filter summary for display
  const getFilterSummary = useMemo(() => {
    const activeFilters: string[] = [];
    
    if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
    if (filters.type !== "all") activeFilters.push(`Type: ${filters.type}`);
    if (filters.status !== "all") activeFilters.push(`Status: ${filters.status}`);
    if (filters.location !== "all") activeFilters.push(`Location: ${filters.location}`);
    if (filters.environment !== "all") activeFilters.push(`Environment: ${filters.environment}`);
    if (filters.criticality !== "all") activeFilters.push(`Criticality: ${filters.criticality}`);
    if (filters.owner !== "all") activeFilters.push(`Owner: ${filters.owner}`);
    if (filters.team !== "all") activeFilters.push(`Team: ${filters.team}`);
    if (filters.cloud_provider !== "all") activeFilters.push(`Cloud: ${filters.cloud_provider}`);
    if (filters.tags.length > 0) activeFilters.push(`Tags: ${filters.tags.join(', ')}`);
    if (filters.hasIssues) activeFilters.push('Has Issues');
    if (filters.favorites) activeFilters.push('Favorites Only');
    if (filters.monitoring_enabled) activeFilters.push('Monitoring Enabled');
    if (filters.backup_enabled) activeFilters.push('Backup Enabled');
    if (filters.encryption_enabled) activeFilters.push('Encryption Enabled');
    
    return activeFilters;
  }, [filters]);

  // Get quick stats for filtered data
  const getFilterStats = useMemo(() => {
    if (filteredAndSortedDataSources.length === 0) {
      return {
        total: 0,
        healthy: 0,
        warning: 0,
        critical: 0,
        error: 0,
        monitored: 0,
        backedUp: 0,
        encrypted: 0,
        cloud: 0,
        onPrem: 0,
        hybrid: 0,
      };
    }

    return {
      total: filteredAndSortedDataSources.length,
      healthy: filteredAndSortedDataSources.filter(ds => ds.health_score && ds.health_score >= 90).length,
      warning: filteredAndSortedDataSources.filter(ds => ds.health_score && ds.health_score >= 70 && ds.health_score < 90).length,
      critical: filteredAndSortedDataSources.filter(ds => ds.health_score && ds.health_score < 70).length,
      error: filteredAndSortedDataSources.filter(ds => ds.status === 'error').length,
      monitored: filteredAndSortedDataSources.filter(ds => ds.monitoring_enabled).length,
      backedUp: filteredAndSortedDataSources.filter(ds => ds.backup_enabled).length,
      encrypted: filteredAndSortedDataSources.filter(ds => ds.encryption_enabled).length,
      cloud: filteredAndSortedDataSources.filter(ds => ds.location === 'cloud').length,
      onPrem: filteredAndSortedDataSources.filter(ds => ds.location === 'on_prem').length,
      hybrid: filteredAndSortedDataSources.filter(ds => ds.location === 'hybrid').length,
    };
  }, [filteredAndSortedDataSources]);

  return {
    filters,
    sortConfig,
    filteredAndSortedDataSources,
    filterOptions,
    updateFilter,
    setSortConfig,
    clearFilters,
    hasActiveFilters,
    debouncedSearch,
    getFilterSummary,
    getFilterStats,
  };
};
