import React from 'react';
import { LineageNode, LineageData } from '../models/LineageNode';

interface LineageDetailsProps {
  selectedNode: string | null;
  lineageData: LineageData;
  viewMode: 'upstream' | 'downstream' | 'both';
  setViewMode: (mode: 'upstream' | 'downstream' | 'both') => void;
  theme: any; // Theme object
}

const LineageDetails: React.FC<LineageDetailsProps> = ({
  selectedNode,
  lineageData,
  viewMode,
  setViewMode,
  theme
}) => {
  // Get node by ID
  const getNodeById = (id: string) => {
    return lineageData.nodes.find(node => node.id === id);
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

  if (!selectedNode) {
    return (
      <div style={{
        backgroundColor: theme.card,
        borderRadius: 8,
        boxShadow: theme.shadow,
        padding: 16,
        marginTop: 16,
        border: `1px solid ${theme.border}`,
        color: theme.textSecondary,
        fontSize: '0.9rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
      }}>
        <div style={{ fontSize: '2rem', marginBottom: 16 }}>👆</div>
        <p>Select a node to view details</p>
        <p>You can filter the view to show upstream or downstream lineage</p>
      </div>
    );
  }
  
  const node = getNodeById(selectedNode);
  if (!node) return null;
  
  const statusInfo = getStatusIndicator(node.status);
  
  // Count incoming and outgoing edges
  const incomingEdges = lineageData.edges.filter(edge => edge.to === node.id);
  const outgoingEdges = lineageData.edges.filter(edge => edge.from === node.id);
  
  return (
    <div style={{
      backgroundColor: theme.card,
      borderRadius: 8,
      boxShadow: theme.shadow,
      padding: 16,
      marginTop: 16,
      border: `1px solid ${theme.border}`,
    }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>
        Node Details
      </h3>
      
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 500, color: theme.textSecondary }}>ID:</span>
          <span style={{ fontWeight: 400 }}>{node.id}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 500, color: theme.textSecondary }}>Label:</span>
          <span style={{ fontWeight: 400 }}>{node.label}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 500, color: theme.textSecondary }}>Type:</span>
          <span style={{ fontWeight: 400, textTransform: 'capitalize' }}>{node.type}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 500, color: theme.textSecondary }}>Status:</span>
          <span style={{ 
            fontWeight: 400, 
            display: 'flex', 
            alignItems: 'center',
            gap: 6,
          }}>
            <span style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: statusInfo.color,
              display: 'inline-block',
            }} />
            {statusInfo.label}
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 500, color: theme.textSecondary }}>Incoming Edges:</span>
          <span style={{ fontWeight: 400 }}>{incomingEdges.length}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontWeight: 500, color: theme.textSecondary }}>Outgoing Edges:</span>
          <span style={{ fontWeight: 400 }}>{outgoingEdges.length}</span>
        </div>
      </div>
      
      <div style={{ marginTop: 16 }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>
          Filter View
        </h4>
        
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => setViewMode('upstream')}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: `1px solid ${theme.border}`,
              backgroundColor: viewMode === 'upstream' ? theme.accent : theme.card,
              color: viewMode === 'upstream' ? 'white' : theme.text,
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            Upstream
          </button>
          
          <button 
            onClick={() => setViewMode('both')}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: `1px solid ${theme.border}`,
              backgroundColor: viewMode === 'both' ? theme.accent : theme.card,
              color: viewMode === 'both' ? 'white' : theme.text,
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            Both
          </button>
          
          <button 
            onClick={() => setViewMode('downstream')}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: `1px solid ${theme.border}`,
              backgroundColor: viewMode === 'downstream' ? theme.accent : theme.card,
              color: viewMode === 'downstream' ? 'white' : theme.text,
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            Downstream
          </button>
        </div>
      </div>
    </div>
  );
};

export default LineageDetails;