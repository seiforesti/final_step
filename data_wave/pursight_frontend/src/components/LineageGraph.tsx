import React from 'react';
import { LineageNode, LineageData } from '../models/LineageNode';

interface LineageGraphProps {
  lineageData: LineageData;
  selectedNode: string | null;
  setSelectedNode: (id: string | null) => void;
  zoomLevel: number;
  viewMode: 'upstream' | 'downstream' | 'both';
  theme: any; // Theme object
}

const LineageGraph: React.FC<LineageGraphProps> = ({
  lineageData,
  selectedNode,
  setSelectedNode,
  zoomLevel,
  viewMode,
  theme
}) => {
  // Get node by ID
  const getNodeById = (id: string) => {
    return lineageData.nodes.find(node => node.id === id);
  };

  // Get node color based on type
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'source': return theme.info;
      case 'process': return theme.accent;
      case 'dataset': return theme.success;
      case 'model': return theme.warning;
      case 'output': return theme.error;
      default: return theme.textSecondary;
    }
  };

  // Get node status indicator
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'available': return { color: theme.success, label: 'Available' };
      case 'pending': return { color: theme.warning, label: 'Pending' };
      case 'running': return { color: theme.info, label: 'Running' };
      case 'completed': return { color: theme.success, label: 'Completed' };
      case 'scheduled': return { color: theme.accent, label: 'Scheduled' };
      case 'failed': return { color: theme.error, label: 'Failed' };
      default: return { color: theme.textSecondary, label: 'Unknown' };
    }
  };

  // Filter nodes based on view mode and selected node
  const getFilteredNodes = () => {
    if (viewMode === 'both') return lineageData.nodes;
    
    const nodeSet = new Set<string>();
    const queue: string[] = [];
    
    // Start with all nodes if no selection, otherwise start with selected node
    if (!selectedNode) {
      if (viewMode === 'upstream') {
        lineageData.nodes
          .filter(node => !lineageData.edges.some(edge => edge.from === node.id))
          .forEach(node => queue.push(node.id));
      } else { // downstream
        lineageData.nodes
          .filter(node => !lineageData.edges.some(edge => edge.to === node.id))
          .forEach(node => queue.push(node.id));
      }
    } else {
      queue.push(selectedNode);
    }
    
    // BFS to find connected nodes
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (nodeSet.has(currentId)) continue;
      
      nodeSet.add(currentId);
      
      if (viewMode === 'upstream') {
        lineageData.edges
          .filter(edge => edge.to === currentId)
          .forEach(edge => queue.push(edge.from));
      } else { // downstream
        lineageData.edges
          .filter(edge => edge.from === currentId)
          .forEach(edge => queue.push(edge.to));
      }
    }
    
    return lineageData.nodes.filter(node => nodeSet.has(node.id));
  };

  // Filter edges based on filtered nodes
  const getFilteredEdges = () => {
    const filteredNodes = getFilteredNodes();
    const nodeIds = new Set(filteredNodes.map(node => node.id));
    
    return lineageData.edges.filter(edge => 
      nodeIds.has(edge.from) && nodeIds.has(edge.to)
    );
  };

  // Render a node
  const renderNode = (node: LineageNode) => {
    const isSelected = selectedNode === node.id;
    const statusInfo = getStatusIndicator(node.status);
    
    return (
      <div 
        key={node.id}
        onClick={() => setSelectedNode(isSelected ? null : node.id)}
        style={{
          padding: '12px 16px',
          borderRadius: 8,
          backgroundColor: isSelected ? `${getNodeColor(node.type)}20` : theme.card,
          border: `2px solid ${isSelected ? getNodeColor(node.type) : theme.border}`,
          boxShadow: theme.shadow,
          cursor: 'pointer',
          minWidth: 160,
          maxWidth: 200,
          margin: '8px',
          position: 'relative',
          transition: 'all 0.2s ease',
          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <div style={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          backgroundColor: statusInfo.color,
          boxShadow: `0 0 4px ${statusInfo.color}`,
        }} />
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: 8,
        }}>
          <div style={{ 
            width: 12, 
            height: 12, 
            backgroundColor: getNodeColor(node.type),
            borderRadius: 3,
            marginRight: 8,
          }} />
          <span style={{ 
            fontWeight: 600, 
            fontSize: '0.9rem',
            textTransform: 'capitalize',
          }}>
            {node.type}
          </span>
        </div>
        
        <div style={{ 
          fontWeight: 500, 
          marginBottom: 4,
          wordBreak: 'break-word',
        }}>
          {node.label}
        </div>
        
        <div style={{ 
          fontSize: '0.8rem', 
          color: theme.textSecondary,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <span style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            backgroundColor: statusInfo.color,
            display: 'inline-block',
          }} />
          {statusInfo.label}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      transform: `scale(${zoomLevel})`,
      transformOrigin: 'top left',
      transition: 'transform 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 16,
      minWidth: 800,
      minHeight: 400,
    }}>
      {/* Simple lineage visualization */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24 }}>
        {getFilteredNodes().map(node => renderNode(node))}
      </div>
      
      <div style={{ 
        marginTop: 24, 
        color: theme.textSecondary,
        fontSize: '0.8rem',
        textAlign: 'center',
      }}>
        <p>This is a simplified visualization. In a real implementation, a proper graph visualization library would be used.</p>
        <p>Click on nodes to see details and filter the lineage view.</p>
      </div>
    </div>
  );
};

export default LineageGraph;