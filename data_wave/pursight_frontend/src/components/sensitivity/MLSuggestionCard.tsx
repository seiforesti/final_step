import React from "react";
import styled from "@emotion/styled";

interface MLSuggestionCardProps {
  label: string;
  confidence: number;
  reviewer?: string;
  onAccept: () => void;
  onReject: () => void;
  accent: string;
  bg: string;
  textSecondary: string;
}

const Card = styled.li<{ bg: string }>`
  margin-bottom: 16px;
  padding: 16px;
  background: ${({ bg }) => bg};
  border: 1px solid #E6E8EA;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #D1D5DB;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ variant = 'primary', theme }) => 
    variant === 'primary' 
      ? `
        background: ${theme.accent};
        color: white;
        border: none;
        &:hover {
          background: #E62E1B;
        }
      `
      : `
        background: white;
        color: ${theme.accent};
        border: 1.5px solid ${theme.accent};
        &:hover {
          background: #FFF5F5;
        }
      `
  }
`;

const ConfidenceBadge = styled.span<{ confidence: number }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ confidence }) => 
    confidence >= 0.9 ? '#DCFCE7' :
    confidence >= 0.7 ? '#FEF9C3' : '#FEE2E2'};
  color: ${({ confidence }) => 
    confidence >= 0.9 ? '#166534' :
    confidence >= 0.7 ? '#854D0E' : '#991B1B'};
`;

const MLSuggestionCard: React.FC<MLSuggestionCardProps> = ({
  label,
  confidence,
  reviewer,
  onAccept,
  onReject,
  accent,
  bg,
  textSecondary,
}) => (
  <Card bg={bg}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
      marginBottom: 12
    }}>
      <div>
        <div style={{ 
          fontWeight: 600, 
          fontSize: 16, 
          marginBottom: 8,
          color: '#111827'
        }}>
          {label}
        </div>
        <div style={{ 
          color: textSecondary, 
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span>Suggested by: {reviewer || "ML Model"}</span>
          <ConfidenceBadge confidence={confidence}>
            {Math.round(confidence * 100)}% Confidence
          </ConfidenceBadge>
        </div>
      </div>
    </div>
    {canManage && (
      <div style={{ 
        marginTop: 16, 
        display: "flex", 
        gap: 12,
        justifyContent: 'flex-end' 
      }}>
        <Button variant="secondary" onClick={onReject}>
          Reject
        </Button>
        <Button variant="primary" onClick={onAccept}>
          Accept
        </Button>
      </div>
    )}
  </Card>
);

export default MLSuggestionCard;
