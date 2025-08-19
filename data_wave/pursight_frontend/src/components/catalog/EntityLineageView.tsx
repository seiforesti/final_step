import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  useTheme,
} from "@mui/material";
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  CenterFocusStrong as CenterFocusStrongIcon,
  Storage as StorageIcon,
  DataObject as DataObjectIcon,
  TableChart as TableChartIcon,
  ViewColumn as ViewColumnIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  SettingsEthernet as SettingsEthernetIcon,
} from "@mui/icons-material";
import { useDataCatalog } from "../../hooks/useDataCatalog";
import { useDataSources } from "../../hooks/useDataSources";
import { getDataSources as fetchDataSources } from "../../api/dataSources";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Panel,
  MarkerType,
  Position,
  Handle,
  NodeProps,
} from "reactflow";
import "reactflow/dist/style.css";

interface EntityLineageViewProps {
  entityId: number;
  entityType: string;
  onEntityClick?: (entityId: number, entityType: string) => void;
}

// Custom node component for entities
const EntityNode: React.FC<NodeProps> = ({ data, isConnectable }) => {
  const theme = useTheme();

  // Get entity icon
  const getEntityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "database":
        return <StorageIcon fontSize="small" />;
      case "schema":
        return <DataObjectIcon fontSize="small" />;
      case "table":
        return <TableChartIcon fontSize="small" />;
      case "column":
        return <ViewColumnIcon fontSize="small" />;
      case "folder":
        return <FolderIcon fontSize="small" />;
      case "file":
        return <FileIcon fontSize="small" />;
      default:
        return <DataObjectIcon fontSize="small" />;
    }
  };

  // Get border color based on entity type
  const getBorderColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "database":
        return theme.palette.primary.main;
      case "schema":
        return theme.palette.secondary.main;
      case "table":
        return theme.palette.info.main;
      case "column":
        return theme.palette.success.main;
      case "folder":
        return theme.palette.warning.main;
      case "file":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <div
      style={{
        padding: "10px",
        borderRadius: "5px",
        border: `2px solid ${getBorderColor(data.entity_type)}`,
        backgroundColor: theme.palette.background.paper,
        width: 200,
        boxShadow: data.isFocused
          ? `0 0 10px ${getBorderColor(data.entity_type)}`
          : "none",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ background: theme.palette.grey[600] }}
      />
      <Box display="flex" alignItems="center" mb={1}>
        {getEntityIcon(data.entity_type)}
        <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
          {data.entity_type.charAt(0).toUpperCase() + data.entity_type.slice(1)}
        </Typography>
      </Box>
      <Typography
        variant="subtitle2"
        fontWeight="bold"
        noWrap
        title={data.name}
      >
        {data.name}
      </Typography>
      {data.qualified_name && (
        <Typography
          variant="caption"
          color="textSecondary"
          noWrap
          title={data.qualified_name}
        >
          {data.qualified_name}
        </Typography>
      )}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ background: theme.palette.grey[600] }}
      />
    </div>
  );
};

// Define custom node types
const nodeTypes: NodeTypes = {
  entityNode: EntityNode,
};

