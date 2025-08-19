import React, { useState, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { showToast } from "../../components/common/Toast";
import "../../components/sensitivity/animations.css";
import {
  FiFilter,
  FiDownload,
  FiPlus,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiInfo,
  FiSearch,
  FiCalendar,
  FiClock,
  FiList,
  FiGrid,
  FiSliders,
  FiChevronUp,
  FiChevronDown,
  FiAlertCircle,
  FiUser,
  FiTag,
} from "react-icons/fi";
import { handleApiError } from "../../utils/errorHandling";
import ApiErrorBoundary from "../../components/common/ApiErrorBoundary";

// Components
import ProposalCard from "../../components/sensitivity/ProposalCard";
import DetailPanel from "../../components/sensitivity/DetailPanel";
import FilterDropdown from "../../components/common/FilterDropdown";

// Hooks and API
import {
  useProposals,
  useCreateProposal,
  useUpdateProposal,
  useDeleteProposal,
} from "../../api/proposals";
import { useLabels } from "../../api/sensitivityLabels";
import { useUsers } from "../../api/users";
import {
  useBulkProposalActions,
  useBulkExportProposals,
} from "../../api/bulkProposals";
import { useProposalAnalytics } from "../../api/proposals";
import { useSharedWebSocket } from "../../hooks/useSharedWebSocket";
import { useRBAC } from "../../hooks/useRBAC";
import { purviewTheme } from "../../theme/purviewTheme";

// Types
import { LabelProposal } from "../../models/LabelProposal";
import { User } from "../../models/User";

export type ProposalStatus = "approved" | "rejected" | "pending" | "expired";

export interface CreateProposalRequest {
  label_id: number;
  object_type: string;
  object_id: string;
  justification: string;
}

export interface UpdateProposalRequest {
  id: number;
  label_id?: number;
  object_type?: string;
  object_id?: string;
  justification?: string;
  status?: ProposalStatus;
}

export interface APIError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Styled Components
const PageContainer = styled.div`
  background: ${purviewTheme.bg};
  border-radius: 8px;
  box-shadow: ${purviewTheme.shadow};
  padding: 24px;
  min-height: 520px;
  display: flex;
  flex-direction: column;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid ${purviewTheme.border};
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: ${purviewTheme.text};
  margin: 0;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex-grow: 1;
  max-width: 300px;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: ${purviewTheme.textSecondary};
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  padding: 8px 16px 8px 36px;
  border: 1px solid ${purviewTheme.border};
  border-radius: 4px;
  font-size: 14px;
  color: ${purviewTheme.text};
  background-color: ${purviewTheme.bg};
  width: 100%;
  &:focus {
    outline: none;
    border-color: ${purviewTheme.accent};
    box-shadow: 0 0 0 2px rgba(255, 54, 33, 0.2);
  }
`;

const Select = styled.select`
  padding: 8px 16px;
  border: 1px solid ${purviewTheme.border};
  border-radius: 4px;
  font-size: 14px;
  color: ${purviewTheme.text};
  background-color: ${purviewTheme.bg};
  min-width: 140px;
  &:focus {
    outline: none;
    border-color: ${purviewTheme.accent};
    box-shadow: 0 0 0 2px rgba(255, 54, 33, 0.2);
  }
`;

const Button = styled.button<{ variant?: "primary" | "secondary" | "text" }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  ${({ variant = "primary" }) =>
    variant === "primary"
      ? `
        background-color: ${purviewTheme.accent};
        color: white;
        border: none;
        &:hover {
          background-color: #E62E1B;
        }
      `
      : variant === "secondary"
      ? `
        background-color: white;
        color: ${purviewTheme.accent};
        border: 1px solid ${purviewTheme.accent};
        &:hover {
          background-color: #FFF5F5;
        }
      `
      : `
        background-color: transparent;
        color: ${purviewTheme.accent};
        border: none;
        padding: 4px 8px;
        &:hover {
          text-decoration: underline;
        }
      `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AnalyticsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  color: ${purviewTheme.textSecondary};
  font-weight: 500;
  flex-wrap: wrap;
`;

const AnalyticsCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex: 1;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 1px solid ${purviewTheme.border};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const AnalyticsLabel = styled.div`
  font-size: 14px;
  color: ${purviewTheme.textSecondary};
  margin-bottom: 8px;
`;

const AnalyticsValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: ${purviewTheme.text};
`;

const AnalyticsItem = styled.span`
  color: ${purviewTheme.text};
  font-weight: 600;
`;

const StatusAnalyticsItem = styled.span<{ statusColor: string }>`
  color: ${(props) => props.statusColor};
  font-weight: 600;
`;

const ViewToggleContainer = styled.div`
  display: flex;
  border: 1px solid ${purviewTheme.border};
  border-radius: 4px;
  overflow: hidden;
  margin-left: auto;
`;

const ViewToggleButton = styled.button<{ active: boolean }>`
  background: ${(props) => (props.active ? purviewTheme.accent : "white")};
  color: ${(props) => (props.active ? "white" : purviewTheme.textSecondary)};
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? purviewTheme.accent : "#f5f5f5")};
  }
`;

const BulkActionsBar = styled.div`
  background: ${purviewTheme.accent + "11"};
  color: ${purviewTheme.accent};
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-weight: 500;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid ${purviewTheme.accent + "22"};
`;

const ProposalsGrid = styled.div<{ viewMode: "grid" | "list" }>`
  display: grid;
  grid-template-columns: ${(props) =>
    props.viewMode === "grid"
      ? "repeat(auto-fill, minmax(350px, 1fr))"
      : "1fr"};
  gap: 16px;
  margin-top: 16px;
  transition: all 0.3s ease;
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  align-items: center;
`;

const AdvancedFiltersContainer = styled.div<{ isVisible: boolean }>`
  display: ${(props) => (props.isVisible ? "grid" : "none")};
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid ${purviewTheme.border};
  animation: fadeIn 0.3s ease;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterGroupLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${purviewTheme.textSecondary};
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const DateInput = styled.input`
  padding: 8px;
  border: 1px solid ${purviewTheme.border};
  border-radius: 4px;
  font-size: 14px;
  flex: 1;

  &:focus {
    outline: none;
    border-color: ${purviewTheme.accent};
    box-shadow: 0 0 0 2px rgba(255, 54, 33, 0.2);
  }
`;

const ToggleButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.active ? "#F3F4F6" : "white")};
  color: ${(props) =>
    props.active ? purviewTheme.accent : purviewTheme.textSecondary};
  border: 1px solid
    ${(props) => (props.active ? purviewTheme.accent : purviewTheme.border)};

  &:hover {
    background: #f3f4f6;
  }
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const FilterChip = styled.div<{ active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.active ? purviewTheme.accent : "white")};
  color: ${(props) => (props.active ? "white" : purviewTheme.textSecondary)};
  border: 1px solid
    ${(props) => (props.active ? purviewTheme.accent : purviewTheme.border)};

  &:hover {
    background: ${(props) => (props.active ? purviewTheme.accent : "#f5f5f5")};
    transform: translateY(-1px);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalCard = styled.div`
  background: ${purviewTheme.bg};
  border-radius: 8px;
  box-shadow: ${purviewTheme.shadow};
  padding: 24px;
  min-width: 400px;
  max-width: 600px;
  border: 1px solid ${purviewTheme.border};
`;

const ModalTitle = styled.h2`
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 24px;
  color: ${purviewTheme.text};
`;

const FormFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  color: ${purviewTheme.text};
  margin-bottom: 8px;
  display: block;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 24px;
  justify-content: flex-end;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: ${purviewTheme.textSecondary};
  text-align: center;

  svg {
    font-size: 48px;
    margin-bottom: 16px;
    color: ${purviewTheme.accent};
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: ${purviewTheme.text};
  }

  p {
    margin: 0;
    max-width: 400px;
  }
`;

const ProposalsTab: React.FC = () => {
  // Hooks for data fetching and mutations
  const {
    data: proposals = [],
    isLoading,
    error: proposalsError,
    refetch,
    mutate: setProposals,
  } = useProposals();
  const { data: labels = [], error: labelsError } = useLabels();
  const { data: users = [], error: usersError } = useUsers();
  const createProposal = useCreateProposal();
  const updateProposal = useUpdateProposal();
  const deleteProposal = useDeleteProposal();
  const bulkActions = useBulkProposalActions();
  const exportProposals = useBulkExportProposals();
  const { data: analytics, error: analyticsError } = useProposalAnalytics();
  const { canApproveLabels, canReviewLabels } = useRBAC();

  // Combine all API errors
  const apiError =
    proposalsError || labelsError || usersError || analyticsError;

  // State variables
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<LabelProposal | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | "">("");
  const [filterLabel, setFilterLabel] = useState<number | null>(null);
  const [filterProposedBy, setFilterProposedBy] = useState<string | null>(null);
  const [filterDateRange, setFilterDateRange] = useState<{
    start?: string;
    end?: string;
  }>({});
  const [filterExpiringOnly, setFilterExpiringOnly] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [exporting, setExporting] = useState(false);
  const [formData, setFormData] = useState<Partial<LabelProposal>>({});
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [selectedProposalForDetail, setSelectedProposalForDetail] =
    useState<LabelProposal | null>(null);

  // WebSocket for real-time updates
  const wsUrl =
    import.meta.env.VITE_WS_URL || "ws://localhost:8000/sensitivity-labels/ws";
  const { lastMessage } = useSharedWebSocket(wsUrl);

  // Process WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.event === "proposal_updated") {
          setProposals((prevProposals) =>
            prevProposals.map((p) =>
              p.id === data.proposal.id ? data.proposal : p
            )
          );
          showToast.info(
            `Proposal Updated`,
            `Proposal #${data.proposal.id} was updated`
          );
        } else if (data.event === "proposal_created") {
          setProposals((prevProposals) => [...prevProposals, data.proposal]);
          showToast.success(`Success`, `New proposal created`);
        } else if (data.event === "proposal_deleted") {
          setProposals((prevProposals) =>
            prevProposals.filter((p) => p.id !== data.proposal_id)
          );
          showToast.info(
            `Proposal Deleted`,
            `Proposal #${data.proposal_id} was deleted`
          );
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
        // We don't show a toast here as it would be too intrusive for WebSocket parsing errors
      }
    }
  }, [lastMessage, setProposals]);

  // Workflow actions
  const handleVote = async (
    proposalId: number,
    approve: boolean,
    note?: string
  ) => {
    try {
      await updateProposal.mutateAsync({
        id: proposalId,
        status: approve ? "approved" : "rejected",
      });
      showToast.success(
        `Success`,
        `Proposal ${approve ? "approved" : "rejected"} successfully`
      );

      // Close detail panel if it's open for this proposal
      if (
        selectedProposalForDetail &&
        selectedProposalForDetail.id === proposalId
      ) {
        setDetailPanelOpen(false);
        setSelectedProposalForDetail(null);
      }
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      showToast.error(`Error`, `Failed to submit vote: ${errorMessage}`);
    }
  };

  // Filtered and sorted proposals
  const filteredProposals = proposals
    .filter((p) => {
      const labelName = labels.find((l) => l.id === p.label_id)?.name || "";
      const proposedByUser =
        users.find((u) => u.id === p.proposed_by)?.displayName || "";

      // Basic search filter
      const matchesSearch =
        labelName.toLowerCase().includes(search.toLowerCase()) ||
        p.object_type.toLowerCase().includes(search.toLowerCase()) ||
        p.object_id.toLowerCase().includes(search.toLowerCase()) ||
        proposedByUser.toLowerCase().includes(search.toLowerCase()) ||
        (p.justification &&
          p.justification.toLowerCase().includes(search.toLowerCase()));

      // Status filter
      const matchesStatus = filterStatus ? p.status === filterStatus : true;

      // Advanced filters
      // Label filter
      const matchesLabel = filterLabel ? p.label_id === filterLabel : true;

      // Proposed by filter
      const matchesProposedBy = filterProposedBy
        ? p.proposed_by === filterProposedBy
        : true;

      // Date range filter
      let matchesDateRange = true;
      if (filterDateRange.start) {
        const startDate = new Date(filterDateRange.start);
        const createdDate = new Date(p.created_at);
        matchesDateRange = createdDate >= startDate;
      }
      if (filterDateRange.end && matchesDateRange) {
        const endDate = new Date(filterDateRange.end);
        endDate.setHours(23, 59, 59, 999); // End of the day
        const createdDate = new Date(p.created_at);
        matchesDateRange = createdDate <= endDate;
      }

      // Expiring soon filter
      let matchesExpiring = true;
      if (filterExpiringOnly && p.status === "pending" && p.expiry_date) {
        const now = new Date();
        const expiryDate = new Date(p.expiry_date);
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        matchesExpiring = daysUntilExpiry <= 7; // Expiring within 7 days
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLabel &&
        matchesProposedBy &&
        matchesDateRange &&
        matchesExpiring
      );
    })
    .sort((a, b) => {
      // Handle different sort fields
      if (sortBy === "updated_at") {
        return sortOrder === "asc"
          ? new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else if (sortBy === "created_at") {
        return sortOrder === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "label") {
        const labelA = labels.find((l) => l.id === a.label_id)?.name || "";
        const labelB = labels.find((l) => l.id === b.label_id)?.name || "";
        return sortOrder === "asc"
          ? labelA.localeCompare(labelB)
          : labelB.localeCompare(labelA);
      } else if (sortBy === "expiry_date") {
        // Handle null expiry dates
        if (!a.expiry_date && !b.expiry_date) return 0;
        if (!a.expiry_date) return sortOrder === "asc" ? 1 : -1;
        if (!b.expiry_date) return sortOrder === "asc" ? -1 : 1;

        return sortOrder === "asc"
          ? new Date(a.expiry_date).getTime() -
              new Date(b.expiry_date).getTime()
          : new Date(b.expiry_date).getTime() -
              new Date(a.expiry_date).getTime();
      } else if (sortBy === "proposed_by") {
        const userA =
          users.find((u) => u.id === a.proposed_by)?.displayName || "";
        const userB =
          users.find((u) => u.id === b.proposed_by)?.displayName || "";
        return sortOrder === "asc"
          ? userA.localeCompare(userB)
          : userB.localeCompare(userA);
      }
      return 0;
    });

  // Selection logic
  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const selectAll = () => setSelected(filteredProposals.map((p) => p.id));
  const clearSelection = () => setSelected([]);

  // Modal handlers
  const openCreate = () => {
    setModalData(null);
    setFormData({});
    setShowModal(true);
  };
  const openEdit = (proposal: LabelProposal) => {
    setModalData(proposal);
    setFormData({ ...proposal });
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
    setFormData({});
  };

  // Delete handler
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this proposal?")) {
      deleteProposal.mutate(String(id), {
        onSuccess: () => {
          showToast.success("Success", "Proposal deleted successfully");

          // Close detail panel if it's open for this proposal
          if (
            selectedProposalForDetail &&
            selectedProposalForDetail.id === id
          ) {
            setDetailPanelOpen(false);
            setSelectedProposalForDetail(null);
          }
        },
        onError: (error) => {
          const errorMessage = handleApiError(error);
          showToast.error(
            "Error",
            `Failed to delete proposal: ${errorMessage}`
          );
        },
      });
    }
  };

  // Save proposal handler
  const handleSaveProposal = async () => {
    if (!formData) return;
    try {
      if (modalData && modalData.id) {
        // Update existing proposal
        const updateRequest: UpdateProposalRequest = {
          id: modalData.id,
          label_id: formData.label_id!,
          object_type: formData.object_type!,
          object_id: formData.object_id!,
          justification: formData.justification!,
        };
        await updateProposal.mutateAsync(updateRequest);
        showToast.success("Success", "Proposal updated successfully");

        // Update the detail panel if it's open for this proposal
        if (
          selectedProposalForDetail &&
          selectedProposalForDetail.id === modalData.id
        ) {
          // We'll let the WebSocket update handle this
        }
      } else {
        // Create new proposal
        const createRequest: CreateProposalRequest = {
          label_id: formData.label_id!,
          object_type: formData.object_type!,
          object_id: formData.object_id!,
          justification: formData.justification!,
        };
        await createProposal.mutateAsync(createRequest);
        showToast.success("Success", "Proposal created successfully");
      }
      closeModal();
    } catch (error: unknown) {
      const errorMessage = handleApiError(error);
      showToast.error("Error", errorMessage);
    }
  };

  // Bulk action handlers
  const handleBulkAction = (action: "approve" | "reject") => {
    if (selected.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to ${action} ${selected.length} proposals?`
      )
    ) {
      bulkActions.mutate(
        { action, proposalIds: selected },
        {
          onSuccess: () => {
            showToast.success(
              "Success",
              `${selected.length} proposals ${action}ed successfully`
            );
            clearSelection();
          },
          onError: (error) => {
            const errorMessage = handleApiError(error);
            showToast.error(
              "Error",
              `Failed to ${action} proposals: ${errorMessage}`
            );
          },
        }
      );
    }
  };

  // Export handler
  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportProposals("csv");
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "proposals.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      showToast.success("Success", "Export completed successfully");
    } catch (error) {
      const errorMessage = handleApiError(error);
      showToast.error("Error", `Failed to export proposals: ${errorMessage}`);
    } finally {
      setExporting(false);
    }
  };

  // Open detail panel for a proposal
  const openDetailPanel = (proposal: LabelProposal) => {
    setSelectedProposalForDetail(proposal);
    setDetailPanelOpen(true);
  };

  // Close detail panel
  const closeDetailPanel = () => {
    setDetailPanelOpen(false);
    setSelectedProposalForDetail(null);
  };

  // Render empty state
  const renderEmptyState = () => (
    <EmptyState>
      <FiInfo size={48} />
      <h3>No proposals found</h3>
      <p>
        {search || filterStatus
          ? "Try adjusting your search or filter criteria"
          : "Create a new proposal to get started"}
      </p>
      <Button variant="primary" onClick={openCreate} style={{ marginTop: 16 }}>
        <FiPlus size={16} /> Create Proposal
      </Button>
    </EmptyState>
  );

  return (
    <ApiErrorBoundary error={apiError} onRetry={refetch}>
      <PageContainer>
        {/* Header & Toolbar */}
        <HeaderContainer>
          <Title>Proposals</Title>
          <Toolbar>
            <SearchContainer>
              <SearchIcon>
                <FiSearch size={16} />
              </SearchIcon>
              <Input
                type="text"
                placeholder="Search proposals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </SearchContainer>

            <Button variant="primary" onClick={openCreate}>
              <FiPlus size={16} /> Create
            </Button>
            <Button variant="secondary" onClick={() => refetch()}>
              <FiRefreshCw size={16} /> Refresh
            </Button>
            <Button
              variant="secondary"
              onClick={handleExport}
              disabled={exporting}
            >
              <FiDownload size={16} /> {exporting ? "Exporting..." : "Export"}
            </Button>

            <ViewToggleContainer>
              <ViewToggleButton
                active={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
              >
                <FiGrid size={16} />
              </ViewToggleButton>
              <ViewToggleButton
                active={viewMode === "list"}
                onClick={() => setViewMode("list")}
              >
                <FiList size={16} />
              </ViewToggleButton>
            </ViewToggleContainer>
          </Toolbar>
        </HeaderContainer>

        {/* Filters */}
        <FiltersContainer>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiFilter size={16} color={purviewTheme.textSecondary} />
            <span
              style={{ color: purviewTheme.textSecondary, fontSize: "14px" }}
            >
              Status:
            </span>
          </div>

          <FilterChip
            active={filterStatus === ""}
            onClick={() => setFilterStatus("")}
          >
            All
          </FilterChip>
          <FilterChip
            active={filterStatus === "pending"}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </FilterChip>
          <FilterChip
            active={filterStatus === "approved"}
            onClick={() => setFilterStatus("approved")}
          >
            Approved
          </FilterChip>
          <FilterChip
            active={filterStatus === "rejected"}
            onClick={() => setFilterStatus("rejected")}
          >
            Rejected
          </FilterChip>
          <FilterChip
            active={filterStatus === "expired"}
            onClick={() => setFilterStatus("expired")}
          >
            Expired
          </FilterChip>

          <ToggleButton
            active={showAdvancedFilters}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <FiSliders size={14} />
            {showAdvancedFilters ? "Hide Advanced Filters" : "Advanced Filters"}
          </ToggleButton>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{ color: purviewTheme.textSecondary, fontSize: "14px" }}
            >
              Sort by:
            </span>
            <FilterDropdown
              options={[
                { value: "updated_at", label: "Last Updated" },
                { value: "created_at", label: "Creation Date" },
                { value: "expiry_date", label: "Expiry Date" },
                { value: "label", label: "Label Name" },
                { value: "proposed_by", label: "Proposed By" },
              ]}
              value={sortBy}
              onChange={setSortBy}
              width="180px"
            />
            <Button
              variant="text"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              style={{
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {sortOrder === "asc" ? (
                <FiChevronUp size={18} />
              ) : (
                <FiChevronDown size={18} />
              )}
            </Button>
          </div>
        </FiltersContainer>

        {/* Advanced Filters */}
        <AdvancedFiltersContainer isVisible={showAdvancedFilters}>
          <FilterGroup>
            <FilterGroupLabel>Label</FilterGroupLabel>
            <FilterDropdown
              options={[
                { value: "", label: "All Labels" },
                ...labels.map((l) => ({ value: String(l.id), label: l.name })),
              ]}
              value={filterLabel ? String(filterLabel) : ""}
              onChange={(value) => setFilterLabel(value ? Number(value) : null)}
              width="100%"
            />
          </FilterGroup>

          <FilterGroup>
            <FilterGroupLabel>Proposed By</FilterGroupLabel>
            <FilterDropdown
              options={[
                { value: "", label: "All Users" },
                ...users.map((u) => ({
                  value: String(u.id),
                  label: u.displayName,
                })),
              ]}
              value={filterProposedBy ? String(filterProposedBy) : ""}
              onChange={(value) => setFilterProposedBy(value || null)}
              width="100%"
            />
          </FilterGroup>

          <FilterGroup>
            <FilterGroupLabel>Creation Date Range</FilterGroupLabel>
            <DateRangeContainer>
              <DateInput
                type="date"
                value={filterDateRange.start || ""}
                onChange={(e) =>
                  setFilterDateRange({
                    ...filterDateRange,
                    start: e.target.value,
                  })
                }
                placeholder="Start Date"
              />
              <span>to</span>
              <DateInput
                type="date"
                value={filterDateRange.end || ""}
                onChange={(e) =>
                  setFilterDateRange({
                    ...filterDateRange,
                    end: e.target.value,
                  })
                }
                placeholder="End Date"
              />
            </DateRangeContainer>
          </FilterGroup>

          <FilterGroup>
            <FilterGroupLabel>Expiring Soon</FilterGroupLabel>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                type="checkbox"
                id="expiring-filter"
                checked={filterExpiringOnly}
                onChange={(e) => setFilterExpiringOnly(e.target.checked)}
              />
              <label
                htmlFor="expiring-filter"
                style={{
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <FiAlertCircle size={14} color="#DC2626" /> Show only proposals
                expiring within 7 days
              </label>
            </div>
          </FilterGroup>

          <FilterGroup>
            <Button
              variant="secondary"
              onClick={() => {
                setFilterLabel(null);
                setFilterProposedBy(null);
                setFilterDateRange({});
                setFilterExpiringOnly(false);
              }}
              style={{ marginTop: "auto" }}
            >
              Clear Filters
            </Button>
          </FilterGroup>
        </AdvancedFiltersContainer>

        {/* Analytics Widget */}
        {analytics && (
          <AnalyticsContainer>
            <AnalyticsCard>
              <AnalyticsLabel>Total</AnalyticsLabel>
              <AnalyticsValue>{analytics.total_proposals}</AnalyticsValue>
            </AnalyticsCard>
            <AnalyticsCard>
              <AnalyticsLabel>Approved</AnalyticsLabel>
              <AnalyticsValue style={{ color: "#166534" }}>
                {analytics.approved}
              </AnalyticsValue>
            </AnalyticsCard>
            <AnalyticsCard>
              <AnalyticsLabel>Rejected</AnalyticsLabel>
              <AnalyticsValue style={{ color: "#991B1B" }}>
                {analytics.rejected}
              </AnalyticsValue>
            </AnalyticsCard>
            <AnalyticsCard>
              <AnalyticsLabel>Pending</AnalyticsLabel>
              <AnalyticsValue style={{ color: "#854D0E" }}>
                {analytics.pending}
              </AnalyticsValue>
            </AnalyticsCard>
            <AnalyticsCard>
              <AnalyticsLabel>Expired</AnalyticsLabel>
              <AnalyticsValue style={{ color: "#6B7280" }}>
                {analytics.expired}
              </AnalyticsValue>
            </AnalyticsCard>
          </AnalyticsContainer>
        )}

        {/* Bulk Actions Bar */}
        {selected.length > 0 && (
          <BulkActionsBar>
            <span>{selected.length} selected</span>
            <Button variant="text" onClick={clearSelection}>
              Clear Selection
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleBulkAction("approve")}
            >
              <FiCheck size={16} /> Bulk Approve
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleBulkAction("reject")}
            >
              <FiX size={16} /> Bulk Reject
            </Button>
          </BulkActionsBar>
        )}

        {/* Proposals Grid */}
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "40px 0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                className="loading-spinner"
                style={{
                  width: "24px",
                  height: "24px",
                  border: "3px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "50%",
                  borderTop: `3px solid ${purviewTheme.accent}`,
                  animation: "spin 1s linear infinite",
                }}
              />
              <span>Loading proposals...</span>
            </div>
          </div>
        ) : filteredProposals.length === 0 ? (
          renderEmptyState()
        ) : (
          <ProposalsGrid viewMode={viewMode}>
            {filteredProposals.map((proposal) => {
              const labelName =
                labels.find((l) => l.id === proposal.label_id)?.name ||
                "Unknown Label";
              const proposedByUser =
                users.find((u) => u.id === proposal.proposed_by)?.displayName ||
                "Unknown User";

              return (
                <ProposalCard
                  key={proposal.id}
                  labelId={labelName}
                  proposedBy={proposedByUser}
                  status={proposal.status}
                  objectType={proposal.object_type}
                  objectId={proposal.object_id}
                  justification={proposal.justification}
                  createdAt={proposal.created_at}
                  expiryDate={proposal.expiry_date}
                  reviewCycleDays={proposal.review_cycle_days}
                  onApprove={() => handleVote(proposal.id, true)}
                  onReject={() => handleVote(proposal.id, false)}
                  onGoToReview={() => openEdit(proposal)}
                  accent={purviewTheme.accent}
                  textSecondary={purviewTheme.textSecondary}
                  bg={purviewTheme.card}
                  disabledApprove={proposal.status !== "pending"}
                  disabledReject={proposal.status !== "pending"}
                  canApprove={canApproveLabels()}
                  canReview={canReviewLabels()}
                  onClick={() => openDetailPanel(proposal)}
                />
              );
            })}
          </ProposalsGrid>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <ModalOverlay>
            <ModalCard>
              <ModalTitle>
                {modalData ? "Edit Proposal" : "Create Proposal"}
              </ModalTitle>
              <FormFields>
                <div>
                  <Label>Label</Label>
                  <FilterDropdown
                    options={[
                      { value: "", label: "Select label" },
                      ...labels.map((l) => ({
                        value: String(l.id),
                        label: l.name,
                      })),
                    ]}
                    value={formData.label_id ? String(formData.label_id) : ""}
                    onChange={(value) =>
                      setFormData({
                        ...formData,
                        label_id: value ? Number(value) : undefined,
                      })
                    }
                    width="100%"
                  />
                </div>
                <div>
                  <Label>Object Type</Label>
                  <Input
                    value={formData.object_type || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, object_type: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Object ID</Label>
                  <Input
                    value={formData.object_id || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, object_id: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Justification</Label>
                  <textarea
                    value={formData.justification || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        justification: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 16px",
                      border: `1px solid ${purviewTheme.border}`,
                      borderRadius: "4px",
                      fontSize: "14px",
                      color: purviewTheme.text,
                      backgroundColor: purviewTheme.bg,
                      minHeight: "80px",
                      resize: "vertical",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </FormFields>
              <ModalActions>
                <Button variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveProposal}>
                  {modalData ? "Save" : "Create"}
                </Button>
              </ModalActions>
            </ModalCard>
          </ModalOverlay>
        )}
        {detailPanelOpen && selectedProposalForDetail && (
          <DetailPanel
            proposal={selectedProposalForDetail}
            labelName={
              labels.find((l) => l.id === selectedProposalForDetail.label_id)
                ?.name || "Unknown Label"
            }
            proposedByUser={
              users.find((u) => u.id === selectedProposalForDetail.proposed_by)
                ?.displayName || "Unknown User"
            }
            onClose={closeDetailPanel}
            onApprove={() => handleVote(selectedProposalForDetail.id, true)}
            onReject={() => handleVote(selectedProposalForDetail.id, false)}
            onEdit={() => {
              openEdit(selectedProposalForDetail);
              closeDetailPanel();
            }}
            onDelete={() => {
              handleDelete(selectedProposalForDetail.id);
            }}
            canApprove={canApproveLabels()}
            disabledApprove={selectedProposalForDetail.status !== "pending"}
            disabledReject={selectedProposalForDetail.status !== "pending"}
          />
        )}
      </PageContainer>
    </ApiErrorBoundary>
  );
};

export default ProposalsTab;
