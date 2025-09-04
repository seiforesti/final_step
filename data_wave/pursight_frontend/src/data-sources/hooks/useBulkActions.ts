import { useState, useMemo } from 'react';
import { DataSource, DataSourceUpdateParams } from '../types';
import { 
  useBulkDeleteDataSourcesMutation, 
  useBulkUpdateDataSourcesMutation 
} from '../services/apis';

export const useBulkActions = (dataSources: DataSource[] = []) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'delete' | 'update' | ''>('');

  const bulkDeleteMutation = useBulkDeleteDataSourcesMutation();
  const bulkUpdateMutation = useBulkUpdateDataSourcesMutation();

  const selectedDataSources = useMemo(() => {
    return dataSources.filter(ds => selectedIds.has(ds.id));
  }, [dataSources, selectedIds]);

  const isAllSelected = useMemo(() => {
    return dataSources.length > 0 && selectedIds.size === dataSources.length;
  }, [dataSources.length, selectedIds.size]);

  const isIndeterminate = useMemo(() => {
    return selectedIds.size > 0 && selectedIds.size < dataSources.length;
  }, [dataSources.length, selectedIds.size]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(dataSources.map(ds => ds.id)));
    }
  };

  const toggleSelectItem = (id: number) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const openBulkAction = (type: 'delete' | 'update') => {
    setActionType(type);
    setIsDialogOpen(true);
  };

  const closeBulkAction = () => {
    setIsDialogOpen(false);
    setActionType('');
  };

  const executeBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
      clearSelection();
      closeBulkAction();
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const executeBulkUpdate = async (updates: Partial<DataSourceUpdateParams>) => {
    try {
      await bulkUpdateMutation.mutateAsync({
        ids: Array.from(selectedIds),
        updates
      });
      clearSelection();
      closeBulkAction();
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  const bulkActions = [
    {
      id: 'delete',
      label: 'Delete Selected',
      icon: 'Trash2',
      variant: 'destructive' as const,
      disabled: selectedIds.size === 0,
      onClick: () => openBulkAction('delete')
    },
    {
      id: 'update-status',
      label: 'Update Status',
      icon: 'Edit',
      variant: 'outline' as const,
      disabled: selectedIds.size === 0,
      onClick: () => openBulkAction('update')
    }
  ];

  return {
    selectedIds,
    selectedDataSources,
    isAllSelected,
    isIndeterminate,
    isDialogOpen,
    actionType,
    bulkActions,
    toggleSelectAll,
    toggleSelectItem,
    clearSelection,
    openBulkAction,
    closeBulkAction,
    executeBulkDelete,
    executeBulkUpdate,
    isLoading: bulkDeleteMutation.isPending || bulkUpdateMutation.isPending,
    error: bulkDeleteMutation.error || bulkUpdateMutation.error
  };
};