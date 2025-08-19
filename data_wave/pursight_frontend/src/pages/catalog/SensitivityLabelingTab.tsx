/** @jsxImportSource @emotion/react */
import React, { useState, useCallback, useEffect } from "react";
import { useSharedWebSocket } from "../../hooks/useSharedWebSocket";
import { showToast } from "../../components/common/Toast";
import { css } from "@emotion/react";
import {
  FiTag,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
} from "react-icons/fi";

// Components
import MLSuggestionCard from "../../components/sensitivity/MLSuggestionCard";
import ProposalCard from "../../components/sensitivity/ProposalCard";
import ReviewCard from "../../components/sensitivity/ReviewCard";

// API Hooks
import {
  useProposals,
  useCreateProposal,
  useUpdateProposal,
} from "../../api/proposals";
import { useMLSuggestions } from "../../api/mlSuggestions";
import axios from "../../api/axiosConfig";
import { purviewTheme } from "../../theme/purviewTheme";
import { useQueryClient } from "@tanstack/react-query";
import { useRBAC } from "../../hooks/useRBAC";

// Types and Interfaces
interface SensitivityLabelingTabProps {
  path?: string[];
}

interface SuggestionResponse {
  label_id: number;
  status: MLSuggestionStatus;
}

interface UpdateProposalRequest {
  id: string;
  status: ProposalStatus;
}

interface UpdateProposalResponse {
  id: string;
  status: ProposalStatus;
  updatedAt: string;
}

interface CreateProposalRequest {
  label_id: number;
  object_type: string;
  object_id: string;
  proposed_by: string;
  status: ProposalStatus;
}

interface Proposal {
  id: string;
  label_id: number;
  proposed_by: string;
  status: ProposalStatus;
  updatedAt: string;
}

interface MLSuggestion {
  id: number;
  suggested_label: string;
  confidence: number;
  reviewer: string;
  status: MLSuggestionStatus;
  updatedAt: string;
}

interface WebSocketEvent {
  type:
    | "proposal_created"
    | "proposal_updated"
    | "proposal_deleted"
    | "ml_suggestion_created"
    | "ml_suggestion_updated"
    | "label_applied";
  data?: unknown;
}

interface APIError {
  response?: {
    data?: {
      message?: string;
      code?: string;
      details?: unknown;
    };
    status?: number;
  };
  message: string;
}

type ProposalStatus = "pending" | "approved" | "rejected";
type MLSuggestionStatus = "pending" | "accepted" | "rejected";

// Type guard for WebSocket events
const isWebSocketEvent = (data: any): data is WebSocketEvent => {
  return (
    typeof data === "object" &&
    data !== null &&
    "type" in data &&
    typeof data.type === "string" &&
    [
      "proposal_created",
      "proposal_updated",
      "proposal_deleted",
      "ml_suggestion_created",
      "ml_suggestion_updated",
      "label_applied",
    ].includes(data.type)
  );
};

