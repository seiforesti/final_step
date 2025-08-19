import React from "react";
import styled from "@emotion/styled";

interface ReviewCardProps {
  proposalSummary: string;
  reviewer: string;
  reviewStatus: string;
  onApprove: () => void;
  onReject: () => void;
  accent: string;
  textSecondary: string;
  disabledApprove: boolean;
  disabledReject: boolean;
  bg: string;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ variant = 'primary', theme }) => 
    variant === 'primary' 
      ? `
        background: ${theme.accent};
        color: white;
        border: none;
        &:hover:not(:disabled) {
          background: #E62E1B;
        }
      `
      : `
        background: white;
        color: ${theme.accent};
        border: 1.5px solid ${theme.accent};
        &:hover:not(:disabled) {
          background: #FFF5F5;
        }
      `
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ status }) => 
    status === 'approved' ? '#DCFCE7' :
    status === 'rejected' ? '#FEE2E2' : '#F3F4F6'};
  color: ${({ status }) => 
    status === 'approved' ? '#166534' :
    status === 'rejected' ? '#991B1B' : '#374151'};
  text-transform: capitalize;
`;

const ReviewCard: React.FC<ReviewCardProps> = ({
  proposalSummary,
  reviewer,
  reviewStatus,
  onApprove,
  onReject,
  accent,
  textSecondary,
  disabledApprove,
  disabledReject,
  bg,
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
          {proposalSummary}
        </div>
        <div style={{ 
          color: textSecondary, 
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span>Reviewed by: {reviewer}</span>
          <StatusBadge status={reviewStatus.toLowerCase()}>{reviewStatus}</StatusBadge>
        </div>
      </div>
    </div>
    <div style={{ 
      marginTop: 16, 
      display: "flex", 
      gap: 12,
      justifyContent: 'flex-end' 
    }}>
      <Button 
        variant="secondary" 
        onClick={onReject}
        disabled={disabledReject}
      >
        Reject
      </Button>
      <Button 
        variant="primary" 
        onClick={onApprove}
        disabled={disabledApprove}
      >
        Approve
      </Button>
    </div>
  </Card>
);

export default ReviewCard;
