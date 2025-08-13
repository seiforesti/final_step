'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DataTable } from '../shared/DataTable';
import {
  Users,
  User,
  Crown,
  Shield,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Calendar,
  Clock,
  Building,
  Target,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
} from 'lucide-react';

// Types
import type { Group } from '../../types/group.types';
import type { User as UserType } from '../../types/user.types';

// Utils
import { formatDate, formatNumber } from '../../utils/format.utils';

interface GroupListProps {
  groups: Group[];
  selectedGroups: Set<number>;
  filter: GroupFilter;
  loading: boolean;
  onGroupSelect: (group: Group) => void;
  onGroupEdit: (group: Group) => void;
  onGroupDelete: (group: Group) => void;
  onManageMembers: (group: Group) => void;
  onFilterChange: (filter: Partial<GroupFilter>) => void;
  onSelectGroup: (groupId: number, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  canManage: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
}

interface GroupFilter {
  search: string;
  status: 'all' | 'active' | 'inactive';
  type: 'all' | 'department' | 'project' | 'security' | 'custom';
  hasMembers: 'all' | 'yes' | 'no';
  hasRoles: 'all' | 'yes' | 'no';
  createdAfter?: Date;
  createdBefore?: Date;
}

interface SortConfig {
  key: keyof Group | 'member_count' | 'role_count';
  direction: 'asc' | 'desc';
}

const GROUP_TYPE_CONFIG = {
  department: { icon: Building, color: 'bg-blue-100 text-blue-800' },
  project: { icon: Target, color: 'bg-green-100 text-green-800' },
  security: { icon: Shield, color: 'bg-red-100 text-red-800' },
  custom: { icon: Tag, color: 'bg-purple-100 text-purple-800' },
};

const GroupList: React.FC<GroupListProps> = ({
  groups,
  selectedGroups,
  filter,
  loading,
  onGroupSelect,
  onGroupEdit,
  onGroupDelete,
  onManageMembers,
  onFilterChange,
  onSelectGroup,
  onSelectAll,
  canManage,
  canDelete,
  canManageMembers,
}) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'name',
    direction: 'asc'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Sorting logic
  const sortedGroups = useMemo(() => {
    if (!sortConfig.key) return groups;

    return [...groups].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof Group];
      let bValue: any = b[sortConfig.key as keyof Group];

      // Handle special cases
      if (sortConfig.key === 'member_count') {
        aValue = a.member_count || 0;
        bValue = b.member_count || 0;
      } else if (sortConfig.key === 'role_count') {
        aValue = a.role_count || 0;
        bValue = b.role_count || 0;
      }

      // Handle dates
      if (sortConfig.key === 'created_at' || sortConfig.key === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [groups, sortConfig]);

  const handleSort = useCallback((key: keyof Group | 'member_count' | 'role_count') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleFilterChange = useCallback((key: keyof GroupFilter, value: any) => {
    onFilterChange({ [key]: value });
  }, [onFilterChange]);

  const getGroupTypeIcon = (type: string) => {
    const config = GROUP_TYPE_CONFIG[type as keyof typeof GROUP_TYPE_CONFIG];
    if (!config) return Tag;
    return config.icon;
  };

  const getGroupTypeColor = (type: string) => {
    const config = GROUP_TYPE_CONFIG[type as keyof typeof GROUP_TYPE_CONFIG];
    if (!config) return 'bg-gray-100 text-gray-800';
    return config.color;
  };

  const renderFilters = () => (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-sm font-medium">Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search groups..."
                value={filter.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Select value={filter.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Type</Label>
            <Select value={filter.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Members</Label>
            <Select value={filter.hasMembers} onValueChange={(value) => handleFilterChange('hasMembers', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="yes">With Members</SelectItem>
                <SelectItem value="no">Without Members</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <Label className="text-sm font-medium">Has Roles</Label>
              <Select value={filter.hasRoles} onValueChange={(value) => handleFilterChange('hasRoles', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="yes">With Roles</SelectItem>
                  <SelectItem value="no">Without Roles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Created After</Label>
              <Input
                type="date"
                value={filter.createdAfter ? filter.createdAfter.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('createdAfter', e.target.value ? new Date(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Created Before</Label>
              <Input
                type="date"
                value={filter.createdBefore ? filter.createdBefore.toISOString().split('T')[0] : ''}
                onChange={(e) => handleFilterChange('createdBefore', e.target.value ? new Date(e.target.value) : undefined)}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderTableView = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedGroups.size === groups.length && groups.length > 0}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  {sortConfig.key === 'name' && (
                    <span className="text-xs">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => handleSort('member_count')}
              >
                <div className="flex items-center space-x-1">
                  <span>Members</span>
                  {sortConfig.key === 'member_count' && (
                    <span className="text-xs">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => handleSort('role_count')}
              >
                <div className="flex items-center space-x-1">
                  <span>Roles</span>
                  {sortConfig.key === 'role_count' && (
                    <span className="text-xs">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  {sortConfig.key === 'created_at' && (
                    <span className="text-xs">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGroups.map((group) => {
              const TypeIcon = getGroupTypeIcon(group.type || 'custom');
              const typeColor = getGroupTypeColor(group.type || 'custom');
              
              return (
                <TableRow
                  key={group.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => onGroupSelect(group)}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedGroups.has(group.id)}
                      onCheckedChange={(checked) => onSelectGroup(group.id, !!checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {group.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {group.description || 'No description'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={typeColor}>
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {group.type || 'Custom'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{group.member_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{group.role_count || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={group.is_active ? 'default' : 'secondary'}>
                      {group.is_active ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDate(group.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onGroupSelect(group)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {canManage && (
                          <DropdownMenuItem onClick={() => onGroupEdit(group)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Group
                          </DropdownMenuItem>
                        )}
                        {canManageMembers && (
                          <DropdownMenuItem onClick={() => onManageMembers(group)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Manage Members
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {canDelete && (
                          <DropdownMenuItem
                            onClick={() => onGroupDelete(group)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Group
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedGroups.map((group) => {
        const TypeIcon = getGroupTypeIcon(group.type || 'custom');
        const typeColor = getGroupTypeColor(group.type || 'custom');
        
        return (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedGroups.has(group.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => onGroupSelect(group)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {group.name}
                      </h3>
                      <Badge className={`${typeColor} text-xs mt-1`}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {group.type || 'Custom'}
                      </Badge>
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedGroups.has(group.id)}
                    onCheckedChange={(checked) => onSelectGroup(group.id, !!checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {group.description || 'No description provided'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-lg font-semibold">{group.member_count || 0}</span>
                    </div>
                    <div className="text-xs text-gray-500">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Crown className="h-4 w-4 text-gray-400" />
                      <span className="text-lg font-semibold">{group.role_count || 0}</span>
                    </div>
                    <div className="text-xs text-gray-500">Roles</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant={group.is_active ? 'default' : 'secondary'} className="text-xs">
                    {group.is_active ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onGroupSelect(group)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      {canManage && (
                        <DropdownMenuItem onClick={() => onGroupEdit(group)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Group
                        </DropdownMenuItem>
                      )}
                      {canManageMembers && (
                        <DropdownMenuItem onClick={() => onManageMembers(group)}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Manage Members
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={() => onGroupDelete(group)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Group
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Created {formatDate(group.created_at)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderFilters()}

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatNumber(groups.length)} group{groups.length !== 1 ? 's' : ''} found
          </span>
          {selectedGroups.size > 0 && (
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {selectedGroups.size} selected
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Table View</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Activity className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Content */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No groups found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or create a new group to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'table' ? renderTableView() : renderGridView()}
        </>
      )}
    </div>
  );
};

export default GroupList;