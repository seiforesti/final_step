import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { 
  fetchLineageGraph, 
  fetchLineageNode, 
  updateLineageRelationship,
  addLineageRelationship,
  removeLineageRelationship
} from '../api/lineage';
import { LineageNode, LineageEdge, LineageGraph } from '../models/LineageNode';
import { useRBACPermissions } from './useRBACPermissions';

interface UseDataLineageOptions {
  nodeId?: string;
  depth?: number;
  direction?: 'upstream' | 'downstream' | 'both';
  includeFilters?: string[];
  excludeFilters?: string[];
}

/**
 * Advanced hook for managing data lineage relationships and visualization
 * with comprehensive filtering and traversal options.
 * 
 * Features:
 * - Fetches lineage graphs with configurable depth and direction
 * - Manages lineage relationships between data entities
 * - Supports filtering by entity types and attributes
 * - Provides detailed node information
 * - Integrates with RBAC permissions
 */
export function useDataLineage(options: UseDataLineageOptions = {}) {
  const { 
    nodeId, 
    depth = 3, 
    direction = 'both',
    includeFilters = [],
    excludeFilters = []
  } = options;
  
  const queryClient = useQueryClient();
  const { hasPermission } = useRBACPermissions();
  const [currentNodeId, setCurrentNodeId] = useState<string | undefined>(nodeId);
  const [currentDepth, setCurrentDepth] = useState<number>(depth);
  const [currentDirection, setCurrentDirection] = useState<'upstream' | 'downstream' | 'both'>(direction);
  const [filters, setFilters] = useState<{
    include: string[];
    exclude: string[];
  }>({
    include: includeFilters,
    exclude: excludeFilters
  });

  // Check permissions
  const canViewLineage = hasPermission('lineage.view');
  const canManageLineage = hasPermission('lineage.manage');

  // Fetch lineage graph for the current node
  const {
    data: lineageGraph,
    isLoading: isGraphLoading,
    isError: isGraphError,
    error: graphError,
    refetch: refetchGraph
  } = useQuery({
    queryKey: ['lineageGraph', currentNodeId, currentDepth, currentDirection, filters],
    queryFn: () => {
      if (!currentNodeId) return { nodes: [], edges: [] };
      return fetchLineageGraph({
        nodeId: currentNodeId,
        depth: currentDepth,
        direction: currentDirection,
        includeFilters: filters.include,
        excludeFilters: filters.exclude
      });
    },
    enabled: canViewLineage && !!currentNodeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch detailed information for a specific node
  const {
    data: nodeDetails,
    isLoading: isNodeLoading,
    isError: isNodeError,
    error: nodeError,
    refetch: refetchNode
  } = useQuery({
    queryKey: ['lineageNode', currentNodeId],
    queryFn: () => {
      if (!currentNodeId) return null;
      return fetchLineageNode(currentNodeId);
    },
    enabled: canViewLineage && !!currentNodeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add lineage relationship mutation
  const addRelationshipMutation = useMutation({
    mutationFn: addLineageRelationship,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries(['lineageGraph']);
    },
  });

  // Update lineage relationship mutation
  const updateRelationshipMutation = useMutation({
    mutationFn: updateLineageRelationship,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries(['lineageGraph']);
    },
  });

  // Remove lineage relationship mutation
  const removeRelationshipMutation = useMutation({
    mutationFn: removeLineageRelationship,
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries(['lineageGraph']);
    },
  });

  /**
   * Set the current node for lineage operations
   * @param nodeId The ID of the node
   */
  const setNode = useCallback((nodeId: string) => {
    setCurrentNodeId(nodeId);
  }, []);

  /**
   * Set the depth for lineage graph traversal
   * @param depth The depth of traversal
   */
  const setDepth = useCallback((depth: number) => {
    setCurrentDepth(depth);
  }, []);

  /**
   * Set the direction for lineage graph traversal
   * @param direction The direction of traversal
   */
  const setDirection = useCallback((direction: 'upstream' | 'downstream' | 'both') => {
    setCurrentDirection(direction);
  }, []);

  /**
   * Update filters for lineage graph
   * @param includeFilters Entity types to include
   * @param excludeFilters Entity types to exclude
   */
  const updateFilters = useCallback((includeFilters: string[] = [], excludeFilters: string[] = []) => {
    setFilters({
      include: includeFilters,
      exclude: excludeFilters
    });
  }, []);

  /**
   * Add a lineage relationship between two nodes
   * @param sourceId The ID of the source node
   * @param targetId The ID of the target node
   * @param relationshipType The type of relationship
   * @param metadata Optional metadata for the relationship
   * @returns Promise resolving when relationship is added
   */
  const addRelationship = useCallback(
    async (sourceId: string, targetId: string, relationshipType: string, metadata?: Record<string, any>) => {
      if (!canManageLineage) {
        throw new Error('You do not have permission to manage lineage relationships');
      }

      return addRelationshipMutation.mutateAsync({
        sourceId,
        targetId,
        relationshipType,
        metadata
      });
    },
    [canManageLineage, addRelationshipMutation]
  );

  /**
   * Update a lineage relationship
   * @param relationshipId The ID of the relationship
   * @param relationshipType The type of relationship
   * @param metadata Optional metadata for the relationship
   * @returns Promise resolving when relationship is updated
   */
  const updateRelationship = useCallback(
    async (relationshipId: string, relationshipType: string, metadata?: Record<string, any>) => {
      if (!canManageLineage) {
        throw new Error('You do not have permission to manage lineage relationships');
      }

      return updateRelationshipMutation.mutateAsync({
        relationshipId,
        relationshipType,
        metadata
      });
    },
    [canManageLineage, updateRelationshipMutation]
  );

  /**
   * Remove a lineage relationship
   * @param relationshipId The ID of the relationship
   * @returns Promise resolving when relationship is removed
   */
  const removeRelationship = useCallback(
    async (relationshipId: string) => {
      if (!canManageLineage) {
        throw new Error('You do not have permission to manage lineage relationships');
      }

      return removeRelationshipMutation.mutateAsync({
        relationshipId
      });
    },
    [canManageLineage, removeRelationshipMutation]
  );

  /**
   * Find a node in the current lineage graph by ID
   * @param nodeId The ID of the node
   * @returns The node or undefined if not found
   */
  const findNodeById = useCallback(
    (nodeId: string): LineageNode | undefined => {
      if (!lineageGraph || !lineageGraph.nodes) return undefined;
      return lineageGraph.nodes.find(node => node.id === nodeId);
    },
    [lineageGraph]
  );

  /**
   * Find edges between two nodes
   * @param sourceId The ID of the source node
   * @param targetId The ID of the target node
   * @returns Array of edges between the nodes
   */
  const findEdgesBetweenNodes = useCallback(
    (sourceId: string, targetId: string): LineageEdge[] => {
      if (!lineageGraph || !lineageGraph.edges) return [];
      return lineageGraph.edges.filter(
        edge => edge.sourceId === sourceId && edge.targetId === targetId
      );
    },
    [lineageGraph]
  );

  /**
   * Refresh all lineage data
   */
  const refreshLineageData = useCallback(() => {
    refetchGraph();
    if (currentNodeId) {
      refetchNode();
    }
  }, [refetchGraph, refetchNode, currentNodeId]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Lineage graph
      lineageGraph,
      isGraphLoading,
      isGraphError,
      graphError,
      
      // Node details
      nodeDetails,
      isNodeLoading,
      isNodeError,
      nodeError,
      
      // Configuration
      currentNodeId,
      currentDepth,
      currentDirection,
      filters,
      
      // Operations
      setNode,
      setDepth,
      setDirection,
      updateFilters,
      addRelationship,
      updateRelationship,
      removeRelationship,
      isAddingRelationship: addRelationshipMutation.isLoading,
      isUpdatingRelationship: updateRelationshipMutation.isLoading,
      isRemovingRelationship: removeRelationshipMutation.isLoading,
      addRelationshipError: addRelationshipMutation.error,
      updateRelationshipError: updateRelationshipMutation.error,
      removeRelationshipError: removeRelationshipMutation.error,
      
      // Utilities
      findNodeById,
      findEdgesBetweenNodes,
      refreshLineageData,
      
      // Permissions
      canViewLineage,
      canManageLineage
    }),
    [
      lineageGraph,
      isGraphLoading,
      isGraphError,
      graphError,
      nodeDetails,
      isNodeLoading,
      isNodeError,
      nodeError,
      currentNodeId,
      currentDepth,
      currentDirection,
      filters,
      setNode,
      setDepth,
      setDirection,
      updateFilters,
      addRelationship,
      updateRelationship,
      removeRelationship,
      addRelationshipMutation.isLoading,
      updateRelationshipMutation.isLoading,
      removeRelationshipMutation.isLoading,
      addRelationshipMutation.error,
      updateRelationshipMutation.error,
      removeRelationshipMutation.error,
      findNodeById,
      findEdgesBetweenNodes,
      refreshLineageData,
      canViewLineage,
      canManageLineage
    ]
  );
}