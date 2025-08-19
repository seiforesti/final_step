import React, { useState } from "react";

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

// Mock data for quality metrics
const mockQualityData = {
  overallScore: 87,
  lastUpdated: "2025-06-20T14:45:00Z",
  metrics: [
    { name: "Completeness", score: 92, status: "passed", description: "Percentage of non-null values" },
    { name: "Accuracy", score: 85, status: "warning", description: "Percentage of values matching expected patterns" },
    { name: "Consistency", score: 90, status: "passed", description: "Consistency across related datasets" },
    { name: "Validity", score: 78, status: "warning", description: "Percentage of values conforming to business rules" },
    { name: "Uniqueness", score: 95, status: "passed", description: "Percentage of unique values where expected" },
    { name: "Timeliness", score: 82, status: "warning", description: "Data freshness and update frequency" },
  ],
  columnMetrics: [
    { 
      column: "customer_id", 
      dataType: "string", 
      nullCount: 0, 
      uniqueCount: 15432678, 
      min: null, 
      max: null, 
      issues: [],
      tests: [
        { name: "Not Null", status: "passed" },
        { name: "Unique", status: "passed" },
        { name: "Pattern Match", status: "passed" },
      ]
    },
    { 
      column: "transaction_date", 
      dataType: "timestamp", 
      nullCount: 0, 
      uniqueCount: 1095, 
      min: "2022-01-01", 
      max: "2024-12-31", 
      issues: [],
      tests: [
        { name: "Not Null", status: "passed" },
        { name: "Date Range", status: "passed" },
      ]
    },
    { 
      column: "amount", 
      dataType: "decimal", 
      nullCount: 127, 
      uniqueCount: 8976, 
      min: "0.01", 
      max: "9999.99", 
      issues: [
        { severity: "warning", message: "127 null values detected" },
        { severity: "warning", message: "15 values outside expected range" },
      ],
      tests: [
        { name: "Not Null", status: "failed" },
        { name: "Range Check", status: "warning" },
      ]
    },
    { 
      column: "category", 
      dataType: "string", 
      nullCount: 543, 
      uniqueCount: 24, 
      min: null, 
      max: null, 
      issues: [
        { severity: "warning", message: "543 null values detected" },
        { severity: "error", message: "12 invalid category values found" },
      ],
      tests: [
        { name: "Not Null", status: "failed" },
        { name: "Value Set", status: "failed" },
      ]
    },
    { 
      column: "region", 
      dataType: "string", 
      nullCount: 0, 
      uniqueCount: 8, 
      min: null, 
      max: null, 
      issues: [],
      tests: [
        { name: "Not Null", status: "passed" },
        { name: "Value Set", status: "passed" },
      ]
    },
  ],
  validationRuns: [
    { 
      id: "val-001", 
      timestamp: "2025-06-20T14:45:00Z", 
      status: "completed", 
      passedTests: 18, 
      failedTests: 3, 
      warningTests: 2 
    },
    { 
      id: "val-002", 
      timestamp: "2025-06-19T10:30:00Z", 
      status: "completed", 
      passedTests: 17, 
      failedTests: 4, 
      warningTests: 2 
    },
    { 
      id: "val-003", 
      timestamp: "2025-06-18T09:15:00Z", 
      status: "completed", 
      passedTests: 16, 
      failedTests: 5, 
      warningTests: 2 
    },
  ]
};