const EntityLineageView: React.FC<EntityLineageViewProps> = ({
  entityId,
  entityType,
  onEntityClick,
}) => {
  const { getEntityLineage } = useDataCatalog();
  // Use the hook for cached data and refresh, but use API for direct fetch
  const { dataSources: cachedDataSources, refreshAllDataSourceData } =
    useDataSources();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lineageData, setLineageData] = useState<any | null>(null);
  const [localDataSources, setLocalDataSources] = useState<any[]>([]);

  // ReactFlow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Lineage depth control
  const [upstreamDepth, setUpstreamDepth] = useState<number>(2);
  const [downstreamDepth, setDownstreamDepth] = useState<number>(2);

  // Reference to the flow container
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Load data sources
  useEffect(() => {
    const loadDataSources = async () => {
      try {
        // Try to use cached data first
        if (cachedDataSources && Array.isArray(cachedDataSources)) {
          setLocalDataSources(cachedDataSources);
        } else {
          const sourcesData = await fetchDataSources();
          setLocalDataSources(sourcesData);
        }
      } catch (err: any) {
        console.error("Failed to load data sources:", err);
      }
    };
    loadDataSources();
  }, [cachedDataSources]);

  // Load lineage data
  useEffect(() => {
    const loadLineageData = async () => {
      if (!entityId || !entityType) return;

      try {
        setIsLoading(true);
        setError(null);

        const lineage = await getEntityLineage(entityType, entityId, {
          upstream_depth: upstreamDepth,
          downstream_depth: downstreamDepth,
        });

        setLineageData(lineage);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load lineage data");
      } finally {
        setIsLoading(false);
      }
    };

    loadLineageData();
  }, [entityId, entityType, upstreamDepth, downstreamDepth]);

  // Transform lineage data to ReactFlow nodes and edges
  useEffect(() => {
    if (!lineageData) return;

    const transformedNodes: Node[] = [];
    const transformedEdges: Edge[] = [];

    // Helper function to get data source name
    const getDataSourceName = (dataSourceId: number) => {
      const dataSource = localDataSources.find((ds) => ds.id === dataSourceId);
      return dataSource ? dataSource.name : `ID: ${dataSourceId}`;
    };

    // Process entities (nodes)
    if (lineageData.entities && Array.isArray(lineageData.entities)) {
      lineageData.entities.forEach((entity: any, index: number) => {
        // Calculate position based on lineage direction
        let x = 0;
        let y = 0;

        if (entity.id === entityId && entity.entity_type === entityType) {
          // Center the focus entity
          x = 250;
          y = 250;
        } else if (entity.direction === "upstream") {
          // Position upstream entities to the left
          x = 250 - entity.depth * 300;
          y = 250 + ((index % 3) - 1) * 150;
        } else if (entity.direction === "downstream") {
          // Position downstream entities to the right
          x = 250 + entity.depth * 300;
          y = 250 + ((index % 3) - 1) * 150;
        }

        transformedNodes.push({
          id: `${entity.entity_type}-${entity.id}`,
          type: "entityNode",
          position: { x, y },
          data: {
            ...entity,
            isFocused:
              entity.id === entityId && entity.entity_type === entityType,
            dataSourceName: getDataSourceName(entity.data_source_id),
            onClick: () =>
              onEntityClick && onEntityClick(entity.id, entity.entity_type),
          },
        });
      });
    }

    // Process relationships (edges)
    if (lineageData.relationships && Array.isArray(lineageData.relationships)) {
      lineageData.relationships.forEach((rel: any, index: number) => {
        transformedEdges.push({
          id: `edge-${index}`,
          source: `${rel.source_type}-${rel.source_id}`,
          target: `${rel.target_type}-${rel.target_id}`,
          animated: true,
          style: { stroke: "#888" },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#888",
          },
          label: rel.relationship_type || "relates to",
        });
      });
    }

    setNodes(transformedNodes);
    setEdges(transformedEdges);
  }, [lineageData, localDataSources, entityId, entityType]);

  // Handle refresh lineage
  const handleRefreshLineage = () => {
    getEntityLineage(entityType, entityId, {
      upstream_depth: upstreamDepth,
      downstream_depth: downstreamDepth,
    })
      .then((data) => setLineageData(data))
      .catch((err) =>
        setError(err.response?.data?.detail || "Failed to refresh lineage data")
      );
  };

  // Handle upstream depth change
  const handleUpstreamDepthChange = (
    event: Event,
    newValue: number | number[]
  ) => {
    setUpstreamDepth(newValue as number);
  };

  // Handle downstream depth change
  const handleDownstreamDepthChange = (
    event: Event,
    newValue: number | number[]
  ) => {
    setDownstreamDepth(newValue as number);
  };

  return (
    <Box sx={{ height: "100%", minHeight: 600 }}>
      {/* Controls */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center">
            <ArrowBackIcon color="primary" />
            <Typography variant="body2" sx={{ mx: 1 }}>
              Upstream Depth:
            </Typography>
            <Box sx={{ width: 150 }}>
              <Slider
                value={upstreamDepth}
                onChange={handleUpstreamDepthChange}
                step={1}
                marks
                min={0}
                max={5}
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center">
            <ArrowForwardIcon color="secondary" />
            <Typography variant="body2" sx={{ mx: 1 }}>
              Downstream Depth:
            </Typography>
            <Box sx={{ width: 150 }}>
              <Slider
                value={downstreamDepth}
                onChange={handleDownstreamDepthChange}
                step={1}
                marks
                min={0}
                max={5}
                valueLabelDisplay="auto"
              />
            </Box>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshLineage}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ height: 400 }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading lineage data...
          </Typography>
        </Box>
      )}

      {/* No Lineage Data Message */}
      {!isLoading &&
        lineageData &&
        lineageData.entities &&
        lineageData.entities.length <= 1 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            No lineage relationships found for this entity. Try increasing the
            depth or check if lineage data is available.
          </Alert>
        )}

      {/* Lineage Graph */}
      <Box
        ref={reactFlowWrapper}
        sx={{
          height: 600,
          border: "1px solid #ddd",
          borderRadius: 1,
          bgcolor: "#f5f5f5",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background />
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Panel position="top-right">
            <Box
              sx={{
                p: 1,
                bgcolor: "background.paper",
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <Typography variant="caption" fontWeight="bold">
                Legend
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" flexDirection="column" gap={0.5}>
                <Box display="flex" alignItems="center">
                  <StorageIcon fontSize="small" color="primary" />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Database
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <DataObjectIcon fontSize="small" color="secondary" />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Schema
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <TableChartIcon fontSize="small" color="info" />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Table
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <ViewColumnIcon fontSize="small" color="success" />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Column
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <FolderIcon fontSize="small" color="warning" />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Folder
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <FileIcon fontSize="small" color="error" />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    File
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" alignItems="center">
                  <SettingsEthernetIcon fontSize="small" />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Data Flow
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Panel>
        </ReactFlow>
      </Box>

      {/* Lineage Statistics */}
      {!isLoading && lineageData && (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Lineage Statistics
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Chip
              icon={<DataObjectIcon />}
              label={`Entities: ${
                lineageData.entities ? lineageData.entities.length : 0
              }`}
              variant="outlined"
            />
            <Chip
              icon={<SettingsEthernetIcon />}
              label={`Relationships: ${
                lineageData.relationships ? lineageData.relationships.length : 0
              }`}
              variant="outlined"
            />
            <Chip
              icon={<ArrowBackIcon />}
              label={`Upstream Entities: ${
                lineageData.entities
                  ? lineageData.entities.filter(
                      (e: any) => e.direction === "upstream"
                    ).length
                  : 0
              }`}
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<ArrowForwardIcon />}
              label={`Downstream Entities: ${
                lineageData.entities
                  ? lineageData.entities.filter(
                      (e: any) => e.direction === "downstream"
                    ).length
                  : 0
              }`}
              color="secondary"
              variant="outlined"
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default EntityLineageView;
