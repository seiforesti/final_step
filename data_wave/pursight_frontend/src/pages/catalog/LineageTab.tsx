import React, { useState, useEffect } from 'react';
import { useTableLineage } from '../../api/lineage';
import { LineageNode, LineageData } from '../../models/LineageNode';
import { LineageEdge } from '../../models/LineageEdge';
import LineageGraph from '../../components/LineageGraph';
import LineageDetails from '../../components/LineageDetails';
import LineageLegend from '../../components/LineageLegend';

// Define props interface
interface LineageTabProps {
  path?: string;
}

// Theme for consistent styling
const theme = {
  bg: '#f8f9fa',
  card: '#ffffff',
  border: '#e9ecef',
  text: '#212529',
  textSecondary: '#6c757d',
  accent: '#0d6efd',
  info: '#0dcaf0',
  success: '#198754',
  warning: '#ffc107',
  error: '#dc3545',
  shadow: '0 2px 4px rgba(0,0,0,0.05)',
};

// Mock data for lineage visualization
const mockLineageData = {
  nodes: [
    { id: "source1", label: "Raw Data", type: "source", status: "available" },
    { id: "process1", label: "ETL Process", type: "process", status: "completed" },
    { id: "dataset1", label: "Transformed Data", type: "dataset", status: "available" },
    { id: "process2", label: "Data Validation", type: "process", status: "completed" },
    { id: "dataset2", label: "Validated Data", type: "dataset", status: "available" },
    { id: "process3", label: "ML Training", type: "process", status: "running" },
    { id: "model1", label: "Trained Model", type: "model", status: "available" },
    { id: "process4", label: "Inference", type: "process", status: "scheduled" },
    { id: "output1", label: "Predictions", type: "output", status: "pending" },
  ],
  edges: [
    { from: "source1", to: "process1" },
    { from: "process1", to: "dataset1" },
    { from: "dataset1", to: "process2" },
    { from: "process2", to: "dataset2" },
    { from: "dataset2", to: "process3" },
    { from: "process3", to: "model1" },
    { from: "model1", to: "process4" },
    { from: "process4", to: "output1" },
  ],
};

