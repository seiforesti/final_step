import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiCheck, FiCalendar, FiUser, FiTag, FiFileText, FiClock, FiEdit2, FiTrash2, FiMessageSquare, FiActivity, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import { purviewTheme } from '../../theme/purviewTheme';
import { LabelProposal } from '../../models/LabelProposal';
import { LabelReview } from '../../models/LabelReview';
import { useProposalReviews } from '../../api/reviews';

interface DetailPanelProps {
  proposal: LabelProposal;
  labelName: string;
  proposedByUser: string;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canApprove: boolean;
  disabledApprove: boolean;
  disabledReject: boolean;
}

const PanelContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
  height: 100vh;
  background: white;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  transform: translateX(0);
  overflow-y: auto;
`;

const PanelHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${purviewTheme.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
`;

const PanelTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${purviewTheme.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${purviewTheme.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
    color: ${purviewTheme.text};
  }
`;

const PanelContent = styled.div`
  padding: 24px;
  flex: 1;
  overflow-y: auto;
`;

const PanelFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${purviewTheme.border};
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  position: sticky;
  bottom: 0;
  background: white;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'text' | 'danger' }>`
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
      : variant === 'danger'
      ? `
        background: white;
        color: #DC2626;
        border: 1.5px solid #DC2626;
        &:hover:not(:disabled) {
          background: #FEF2F2;
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

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${purviewTheme.text};
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: ${purviewTheme.textSecondary};
`;

const InfoLabel = styled.div`
  min-width: 120px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoValue = styled.div`
  color: ${purviewTheme.text};
  flex: 1;
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

const JustificationBox = styled.div`
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-left: 3px solid ${purviewTheme.accent};
  border-radius: 6px;
  padding: 16px;
  margin-top: 8px;
  white-space: pre-wrap;
  color: ${purviewTheme.text};
  font-size: 14px;
`;

const Timeline = styled.div`
  margin-top: 16px;
`;

const TimelineItem = styled.div`
  display: flex;
  margin-bottom: 16px;
  position: relative;
  padding-left: 28px;
  
  &:before {
    content: '';
    position: absolute;
    left: 8px;
    top: 8px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${purviewTheme.accent};
  }
  
  &:not(:last-child):after {
    content: '';
    position: absolute;
    left: 11px;
    top: 20px;
    width: 2px;
    height: calc(100% - 8px);
    background: #E5E7EB;
  }
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const TimelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const TimelineTitle = styled.div`
  font-weight: 500;
  color: ${purviewTheme.text};
  font-size: 14px;
`;

const TimelineDate = styled.div`
  color: ${purviewTheme.textSecondary};
  font-size: 12px;
`;

const TimelineDescription = styled.div`
  color: ${purviewTheme.textSecondary};
  font-size: 13px;
`;

const ReviewHistorySection = styled.div`
  margin-top: 24px;
`;

const ReviewItem = styled.div`
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  margin-bottom: 16px;
  background: white;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ReviewerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: ${purviewTheme.text};
`;

const ReviewStatus = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ status }) => 
    status === 'approved' ? '#166534' :
    status === 'rejected' ? '#991B1B' : 
    '#6B7280'};
`;

const ReviewDate = styled.div`
  font-size: 12px;
  color: ${purviewTheme.textSecondary};
  margin-top: 4px;
`;

const ReviewNote = styled.div`
  font-size: 14px;
  color: ${purviewTheme.text};
  background: #F9FAFB;
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
  white-space: pre-wrap;
`;

const NoReviewsMessage = styled.div`
  text-align: center;
  padding: 24px;
  color: ${purviewTheme.textSecondary};
  font-style: italic;
  background: #F9FAFB;
  border-radius: 8px;
  border: 1px dashed #E5E7EB;
`;

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const DetailPanel: React.FC<DetailPanelProps> = ({
  proposal,
  labelName,
  proposedByUser,
  onClose,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  canApprove,
  disabledApprove,
  disabledReject
}) => {
  // Fetch review history for this proposal
  const { data: reviews = [], isLoading: isLoadingReviews } = useProposalReviews(proposal.id);
  
  // Timeline events including proposal creation and status changes
  const timelineEvents = [
    {
      id: 1,
      title: 'Proposal Created',
      description: `${proposedByUser} created this proposal`,
      date: proposal.created_at
    },
    ...(proposal.status === 'approved' ? [{
      id: 2,
      title: 'Proposal Approved',
      description: 'The proposal was approved',
      date: proposal.updated_at
    }] : []),
    ...(proposal.status === 'rejected' ? [{
      id: 2,
      title: 'Proposal Rejected',
      description: 'The proposal was rejected',
      date: proposal.updated_at
    }] : []),
  ];

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>Proposal Details</PanelTitle>
        <CloseButton onClick={onClose}>
          <FiX size={20} />
        </CloseButton>
      </PanelHeader>
      
      <PanelContent>
        <Section>
          <SectionTitle>
            <FiTag size={16} /> Label Information
          </SectionTitle>
          
          <InfoRow>
            <InfoLabel>Label</InfoLabel>
            <InfoValue>{labelName}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>Status</InfoLabel>
            <InfoValue>
              <StatusBadge status={proposal.status.toLowerCase()}>
                {proposal.status === 'approved' && <FiCheck size={12} />}
                {proposal.status === 'rejected' && <FiX size={12} />}
                {proposal.status === 'expired' && <FiClock size={12} />}
                {proposal.status}
              </StatusBadge>
            </InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>
              <FiUser size={14} /> Proposed By
            </InfoLabel>
            <InfoValue>{proposedByUser}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>
              <FiFileText size={14} /> Object
            </InfoLabel>
            <InfoValue>{proposal.object_type}/{proposal.object_id}</InfoValue>
          </InfoRow>
          
          <InfoRow>
            <InfoLabel>
              <FiCalendar size={14} /> Created
            </InfoLabel>
            <InfoValue>{formatDate(proposal.created_at)}</InfoValue>
          </InfoRow>
          
          {proposal.expiry_date && (
            <InfoRow>
              <InfoLabel>
                <FiClock size={14} /> Expires
              </InfoLabel>
              <InfoValue>{formatDate(proposal.expiry_date)}</InfoValue>
            </InfoRow>
          )}
        </Section>
        
        <Section>
          <SectionTitle>
            <FiMessageSquare size={16} /> Justification
          </SectionTitle>
          <JustificationBox>
            {proposal.justification || 'No justification provided.'}
          </JustificationBox>
        </Section>
        
        <Section>
          <SectionTitle>Activity Timeline</SectionTitle>
          <Timeline>
            {timelineEvents.map(event => (
              <TimelineItem key={event.id}>
                <TimelineContent>
                  <TimelineHeader>
                    <TimelineTitle>{event.title}</TimelineTitle>
                    <TimelineDate>{formatDate(event.date)}</TimelineDate>
                  </TimelineHeader>
                  <TimelineDescription>{event.description}</TimelineDescription>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Section>
        
        <Section>
          <SectionTitle>
            <FiActivity size={16} /> Review History
          </SectionTitle>
          
          {isLoadingReviews ? (
            <div>Loading review history...</div>
          ) : reviews.length > 0 ? (
            <ReviewHistorySection>
              {reviews.map((review) => (
                <ReviewItem key={review.id}>
                  <ReviewHeader>
                    <ReviewerInfo>
                      <FiUser size={14} />
                      {review.reviewer}
                    </ReviewerInfo>
                    <ReviewStatus status={review.review_status}>
                      {review.review_status === 'approved' && <FiThumbsUp size={14} />}
                      {review.review_status === 'rejected' && <FiThumbsDown size={14} />}
                      {review.review_status}
                    </ReviewStatus>
                  </ReviewHeader>
                  
                  <ReviewDate>
                    Reviewed on {formatDate(review.review_date)}
                    {review.completed_date && ` • Completed on ${formatDate(review.completed_date)}`}
                  </ReviewDate>
                  
                  {review.review_note && (
                    <ReviewNote>
                      {review.review_note}
                    </ReviewNote>
                  )}
                </ReviewItem>
              ))}
            </ReviewHistorySection>
          ) : (
            <NoReviewsMessage>
              No review history available for this proposal.
            </NoReviewsMessage>
          )}
        </Section>
      </PanelContent>
      
      <PanelFooter>
        {proposal.status === 'pending' && (
          <>
            <Button variant="danger" onClick={onDelete}>
              <FiTrash2 size={16} /> Delete
            </Button>
            <Button variant="secondary" onClick={onEdit}>
              <FiEdit2 size={16} /> Edit
            </Button>
            {canApprove && (
              <>
                <Button 
                  variant="secondary" 
                  onClick={onReject}
                  disabled={disabledReject}
                >
                  <FiX size={16} /> Reject
                </Button>
                <Button 
                  variant="primary" 
                  onClick={onApprove}
                  disabled={disabledApprove}
                >
                  <FiCheck size={16} /> Approve
                </Button>
              </>
            )}
          </>
        )}
        {proposal.status !== 'pending' && (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        )}
      </PanelFooter>
    </PanelContainer>
  );
};

export default DetailPanel;