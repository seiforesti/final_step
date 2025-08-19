import React, { useState } from "react";
import { SensitivityLabel } from "../../models/SensitivityLabel";

const theme = {
  bg: "#f7f7f8",
  card: "#fff",
  border: "#e0e0e0",
  accent: "#0072e5",
  text: "#222",
  textSecondary: "#666",
  shadow: "0 2px 12px #0001",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
  info: "#2196f3",
};

// Mock data for demonstration
const mockDataObject = {
  id: "db_123456",
  name: "customer_transactions",
  type: "database",
  path: "/data/finance/customer_transactions",
  owner: "finance_team",
  created_at: "2025-01-15T10:30:00Z",
  updated_at: "2025-06-20T14:45:00Z",
  description: "Contains all customer transaction records for financial analysis and reporting.",
  properties: {
    format: "parquet",
    size: "2.3 GB",
    rows: "15,432,678",
    columns: "24",
    partitions: "date, region",
  },
  tags: ["finance", "transactions", "customer_data"],
  sensitivity_label: {
    id: 2,
    name: "Confidential",
    description: "Contains sensitive business information that should be restricted to authorized personnel only.",
    color: "#f44336",
    created_at: "2024-12-01T09:00:00Z",
    updated_at: "2025-01-10T11:20:00Z",
    is_conditional: false,
    applies_to: "database,table,column",
  } as SensitivityLabel,
};

const DetailsTab: React.FC = () => {
  // In a real app, this would come from the route or context
  const [dataObject] = useState(mockDataObject);

  // Render a property row
  const renderPropertyRow = (label: string, value: string | React.ReactNode) => (
    <div style={{ 
      display: 'flex', 
      borderBottom: `1px solid ${theme.border}`,
      padding: '12px 0',
    }}>
      <div style={{ 
        width: '30%', 
        fontWeight: 600,
        color: theme.textSecondary,
        fontSize: '0.9rem',
      }}>
        {label}
      </div>
      <div style={{ 
        width: '70%',
        fontSize: '0.9rem',
      }}>
        {value}
      </div>
    </div>
  );

  // Render tags
  const renderTags = (tags: string[]) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {tags.map((tag, index) => (
        <span 
          key={index}
          style={{
            backgroundColor: theme.bg,
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: '0.8rem',
            color: theme.textSecondary,
            border: `1px solid ${theme.border}`,
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );

  // Render sensitivity label
  const renderSensitivityLabel = (label: SensitivityLabel) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: label.color,
      }} />
      <span style={{ fontWeight: 600 }}>{label.name}</span>
      {label.is_conditional && (
        <span style={{
          backgroundColor: theme.warning + '20',
          color: theme.warning,
          padding: '2px 6px',
          borderRadius: 4,
          fontSize: '0.7rem',
          fontWeight: 600,
        }}>
          CONDITIONAL
        </span>
      )}
    </div>
  );

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
          Object Details
        </h2>
        
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: theme.accent,
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Edit Details
        </button>
      </div>

      {/* Basic Information */}
      <div style={{ 
        background: theme.card, 
        borderRadius: 8, 
        padding: 16, 
        boxShadow: theme.shadow,
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Basic Information</h3>
        
        {renderPropertyRow("ID", dataObject.id)}
        {renderPropertyRow("Name", dataObject.name)}
        {renderPropertyRow("Type", dataObject.type)}
        {renderPropertyRow("Path", (
          <span style={{ fontFamily: 'monospace', backgroundColor: theme.bg, padding: '2px 4px' }}>
            {dataObject.path}
          </span>
        ))}
        {renderPropertyRow("Owner", dataObject.owner)}
        {renderPropertyRow("Created", new Date(dataObject.created_at).toLocaleString())}
        {renderPropertyRow("Updated", new Date(dataObject.updated_at).toLocaleString())}
        {renderPropertyRow("Description", dataObject.description)}
      </div>

      {/* Technical Properties */}
      <div style={{ 
        background: theme.card, 
        borderRadius: 8, 
        padding: 16, 
        boxShadow: theme.shadow,
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Technical Properties</h3>
        
        {Object.entries(dataObject.properties).map(([key, value]) => (
          renderPropertyRow(key.charAt(0).toUpperCase() + key.slice(1), value as string)
        ))}
      </div>

      {/* Tags */}
      <div style={{ 
        background: theme.card, 
        borderRadius: 8, 
        padding: 16, 
        boxShadow: theme.shadow,
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Tags</h3>
        {renderTags(dataObject.tags)}
      </div>

      {/* Sensitivity Label */}
      <div style={{ 
        background: theme.card, 
        borderRadius: 8, 
        padding: 16, 
        boxShadow: theme.shadow,
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Sensitivity Label</h3>
        
        {dataObject.sensitivity_label ? (
          <div>
            {renderPropertyRow("Label", renderSensitivityLabel(dataObject.sensitivity_label))}
            {renderPropertyRow("Description", dataObject.sensitivity_label.description || 'No description')}
            {renderPropertyRow("Created", new Date(dataObject.sensitivity_label.created_at).toLocaleString())}
            {renderPropertyRow("Updated", new Date(dataObject.sensitivity_label.updated_at).toLocaleString())}
            {renderPropertyRow("Applies To", dataObject.sensitivity_label.applies_to)}
            {dataObject.sensitivity_label.is_conditional && (
              renderPropertyRow("Condition", (
                <span style={{ fontFamily: 'monospace', backgroundColor: theme.bg, padding: '2px 4px' }}>
                  {dataObject.sensitivity_label.condition_expression || 'No condition expression'}
                </span>
              ))
            )}
          </div>
        ) : (
          <div style={{ color: theme.textSecondary }}>
            No sensitivity label assigned
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailsTab;