const LineageTab: React.FC<LineageTabProps> = ({ path }) => {
  const [lineageData, setLineageData] = useState<LineageData>(mockLineageData);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'upstream' | 'downstream' | 'both'>('both');
  
  // Fetch lineage data from API
  const { data: tableLineageData, isLoading: isTableLineageLoading } = useTableLineage(path);
  const { data: lineageEdges, isLoading: isLineageLoading } = useLineage(
    path ? 'table' : '', // object type
    path ? path.join('/') : '', // object id
    viewMode === 'both' ? 'both' : viewMode
  );
  
  // Transform API data to our LineageData format
  useEffect(() => {
    if (tableLineageData && !isTableLineageLoading) {
      // Create nodes from upstream and downstream data
      const allNodes: LineageNode[] = [];
      const allEdges: { from: string; to: string }[] = [];
      
      // Process upstream nodes
      if (tableLineageData.upstream) {
        tableLineageData.upstream.forEach((item: any) => {
          allNodes.push({
            id: item.id,
            label: item.name || item.id,
            type: item.type || 'dataset',
            status: item.status || 'available'
          });
          
          // Add edge if this connects to something
          if (item.target) {
            allEdges.push({
              from: item.id,
              to: item.target
            });
          }
        });
      }
      
      // Process downstream nodes
      if (tableLineageData.downstream) {
        tableLineageData.downstream.forEach((item: any) => {
          allNodes.push({
            id: item.id,
            label: item.name || item.id,
            type: item.type || 'dataset',
            status: item.status || 'available'
          });
          
          // Add edge if this connects to something
          if (item.source) {
            allEdges.push({
              from: item.source,
              to: item.id
            });
          }
        });
      }
      
      // Add current table as a node if we have a path
      if (path && path.length > 0) {
        const tableId = path.join('/');
        const tableName = path[path.length - 1];
        
        allNodes.push({
          id: tableId,
          label: tableName,
          type: 'dataset',
          status: 'available'
        });
      }
      
      // Remove duplicate nodes
      const uniqueNodes = Array.from(
        new Map(allNodes.map(node => [node.id, node])).values()
      );
      
      setLineageData({
        nodes: uniqueNodes,
        edges: allEdges
      });
    } else if (lineageEdges && !isLineageLoading) {
      // Alternative: use the lineage API data
      const nodes: LineageNode[] = [];
      const edges: { from: string; to: string }[] = [];
      const nodeMap = new Map<string, boolean>();
      
      // Process lineage edges to extract nodes and connections
      lineageEdges.forEach((edge: LineageEdge) => {
        // Add source node if not already added
        if (!nodeMap.has(edge.source_id)) {
          nodes.push({
            id: edge.source_id,
            label: edge.source_id.split('/').pop() || edge.source_id,
            type: edge.source_type,
            status: 'available'
          });
          nodeMap.set(edge.source_id, true);
        }
        
        // Add target node if not already added
        if (!nodeMap.has(edge.target_id)) {
          nodes.push({
            id: edge.target_id,
            label: edge.target_id.split('/').pop() || edge.target_id,
            type: edge.target_type,
            status: 'available'
          });
          nodeMap.set(edge.target_id, true);
        }
        
        // Add edge
        edges.push({
          from: edge.source_id,
          to: edge.target_id
        });
      });
      
      if (nodes.length > 0) {
        setLineageData({
          nodes,
          edges
        });
      }
    }
  }, [tableLineageData, lineageEdges, isTableLineageLoading, isLineageLoading, path, viewMode]);
  

  // No helper functions needed as they've been moved to the components

  // Loading state
  const isLoading = (path && path.length > 0) && (isTableLineageLoading || isLineageLoading);
  
  // Check if we have data to display
  const hasData = lineageData.nodes.length > 0;
  
  return (
    <div
      style={{
        minHeight: 520,
        background: theme.bg,
        borderRadius: 14,
        boxShadow: theme.shadow,
        display: "flex",
        flexDirection: "column",
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: theme.text }}>
          Data Lineage
        </h2>
        
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
            style={{
              padding: '6px 12px',
              backgroundColor: theme.bg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
            disabled={isLoading}
          >
            -
          </button>
          
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0 8px',
            fontSize: '0.9rem',
          }}>
            {Math.round(zoomLevel * 100)}%
          </span>
          
          <button
            onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
            style={{
              padding: '6px 12px',
              backgroundColor: theme.bg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
            disabled={isLoading}
          >
            +
          </button>
          
          <button
            onClick={() => setZoomLevel(1)}
            style={{
              padding: '6px 12px',
              backgroundColor: theme.bg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '0.9rem',
              marginLeft: 8,
            }}
            disabled={isLoading}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div style={{ 
          padding: 24, 
          textAlign: 'center', 
          backgroundColor: theme.card,
          borderRadius: 8,
          marginBottom: 24,
          border: `1px solid ${theme.border}`,
          height: 'calc(100vh - 300px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <p>Loading lineage data...</p>
        </div>
      )}

      {!isLoading && (
        <div style={{ display: 'flex', height: 'calc(100vh - 200px)', minHeight: 400 }}>
          {/* Lineage Graph */}
          <div style={{ 
            flex: 3, 
            backgroundColor: theme.card,
            borderRadius: 8,
            boxShadow: theme.shadow,
            padding: 16,
            overflowX: 'auto',
            overflowY: 'auto',
          }}>
            {/* Empty state */}
            {!hasData && path && path.length > 0 && (
              <div style={{ 
                padding: 24, 
                textAlign: 'center', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <p>No lineage data available for this table.</p>
              </div>
            )}

            {/* No selection state */}
            {!path && (
              <div style={{ 
                padding: 24, 
                textAlign: 'center', 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <p>Please select a table to view its lineage.</p>
              </div>
            )}

            {hasData && (
               <LineageGraph
                 lineageData={lineageData}
                 selectedNode={selectedNode}
                 setSelectedNode={setSelectedNode}
                 zoomLevel={zoomLevel}
                 viewMode={viewMode}
                 theme={theme}
               />
             )}
          </div>
          
          {/* Details Panel */}
          {hasData && (
            <div style={{ 
              flex: 1, 
              marginLeft: 16,
              display: 'flex',
              flexDirection: 'column',
            }}>
              <LineageDetails
                 selectedNode={selectedNode}
                 lineageData={lineageData}
                 viewMode={viewMode}
                 setViewMode={setViewMode}
                 theme={theme}
               />
               
               <LineageLegend theme={theme} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LineageTab;
