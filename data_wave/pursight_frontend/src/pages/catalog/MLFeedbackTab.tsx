import React, { useState } from 'react';
import { useMLFeedback, useSubmitMLFeedback, useMLFeedbackAnalytics, useMLConfusionMatrix } from '../../api/mlFeedback';
import { MLFeedback } from '../../models/MLFeedback';
import { format } from 'date-fns';

// Styled components for the UI
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

const MLFeedbackTab: React.FC = () => {
  // State for filters
  const [filters, setFilters] = useState({
    userId: '',
    labelId: '',
    dateFrom: '',
    dateTo: '',
  });

  // Fetch ML feedback data
  const { data: feedbackData, isLoading: isLoadingFeedback } = useMLFeedback();
  
  // Fetch analytics data
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useMLFeedbackAnalytics(filters);
  
  // Fetch confusion matrix data
  const { data: confusionMatrix, isLoading: isLoadingMatrix } = useMLConfusionMatrix({
    labelId: filters.labelId,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useSubmitMLFeedback();

  // Handle feedback submission
  const handleSubmitFeedback = (feedback: Partial<MLFeedback>) => {
    submitFeedbackMutation.mutate(feedback);
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      userId: '',
      labelId: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  // Render confusion matrix
  const renderConfusionMatrix = () => {
    if (!confusionMatrix || !confusionMatrix.labels || confusionMatrix.labels.length === 0) {
      return <div>No confusion matrix data available</div>;
    }

    return (
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 10 }}>Confusion Matrix</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: 8, border: `1px solid ${theme.border}` }}>Actual \ Predicted</th>
                {confusionMatrix.labels.map(label => (
                  <th key={label} style={{ padding: 8, border: `1px solid ${theme.border}` }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {confusionMatrix.matrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td style={{ padding: 8, fontWeight: 600, border: `1px solid ${theme.border}` }}>
                    {confusionMatrix.labels[rowIndex]}
                  </td>
                  {row.map((cell, cellIndex) => (
                    <td 
                      key={cellIndex} 
                      style={{ 
                        padding: 8, 
                        border: `1px solid ${theme.border}`,
                        backgroundColor: rowIndex === cellIndex ? '#e3f2fd' : 'transparent',
                        textAlign: 'center'
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render analytics cards
  const renderAnalyticsCards = () => {
    if (!analyticsData) return null;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 20 }}>
        <AnalyticsCard 
          title="Total Feedback" 
          value={analyticsData.totalFeedback} 
          color={theme.info}
        />
        <AnalyticsCard 
          title="Unique Users" 
          value={analyticsData.uniqueUsers} 
          color={theme.accent}
        />
        <AnalyticsCard 
          title="Unique Labels" 
          value={analyticsData.uniqueLabels} 
          color={theme.warning}
        />
        <AnalyticsCard 
          title="Correct Predictions" 
          value={analyticsData.correctPredictions} 
          color={theme.success}
        />
        <AnalyticsCard 
          title="Incorrect Predictions" 
          value={analyticsData.incorrectPredictions} 
          color={theme.error}
        />
        <AnalyticsCard 
          title="Accuracy" 
          value={`${(analyticsData.accuracy * 100).toFixed(1)}%`} 
          color={theme.accent}
        />
      </div>
    );
  };

  // Analytics Card component
  const AnalyticsCard = ({ title, value, color }: { title: string, value: number | string, color: string }) => (
    <div style={{ 
      background: theme.card, 
      borderRadius: 8, 
      padding: 16, 
      boxShadow: theme.shadow,
      borderTop: `3px solid ${color}`,
      minWidth: 160,
      flex: '1 1 0'
    }}>
      <div style={{ fontSize: '0.9rem', color: theme.textSecondary, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
    </div>
  );

  // Render feedback table
  const renderFeedbackTable = () => {
    if (!feedbackData || feedbackData.length === 0) {
      return <div style={{ marginTop: 20, color: theme.textSecondary }}>No feedback data available</div>;
    }

    return (
      <div style={{ marginTop: 20, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: theme.bg }}>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.border}` }}>ID</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.border}` }}>Label ID</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.border}` }}>User</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.border}` }}>Prediction</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.border}` }}>Feedback</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: `1px solid ${theme.border}` }}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {feedbackData.map((feedback) => (
              <tr key={feedback.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: 12 }}>{feedback.id}</td>
                <td style={{ padding: 12 }}>{feedback.labelId}</td>
                <td style={{ padding: 12 }}>{feedback.userId}</td>
                <td style={{ padding: 12 }}>{feedback.prediction}</td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    backgroundColor: feedback.feedback === feedback.prediction ? '#e8f5e9' : '#ffebee',
                    color: feedback.feedback === feedback.prediction ? '#2e7d32' : '#c62828',
                    fontSize: '0.85rem',
                  }}>
                    {feedback.feedback}
                  </span>
                </td>
                <td style={{ padding: 12 }}>{format(new Date(feedback.createdAt), 'MMM dd, yyyy HH:mm')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: 24, color: theme.text }}>
        ML Feedback
      </h2>

      {/* Filters */}
      <div style={{ 
        background: theme.card, 
        borderRadius: 8, 
        padding: 16, 
        boxShadow: theme.shadow,
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Filters</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: theme.textSecondary }}>
              User ID
            </label>
            <input
              type="text"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: `1px solid ${theme.border}`,
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: theme.textSecondary }}>
              Label ID
            </label>
            <input
              type="text"
              name="labelId"
              value={filters.labelId}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: `1px solid ${theme.border}`,
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: theme.textSecondary }}>
              Date From
            </label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: `1px solid ${theme.border}`,
                fontSize: '0.9rem',
              }}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: theme.textSecondary }}>
              Date To
            </label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 4,
                border: `1px solid ${theme.border}`,
                fontSize: '0.9rem',
              }}
            />
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={resetFilters}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: `1px solid ${theme.border}`,
              borderRadius: 4,
              marginRight: 8,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      <div style={{ 
        background: theme.card, 
        borderRadius: 8, 
        padding: 16, 
        boxShadow: theme.shadow,
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Analytics</h3>
        {isLoadingAnalytics ? (
          <div>Loading analytics...</div>
        ) : (
          renderAnalyticsCards()
        )}
      </div>

      {/* Confusion Matrix */}
      <div style={{ 
        background: theme.card, 
        borderRadius: 8, 
        padding: 16, 
        boxShadow: theme.shadow,
        marginBottom: 24
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Confusion Matrix</h3>
        {isLoadingMatrix ? (
          <div>Loading confusion matrix...</div>
        ) : (
          renderConfusionMatrix()
        )}
      </div>

      {/* Feedback Data Table */}
      <div style={{ 
        background: theme.card, 
        borderRadius: 8, 
        padding: 16, 
        boxShadow: theme.shadow,
        flex: 1
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Feedback Data</h3>
        {isLoadingFeedback ? (
          <div>Loading feedback data...</div>
        ) : (
          renderFeedbackTable()
        )}
      </div>
    </div>
  );
};

export default MLFeedbackTab;