const SensitivityLabelingTab = ({ path }: SensitivityLabelingTabProps) => {
  const { canManageLabels, canApproveLabels, canReviewLabels, canViewLabels } =
    useRBAC();
  const [selectedPath] = useState<string[]>(
    path ||
      window.location.pathname.split("/").filter(Boolean) || ["sample", "path"]
  );

  // WebSocket connection for real-time updates (shared across tabs)
  const { lastMessage } = useSharedWebSocket(
    import.meta.env.VITE_WS_URL || "ws://localhost:8000/sensitivity-labels/ws"
  );

  // Query client for cache updates
  const queryClient = useQueryClient();

  useEffect(() => {
    if (lastMessage?.data) {
      try {
        const parsedData = JSON.parse(lastMessage.data);
        if (!isWebSocketEvent(parsedData)) {
          console.error("Invalid WebSocket message format");
          return;
        }
        const event: WebSocketEvent = parsedData;
        switch (event.type) {
          case "proposal_created":
          case "proposal_updated":
          case "proposal_deleted":
            queryClient.invalidateQueries(["proposals"]);
            break;
          case "ml_suggestion_created":
          case "ml_suggestion_updated":
            queryClient.invalidateQueries(["mlSuggestions"]);
            break;
          case "label_applied":
            // Trigger parent component update if needed
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    }
  }, [lastMessage, queryClient]);

  const {
    data: proposalsResponse,
    isLoading: isLoadingProposals,
    error: proposalsError,
  } = useProposals();
  const {
    data: mlSuggestionsResponse,
    isLoading: isLoadingMLSuggestions,
    error: mlSuggestionsError,
  } = useMLSuggestions(selectedPath);

  // Type guard for API responses
  const isProposalArray = (data: any): data is Proposal[] => {
    return (
      Array.isArray(data) &&
      data.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          typeof item.id === "string" &&
          typeof item.label_id === "number" &&
          typeof item.proposed_by === "string" &&
          ["pending", "approved", "rejected"].includes(item.status) &&
          typeof item.updatedAt === "string"
      )
    );
  };

  const isMLSuggestionArray = (data: any): data is MLSuggestion[] => {
    return (
      Array.isArray(data) &&
      data.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          typeof item.id === "number" &&
          typeof item.suggested_label === "string" &&
          typeof item.confidence === "number" &&
          typeof item.reviewer === "string" &&
          ["pending", "accepted", "rejected"].includes(item.status) &&
          typeof item.updatedAt === "string"
      )
    );
  };

  // Validate and transform API responses
  const proposals: Proposal[] = isProposalArray(proposalsResponse)
    ? proposalsResponse
    : [];
  const mlSuggestions: MLSuggestion[] = isMLSuggestionArray(
    mlSuggestionsResponse
  )
    ? mlSuggestionsResponse
    : [];
  // Loading and error states
  const isLoading = isLoadingProposals || isLoadingMLSuggestions;
  const hasError = proposalsError || mlSuggestionsError;

  // Loading and error state components
  const LoadingState = () => (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 520px;
        gap: 16px;
        color: ${purviewTheme.textSecondary};
      `}
    >
      <div
        css={css`
          width: 40px;
          height: 40px;
          border: 3px solid ${purviewTheme.border};
          border-top-color: ${purviewTheme.accent};
          border-radius: 50%;
          animation: spin 1s linear infinite;

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      />
      <div
        css={css`
          font-size: 1.1rem;
          font-weight: 500;
        `}
      >
        Loading sensitivity labeling data...
      </div>
    </div>
  );

  const ErrorState = () => (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 520px;
        gap: 16px;
        color: ${purviewTheme.error};
        text-align: center;
        padding: 0 24px;
      `}
    >
      <div
        css={css`
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: ${purviewTheme.error}15;
          display: flex;
          align-items: center;
          justify-content: center;
        `}
      >
        <FiAlertCircle size={24} color={purviewTheme.error} />
      </div>
      <div>
        <div
          css={css`
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 8px;
          `}
        >
          Failed to load sensitivity labeling data
        </div>
        <div
          css={css`
            color: ${purviewTheme.textSecondary};
            font-size: 0.9rem;
          `}
        >
          Please try again later or contact support if the problem persists.
        </div>
      </div>
      <button
        onClick={() => window.location.reload()}
        css={css`
          background: ${purviewTheme.error}15;
          color: ${purviewTheme.error};
          border: 1px solid ${purviewTheme.error}30;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: ${purviewTheme.error}25;
          }
        `}
      >
        Try Again
      </button>
    </div>
  );

  // Check view permission
  if (!canViewLabels()) {
    return (
      <div
        css={css`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 520px;
          gap: 16px;
          color: ${purviewTheme.error};
          text-align: center;
          padding: 0 24px;
        `}
      >
        <FiLock size={48} />
        <div
          css={css`
            font-size: 1.1rem;
            font-weight: 600;
          `}
        >
          Access Denied
        </div>
        <div
          css={css`
            color: ${purviewTheme.textSecondary};
            font-size: 0.9rem;
          `}
        >
          You don't have permission to view sensitivity labels.
        </div>
      </div>
    );
  }

  // Early return for loading and error states
  if (isLoading) return <LoadingState />;
  if (hasError) return <ErrorState />;

  // Remove unused generics
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal();

  // Handle ML suggestion actions
  const handleAcceptSuggestion = useCallback(
    async (suggestionId: number): Promise<void> => {
      if (!canManageLabels()) {
        showToast.error(
          "Error",
          "You don't have permission to manage sensitivity labels"
        );
        return;
      }
      const previousSuggestions = queryClient.getQueryData(["mlSuggestions"]);

      // Optimistically update the UI
      queryClient.setQueryData(
        ["mlSuggestions"],
        (old: MLSuggestion[] | undefined) =>
          old?.map((s) =>
            s.id === suggestionId
              ? {
                  ...s,
                  status: "accepted" as MLSuggestionStatus,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ) || []
      );

      try {
        showToast.info("Processing", "Accepting suggestion...");
        const response = await axios.post<SuggestionResponse>(
          `/api/suggestions/${suggestionId}/accept`
        );
        // Create a proposal from the accepted suggestion
        const proposalInput: CreateProposalRequest = {
          label_id: response.data?.label_id,
          object_type: "column",
          object_id: selectedPath.join("/"),
          proposed_by: "ML Model",
          status: "pending",
        };
        await createProposal.mutateAsync(proposalInput);
        showToast.success("Success", "Suggestion accepted successfully");
        queryClient.invalidateQueries(["mlSuggestions"]);
      } catch (error) {
        const err = error as APIError;
        // Revert optimistic update on error
        queryClient.setQueryData(["mlSuggestions"], previousSuggestions);

        showToast.error(
          "Error",
          err.response?.data?.message || "Failed to accept suggestion"
        );
      }
    },
    [createProposal, selectedPath, queryClient]
  );

  const handleRejectSuggestion = useCallback(
    async (suggestionId: number): Promise<void> => {
      if (!canManageLabels()) {
        showToast.error(
          "Error",
          "You don't have permission to manage sensitivity labels"
        );
        return;
      }
      if (!suggestionId) {
        showToast.error("Error", "Invalid suggestion ID");
        return;
      }
      const previousSuggestions = queryClient.getQueryData(["mlSuggestions"]);

      // Optimistically update the UI
      queryClient.setQueryData(
        ["mlSuggestions"],
        (old: MLSuggestion[] | undefined) =>
          old?.map((s) =>
            s.id === suggestionId
              ? {
                  ...s,
                  status: "rejected" as MLSuggestionStatus,
                  updatedAt: new Date().toISOString(),
                }
              : s
          ) || []
      );

      try {
        showToast.info("Processing", "Rejecting suggestion...");
        await axios.post<{ status: MLSuggestionStatus }>(
          `/api/suggestions/${suggestionId}/reject`
        );
        showToast.success("Success", "Suggestion rejected successfully");
        queryClient.invalidateQueries(["mlSuggestions"]);
      } catch (error) {
        const err = error as APIError;
        // Revert optimistic update on error
        queryClient.setQueryData(["mlSuggestions"], previousSuggestions);

        showToast.error(
          "Error",
          err.response?.data?.message || "Failed to reject suggestion"
        );
      }
    },
    [queryClient]
  );

  // Handle proposal actions
  const handleApproveProposal = useCallback(
    async (proposalId: string): Promise<void> => {
      if (!canApproveLabels()) {
        showToast.error(
          "Error",
          "You don't have permission to approve sensitivity labels"
        );
        return;
      }
      if (!proposalId) {
        showToast.error("Error", "Invalid proposal ID");
        return;
      }
      const previousProposals = queryClient.getQueryData(["proposals"]);

      // Optimistically update the UI
      queryClient.setQueryData(
        ["proposals"],
        (old: Proposal[] | undefined) =>
          old?.map((p) =>
            p.id === proposalId
              ? {
                  ...p,
                  status: "approved" as ProposalStatus,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ) || []
      );

      try {
        showToast.info("Processing", "Approving proposal...");
        await updateProposal.mutateAsync({
          id: proposalId,
          status: "approved",
        } as UpdateProposalRequest);
        showToast.success("Success", "Proposal approved successfully");
        queryClient.invalidateQueries(["proposals"]);
      } catch (error) {
        const err = error as APIError;
        // Revert optimistic update on error
        queryClient.setQueryData(["proposals"], previousProposals);

        showToast.error(
          "Error",
          err.response?.data?.message || "Failed to approve proposal"
        );
      }
    },
    [updateProposal, queryClient]
  );

  const handleRejectProposal = useCallback(
    async (proposalId: string): Promise<void> => {
      if (!canApproveLabels()) {
        showToast.error(
          "Error",
          "You don't have permission to reject sensitivity labels"
        );
        return;
      }
      if (!proposalId) {
        showToast.error("Error", "Invalid proposal ID");
        return;
      }
      const previousProposals = queryClient.getQueryData(["proposals"]);

      // Optimistically update the UI
      queryClient.setQueryData(
        ["proposals"],
        (old: Proposal[] | undefined) =>
          old?.map((p) =>
            p.id === proposalId
              ? {
                  ...p,
                  status: "rejected" as ProposalStatus,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ) || []
      );

      try {
        showToast.info("Processing", "Rejecting proposal...");
        await updateProposal.mutateAsync({
          id: proposalId,
          status: "rejected",
        } as UpdateProposalRequest);
        showToast.success("Success", "Proposal rejected successfully");
        queryClient.invalidateQueries(["proposals"]);
      } catch (error) {
        const err = error as APIError;
        // Revert optimistic update on error
        queryClient.setQueryData(["proposals"], previousProposals);

        showToast.error(
          "Error",
          err.response?.data?.message || "Failed to reject proposal"
        );
      }
    },
    [updateProposal, queryClient]
  );

  return (
    <div
      css={css`
        display: flex;
        min-height: 520px;
        background: ${purviewTheme.bg};
        border-radius: 14px;
        box-shadow: ${purviewTheme.shadow};
      `}
    >
      <div
        css={css`
          width: 80px;
          background: ${purviewTheme.card};
          border-right: 1px solid ${purviewTheme.border};
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 0;
          position: relative;

          &::after {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            width: 1px;
            height: 100%;
            background: linear-gradient(
              to bottom,
              transparent,
              ${purviewTheme.border},
              transparent
            );
          }
        `}
      >
        <StepIndicator icon={FiTag} status="done" tooltip="Label Selection" />
        <StepIndicator
          icon={FiClock}
          status="active"
          tooltip="Review Process"
        />
        <StepIndicator
          icon={FiCheckCircle}
          status="pending"
          tooltip="Final Approval"
        />
      </div>
      <div
        css={css`
          flex: 1;
          display: flex;
          padding: 32px;
          gap: 24px;
          overflow-x: auto;

          &::-webkit-scrollbar {
            height: 8px;
          }

          &::-webkit-scrollbar-track {
            background: ${purviewTheme.bg};
            border-radius: 4px;
          }

          &::-webkit-scrollbar-thumb {
            background: ${purviewTheme.border};
            border-radius: 4px;

            &:hover {
              background: ${purviewTheme.textSecondary};
            }
          }
        `}
      >
        {/* ML Suggestions Section */}
        <Section
          title="ML Suggestions"
          count={mlSuggestions?.length || 0}
          loading={isLoadingMLSuggestions}
        >
          {mlSuggestions?.length === 0 && (
            <div
              css={css`
                color: ${purviewTheme.textSecondary};
                text-align: center;
                padding: 20px;
              `}
            >
              No ML suggestions available
            </div>
          )}
          {mlSuggestions?.map((suggestion) => (
            <MLSuggestionCard
              key={suggestion.id}
              label={suggestion.suggested_label}
              confidence={suggestion.confidence}
              reviewer={suggestion.reviewer}
              onAccept={() => handleAcceptSuggestion(suggestion.id)}
              onReject={() => handleRejectSuggestion(suggestion.id)}
              accent={purviewTheme.accent}
              bg={purviewTheme.card}
              textSecondary={purviewTheme.textSecondary}
              canManage={canManageLabels()}
            />
          ))}
        </Section>

        {/* Proposals Section */}
        <Section
          title="Active Proposals"
          count={proposals?.filter((p) => p.status === "pending").length || 0}
          loading={isLoadingProposals}
        >
          {proposals?.filter((p) => p.status === "pending").length === 0 && (
            <div
              css={css`
                color: ${purviewTheme.textSecondary};
                text-align: center;
                padding: 20px;
              `}
            >
              No active proposals
            </div>
          )}
          {proposals
            ?.filter((p) => p.status === "pending")
            .map((proposal) => (
              <ProposalCard
                key={proposal.id}
                labelId={proposal.label_id.toString()}
                proposedBy={proposal.proposed_by}
                status={proposal.status}
                onApprove={() => handleApproveProposal(proposal.id)}
                onReject={() => handleRejectProposal(proposal.id)}
                onGoToReview={() =>
                  (window.location.href = `/reviews/${proposal.id}`)
                }
                accent={purviewTheme.accent}
                textSecondary={purviewTheme.textSecondary}
                bg={purviewTheme.card}
                disabledApprove={proposal.status !== "pending"}
                disabledReject={proposal.status !== "pending"}
                canApprove={canApproveLabels()}
                canReview={canReviewLabels()}
              />
            ))}
        </Section>

        {/* Reviews Section */}
        <Section
          title="Recent Reviews"
          count={proposals?.filter((p) => p.status !== "pending").length || 0}
          loading={isLoadingProposals}
        >
          {proposals?.filter((p) => p.status !== "pending").length === 0 && (
            <div
              css={css`
                color: ${purviewTheme.textSecondary};
                text-align: center;
                padding: 20px;
              `}
            >
              No recent reviews
            </div>
          )}
          {proposals
            ?.filter((p) => p.status !== "pending")
            .map((review) => (
              <ReviewCard
                key={review.id}
                proposalSummary={`Label ID: ${review.label_id}`}
                reviewer={review.proposed_by}
                reviewStatus={review.status}
                onApprove={() => handleApproveProposal(review.id)}
                onReject={() => handleRejectProposal(review.id)}
                accent={purviewTheme.accent}
                textSecondary={purviewTheme.textSecondary}
                bg={purviewTheme.card}
                disabledApprove={review.status !== "pending"}
                disabledReject={review.status !== "pending"}
              />
            ))}
        </Section>
      </div>
    </div>
  );
};

// --- Helper Components ---
// Fix StepIndicatorProps icon type
interface StepIndicatorProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  status: "done" | "active" | "pending";
  tooltip: string;
}

const StepIndicator = ({ icon: Icon, status, tooltip }: StepIndicatorProps) => {
  const getColor = () => {
    switch (status) {
      case "done":
        return purviewTheme.stepDone;
      case "active":
        return purviewTheme.stepActive;
      default:
        return purviewTheme.stepPending;
    }
  };

  return (
    <div
      css={css`
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${status === "active"
          ? purviewTheme.stepActive + "15"
          : status === "done"
          ? purviewTheme.stepDone + "15"
          : "transparent"};
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.05);
          background: ${status === "active"
            ? purviewTheme.stepActive + "25"
            : status === "done"
            ? purviewTheme.stepDone + "25"
            : purviewTheme.stepPending + "15"};

          &::before {
            opacity: 1;
            transform: translateX(48px) translateY(-50%);
          }
        }

        &::before {
          content: "${tooltip}";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateX(42px) translateY(-50%);
          background: ${purviewTheme.text};
          color: ${purviewTheme.bg};
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          transition: all 0.2s ease;
          pointer-events: none;
          z-index: 10;
        }

        &:not(:last-child):after {
          content: "";
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 24px;
          background: ${getColor()};
          opacity: 0.5;
        }
      `}
    >
      <Icon
        size={24}
        color={getColor()}
        css={css`
          transition: all 0.2s ease;
          ${status === "done" &&
          `
            filter: drop-shadow(0 0 2px ${purviewTheme.stepDone}40);
          `}
          ${status === "active" &&
          `
            filter: drop-shadow(0 0 2px ${purviewTheme.stepActive}40);
          `}
        `}
      />
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode | React.ReactNode[];
  count?: number;
  loading?: boolean;
}

const LoadingSpinner = () => (
  <div
    css={css`
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid ${purviewTheme.border};
      border-top-color: ${purviewTheme.accent};
      border-radius: 50%;
      animation: spin 0.8s linear infinite;

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `}
  />
);

const Section: React.FC<SectionProps> = ({
  title,
  children,
  count = 0,
  loading = false,
}) => (
  <div
    css={css`
      flex: 1;
      min-width: 320px;
      max-width: 480px;
      background: ${purviewTheme.bg};
      border-radius: 8px;
      border: 1px solid ${purviewTheme.border};
      padding: 20px;
      height: fit-content;

      &:hover {
        border-color: ${purviewTheme.accent}20;
      }
    `}
  >
    <div
      css={css`
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid ${purviewTheme.border};
      `}
    >
      <h3
        css={css`
          font-size: 1.1rem;
          font-weight: 600;
          color: ${purviewTheme.text};
          margin: 0;
          display: flex;
          align-items: center;
          gap: 8px;

          &::before {
            content: "";
            display: block;
            width: 3px;
            height: 16px;
            background: ${purviewTheme.accent};
            border-radius: 2px;
          }
        `}
      >
        {title}
      </h3>
      <div
        css={css`
          display: flex;
          align-items: center;
          gap: 8px;
        `}
      >
        {loading ? (
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 8px;
              color: ${purviewTheme.textSecondary};
              font-size: 0.9rem;
            `}
          >
            <LoadingSpinner />
            <span>Loading</span>
          </div>
        ) : (
          <span
            css={css`
              background: ${count > 0
                ? purviewTheme.accent + "15"
                : purviewTheme.card};
              color: ${count > 0
                ? purviewTheme.accent
                : purviewTheme.textSecondary};
              padding: 4px 10px;
              border-radius: 12px;
              font-size: 0.9rem;
              font-weight: 500;
              min-width: 24px;
              text-align: center;
              transition: all 0.2s ease;
            `}
          >
            {count}
          </span>
        )}
      </div>
    </div>
    <div
      css={css`
        max-height: calc(100vh - 280px);
        overflow-y: auto;
        padding-right: 4px;

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: ${purviewTheme.border};
          border-radius: 3px;

          &:hover {
            background: ${purviewTheme.textSecondary};
          }
        }
      `}
    >
      <ul
        css={css`
          list-style: none;
          padding: 0;
          margin: 0;
        `}
      >
        {children}
      </ul>
    </div>
  </div>
);

export default SensitivityLabelingTab;