const QualityTab: React.FC = () => {
  const [qualityData] = useState(mockQualityData);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'columns' | 'history'>('overview');

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed': return theme.success;
      case 'warning': return theme.warning;
      case 'failed': return theme.error;
      default: return theme.textSecondary;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'error': return theme.error;
      case 'warning': return theme.warning;
      case 'info': return theme.info;
      default: return theme.textSecondary;
    }
  };

  // Render quality score gauge
  const renderQualityGauge = (score: number) => {
    let color = theme.error;
    if (score >= 90) color = theme.success;
    else if (score >= 70) color = theme.warning;

    return (
      <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto' }}>
        {/* Background circle */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `conic-gradient(${theme.border} 0%, ${theme.border} 100%)`,
        }} />
        
        {/* Foreground circle (score) */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `conic-gradient(${color} 0%, ${color} ${score}%, transparent ${score}%, transparent 100%)`,
          clipPath: 'circle(50% at 50% 50%)',
        }} />
        
        {/* Inner circle (white background) */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          width: '70%',
          height: '70%',
          borderRadius: '50%',
          background: theme.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '1.5rem',
          color: color,
        }}>
          {score}
        </div>
      </div>
    );
  };

  // Render metric card
  const renderMetricCard = (metric: typeof qualityData.metrics[0]) => {
    const statusColor = getStatusColor(metric.status);
    
    return (
      <div 
        key={metric.name}
        style={{
          backgroundColor: theme.card,
          borderRadius: 8,
          boxShadow: theme.shadow,
          padding: 16,
          border: `1px solid ${theme.border}`,
          width: 'calc(33.33% - 16px)',
          minWidth: 200,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{metric.name}</h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 4,
            fontSize: '0.8rem',
            color: statusColor,
            textTransform: 'capitalize',
          }}>
            <span style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: statusColor,
            }} />
            {metric.status}
          </div>
        </div>
        
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: statusColor, marginBottom: 8 }}>
          {metric.score}%
        </div>
        
        <div style={{ fontSize: '0.8rem', color: theme.textSecondary }}>
          {metric.description}
        </div>
      </div>
    );
  };

  // Render column row
  const renderColumnRow = (column: typeof qualityData.columnMetrics[0]) => {
    const hasIssues = column.issues.length > 0;
    const isSelected = selectedColumn === column.column;
    
    return (
      <div key={column.column}>
        <div 
          onClick={() => setSelectedColumn(isSelected ? null : column.column)}
          style={{
            display: 'flex',
            padding: '12px 16px',
            borderBottom: `1px solid ${theme.border}`,
            backgroundColor: isSelected ? `${theme.accent}10` : 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          <div style={{ flex: 2, fontWeight: isSelected ? 600 : 400 }}>{column.column}</div>
          <div style={{ flex: 1 }}>{column.dataType}</div>
          <div style={{ flex: 1, textAlign: 'center' }}>{column.nullCount}</div>
          <div style={{ flex: 1, textAlign: 'center' }}>{column.uniqueCount}</div>
          <div style={{ flex: 1 }}>
            {hasIssues ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4,
                color: column.issues.some(i => i.severity === 'error') ? theme.error : theme.warning,
                fontSize: '0.8rem',
              }}>
                <span style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: column.issues.some(i => i.severity === 'error') ? theme.error : theme.warning,
                }} />
                {column.issues.length} {column.issues.length === 1 ? 'issue' : 'issues'}
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4,
                color: theme.success,
                fontSize: '0.8rem',
              }}>
                <span style={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: theme.success,
                }} />
                No issues
              </div>
            )}
          </div>
        </div>
        
        {isSelected && (
          <div style={{ 
            padding: 16, 
            backgroundColor: `${theme.accent}05`,
            borderBottom: `1px solid ${theme.border}`,
          }}>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Column Details</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ minWidth: 120 }}>
                  <div style={{ fontSize: '0.8rem', color: theme.textSecondary }}>Data Type</div>
                  <div>{column.dataType}</div>
                </div>
                
                <div style={{ minWidth: 120 }}>
                  <div style={{ fontSize: '0.8rem', color: theme.textSecondary }}>Null Count</div>
                  <div>{column.nullCount}</div>
                </div>
                
                <div style={{ minWidth: 120 }}>
                  <div style={{ fontSize: '0.8rem', color: theme.textSecondary }}>Unique Count</div>
                  <div>{column.uniqueCount}</div>
                </div>
                
                {column.min !== null && (
                  <div style={{ minWidth: 120 }}>
                    <div style={{ fontSize: '0.8rem', color: theme.textSecondary }}>Min Value</div>
                    <div>{column.min}</div>
                  </div>
                )}
                
                {column.max !== null && (
                  <div style={{ minWidth: 120 }}>
                    <div style={{ fontSize: '0.8rem', color: theme.textSecondary }}>Max Value</div>
                    <div>{column.max}</div>
                  </div>
                )}
              </div>
            </div>
            
            {column.issues.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Issues</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {column.issues.map((issue, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: `${getSeverityColor(issue.severity)}10`,
                        borderLeft: `3px solid ${getSeverityColor(issue.severity)}`,
                        borderRadius: 4,
                        fontSize: '0.9rem',
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 4,
                        fontSize: '0.8rem',
                        color: getSeverityColor(issue.severity),
                        textTransform: 'capitalize',
                        marginBottom: 4,
                      }}>
                        <span style={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: getSeverityColor(issue.severity),
                        }} />
                        {issue.severity}
                      </div>
                      {issue.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>Validation Tests</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {column.tests.map((test, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: theme.bg,
                      borderRadius: 4,
                      fontSize: '0.9rem',
                    }}
                  >
                    <div>{test.name}</div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 4,
                      color: getStatusColor(test.status),
                      textTransform: 'capitalize',
                    }}>
                      <span style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        backgroundColor: getStatusColor(test.status),
                      }} />
                      {test.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render validation run card
  const renderValidationRun = (run: typeof qualityData.validationRuns[0], index: number) => {
    const totalTests = run.passedTests + run.failedTests + run.warningTests;
    const passRate = Math.round((run.passedTests / totalTests) * 100);
    
    let statusColor = theme.success;
    if (run.failedTests > 0) statusColor = theme.error;
    else if (run.warningTests > 0) statusColor = theme.warning;
    
    return (
      <div 
        key={run.id}
        style={{
          backgroundColor: theme.card,
          borderRadius: 8,
          boxShadow: theme.shadow,
          padding: 16,
          border: `1px solid ${theme.border}`,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
              Validation Run #{index + 1}
            </h3>
            <div style={{ fontSize: '0.8rem', color: theme.textSecondary }}>
              {new Date(run.timestamp).toLocaleString()}
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 4,
            fontSize: '0.8rem',
            color: statusColor,
            textTransform: 'capitalize',
            padding: '4px 8px',
            backgroundColor: `${statusColor}10`,
            borderRadius: 4,
          }}>
            <span style={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: statusColor,
            }} />
            {run.status}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: theme.textSecondary }}>Pass Rate</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{passRate}%</div>
          </div>
          
          <div>
            <div style={{ fontSize: '0.8rem', color: theme.textSecondary }}>Total Tests</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{totalTests}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ 
            flex: 1, 
            padding: '8px 12px', 
            backgroundColor: `${theme.success}10`,
            borderRadius: 4,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: theme.success }}>{run.passedTests}</div>
            <div style={{ fontSize: '0.8rem', color: theme.success }}>Passed</div>
          </div>
          
          <div style={{ 
            flex: 1, 
            padding: '8px 12px', 
            backgroundColor: `${theme.warning}10`,
            borderRadius: 4,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: theme.warning }}>{run.warningTests}</div>
            <div style={{ fontSize: '0.8rem', color: theme.warning }}>Warnings</div>
          </div>
          
          <div style={{ 
            flex: 1, 
            padding: '8px 12px', 
            backgroundColor: `${theme.error}10`,
            borderRadius: 4,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: theme.error }}>{run.failedTests}</div>
            <div style={{ fontSize: '0.8rem', color: theme.error }}>Failed</div>
          </div>
        </div>
      </div>
    );
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: 24,
              backgroundColor: theme.card,
              borderRadius: 8,
              boxShadow: theme.shadow,
              padding: 24,
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Overall Quality Score</h3>
                <div style={{ fontSize: '0.9rem', color: theme.textSecondary, marginBottom: 16 }}>
                  Last updated: {new Date(qualityData.lastUpdated).toLocaleString()}
                </div>
                {renderQualityGauge(qualityData.overallScore)}
              </div>
              
              <div style={{ maxWidth: 400 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Summary</h3>
                <div style={{ fontSize: '0.9rem', marginBottom: 16 }}>
                  <p>The data quality assessment shows an overall score of <strong>{qualityData.overallScore}%</strong>, indicating good quality with some areas for improvement.</p>
                  <p>Key strengths include high completeness and uniqueness scores. Areas for improvement include validity and timeliness metrics.</p>
                </div>
                
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
                  Run New Validation
                </button>
              </div>
            </div>
            
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Quality Metrics</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              {qualityData.metrics.map(metric => renderMetricCard(metric))}
            </div>
            
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Recent Validation Runs</h3>
            {qualityData.validationRuns.slice(0, 2).map((run, index) => renderValidationRun(run, index))}
          </div>
        );
        
      case 'columns':
        return (
          <div>
            <div style={{ 
              backgroundColor: theme.card,
              borderRadius: 8,
              boxShadow: theme.shadow,
              overflow: 'hidden',
            }}>
              <div style={{ 
                display: 'flex', 
                padding: '12px 16px', 
                backgroundColor: theme.bg,
                borderBottom: `1px solid ${theme.border}`,
                fontWeight: 600,
              }}>
                <div style={{ flex: 2 }}>Column Name</div>
                <div style={{ flex: 1 }}>Data Type</div>
                <div style={{ flex: 1, textAlign: 'center' }}>Null Count</div>
                <div style={{ flex: 1, textAlign: 'center' }}>Unique Count</div>
                <div style={{ flex: 1 }}>Status</div>
              </div>
              
              {qualityData.columnMetrics.map(column => renderColumnRow(column))}
            </div>
          </div>
        );
        
      case 'history':
        return (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Validation History</h3>
            {qualityData.validationRuns.map((run, index) => renderValidationRun(run, index))}
          </div>
        );
        
      default:
        return null;
    }
  };

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
          Data Quality
        </h2>
      </div>

      <div style={{ display: 'flex', marginBottom: 24, borderBottom: `1px solid ${theme.border}` }}>
        {(['overview', 'columns', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: activeTab === tab ? theme.accent : theme.text,
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab ? theme.accent : 'transparent'}`,
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab ? 600 : 400,
              transition: 'all 0.2s',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
};

export default QualityTab;
