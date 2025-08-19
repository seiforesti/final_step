import React from "react";
import styled from "@emotion/styled";
import { FiCheck, FiX, FiEye, FiCalendar, FiUser, FiTag, FiFileText, FiClock, FiAlertCircle, FiMessageSquare } from "react-icons/fi";

interface ProposalCardProps {
  labelId: string;
  proposedBy: string;
  status: string;
  objectType?: string;
  objectId?: string;
  justification?: string;
  createdAt?: string;
  expiryDate?: string;
  reviewCycleDays?: number;
  onApprove: () => void;
  onReject: () => void;
  onGoToReview: () => void;
  onClick?: () => void;
  accent: string;
  textSecondary: string;
  bg: string;
  disabledApprove: boolean;
  disabledReject: boolean;
  canApprove?: boolean;
  canReview?: boolean;
}

const Card = styled.li<{ bg: string; status: string; isExpiring?: boolean }>`
  margin-bottom: 16px;
  padding: 20px;
  background: ${({ bg }) => bg};
  border-left: 4px solid ${({ status, isExpiring }) => 
    isExpiring && status === 'pending' ? '#DC2626' :
    status === 'approved' ? '#00A300' :
    status === 'rejected' ? '#FF3621' :
    status === 'expired' ? '#6B7280' : '#F59E0B'};
  border-top: 1px solid #E6E8EA;
  border-right: 1px solid #E6E8EA;
  border-bottom: 1px solid #E6E8EA;
  border-radius: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  position: relative;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  ${({ isExpiring, status }) => isExpiring && status === 'pending' && `
    &:after {
      content: '';
      position: absolute;
      top: -6px;
      right: -6px;
      width: 12px;
      height: 12px;
      background: #DC2626;
      border-radius: 50%;
      border: 2px solid white;
    }
  `}
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'text' }>`
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
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
      `
      : variant === 'secondary'
      ? `
        background: white;
        color: ${theme.accent};
        border: 1.5px solid ${theme.accent};
        &:hover:not(:disabled) {
          background: #FFF5F5;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
      `
      : `
        background: transparent;
        color: ${theme.accent};
        border: none;
        padding: 4px 8px;
        &:hover:not(:disabled) {
          color: #E62E1B;
          text-decoration: underline;
        }
      `
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ status }) => 
    status === 'approved' ? '#DCFCE7' :
    status === 'rejected' ? '#FEE2E2' :
    status === 'expired' ? '#F3F4F6' : '#FEF3C7'};
  color: ${({ status }) => 
    status === 'approved' ? '#166534' :
    status === 'rejected' ? '#991B1B' :
    status === 'expired' ? '#6B7280' : '#854D0E'};
  text-transform: capitalize;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #6B7280;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const CardTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardContent = styled.div`
  margin-bottom: 16px;
`;

const ReviewCycleIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #F0F9FF;
  border-radius: 6px;
  font-size: 13px;
  color: #0369A1;
  
  svg {
    flex-shrink: 0;
  }
`;

const JustificationText = styled.div`
  font-size: 14px;
  color: #4B5563;
  background: #F9FAFB;
  padding: 12px;
  border-radius: 6px;
  border-left: 3px solid #E5E7EB;
  margin-top: 12px;
  max-height: 80px;
  overflow-y: hidden;
  white-space: pre-wrap;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 24px;
    background: linear-gradient(to bottom, rgba(249, 250, 251, 0), rgba(249, 250, 251, 1));
    pointer-events: none;
  }
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  align-items: center;
  margin-top: 16px;
  border-top: 1px solid #F3F4F6;
  padding-top: 16px;
`;

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const ProposalCard: React.FC<ProposalCardProps> = ({
  labelId,
  proposedBy,
  status,
  objectType,
  objectId,
  justification,
  createdAt,
  expiryDate,
  reviewCycleDays,
  onApprove,
  onReject,
  onGoToReview,
  onClick,
  accent,
  textSecondary,
  bg,
  disabledApprove,
  disabledReject,
  canApprove = false,
  canReview = false,
}) => {
  const isExpiring = expiryDate && new Date(expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  return (
    <Card 
      bg={bg} 
      status={status.toLowerCase()}
      isExpiring={isExpiring}
      onClick={(e) => {
        if (onClick) onClick();
      }}
    >
      <CardHeader>
        <div>
          <CardTitle>
            <FiTag size={16} color={accent} />
            {labelId}
          </CardTitle>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap'
          }}>
            <StatusBadge status={status.toLowerCase()}>
              {status === 'approved' && <FiCheck size={12} />}
              {status === 'rejected' && <FiX size={12} />}
              {status === 'expired' && <FiClock size={12} />}
              {status}
            </StatusBadge>
            {isExpiring && status === 'pending' && (
              <StatusBadge status="expired">
                <FiAlertCircle size={12} />
                Expiring soon
              </StatusBadge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <InfoRow>
          <FiUser size={14} />
          <span>Proposed by: <strong>{proposedBy}</strong></span>
        </InfoRow>
        
        {objectType && objectId && (
          <InfoRow>
            <FiFileText size={14} />
            <span>Object: <strong>{objectType}/{objectId}</strong></span>
          </InfoRow>
        )}
        
        {createdAt && (
          <InfoRow>
            <FiCalendar size={14} />
            <span>Created: <strong>{formatDate(createdAt)}</strong></span>
          </InfoRow>
        )}
        
        {expiryDate && (
          <InfoRow>
            <FiClock size={14} />
            <span>Expires: <strong>{formatDate(expiryDate)}</strong></span>
          </InfoRow>
        )}
        
        {justification && (
          <>
            <InfoRow>
              <FiMessageSquare size={14} />
              <span>Justification:</span>
            </InfoRow>
            <JustificationText>
              {justification}
            </JustificationText>
          </>
        )}
        
        {reviewCycleDays && (
          <ReviewCycleIndicator>
            <FiClock size={16} />
            <span>Review cycle: <strong>{reviewCycleDays} days</strong></span>
          </ReviewCycleIndicator>
        )}
      </CardContent>
      
      <CardFooter>
        {canReview && (
          <Button 
            variant="text" 
            onClick={(e) => {
              e.stopPropagation();
              onGoToReview();
            }}
          >
            <FiEye size={16} /> View Details
          </Button>
        )}
        {canApprove && (
          <>
            <Button 
              variant="secondary" 
              onClick={(e) => {
                e.stopPropagation();
                onReject();
              }}
              disabled={disabledReject}
            >
              <FiX size={16} /> Reject
            </Button>
            <Button 
              variant="primary" 
              onClick={(e) => {
                e.stopPropagation();
                onApprove();
              }}
              disabled={disabledApprove}
            >
              <FiCheck size={16} /> Approve
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProposalCard;
