import React from 'react';

interface LineageLegendProps {
  theme: any; // Theme object
}

const LineageLegend: React.FC<LineageLegendProps> = ({ theme }) => {
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
        Legend
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {['source', 'process', 'dataset', 'model', 'output'].map(type => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 12, 
              height: 12, 
              backgroundColor: getNodeColor(type),
              borderRadius: 3,
            }} />
            <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{type}</span>
          </div>
        ))}
      </div>
      
      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: '16px 0 8px 0' }}>
        Status
      </h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {['available', 'pending', 'running', 'completed', 'scheduled', 'failed'].map(status => {
          const statusInfo = getStatusIndicator(status);
          return (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 12, 
                height: 12, 
                backgroundColor: statusInfo.color,
                borderRadius: '50%',
              }} />
              <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LineageLegend;