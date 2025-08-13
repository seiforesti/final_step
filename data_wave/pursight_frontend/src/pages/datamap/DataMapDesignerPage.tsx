import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Divider,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Breadcrumbs,
  Link,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Chip,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  FormHelperText,
} from "@mui/material";
import {
  FiHome,
  FiChevronRight,
  FiPlus,
  FiSave,
  FiDownload,
  FiUpload,
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
  FiMinimize,
  FiGrid,
  FiLayers,
  FiDatabase,
  FiServer,
  FiHardDrive,
  FiBox,
  FiCpu,
  FiSettings,
  FiTrash2,
  FiCopy,
  FiEdit,
  FiLink,
  FiUnlink,
  FiSearch,
  FiX,
  FiInfo,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import ThemeToggle from "../../components/ThemeToggle";
import { useDataMapQuery, useUpdateDataMapMutation } from "../../api/dataMaps";
import { DataMap, DataMapNode, DataMapEdge } from "../../models/DataMap";

// Types are now imported from models/DataMap.ts

// Composant principal pour la page de conception de carte de données
const DataMapDesignerPage: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Utiliser React Query pour charger les données
  const { data: dataMapData, isLoading, error } = useDataMapQuery(id || "");
  const updateDataMapMutation = useUpdateDataMapMutation();

  const [dataMap, setDataMap] = useState<DataMap | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState<boolean>(true);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState<boolean>(false);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    nodeId?: string;
  } | null>(null);

  // Mettre à jour l'état local lorsque les données sont chargées
  useEffect(() => {
    if (dataMapData) {
      setDataMap(dataMapData);
    }
  }, [dataMapData]);

  // Gérer le zoom
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  // Gérer le mode plein écran
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Gérer le menu contextuel
  const handleContextMenu = (event: React.MouseEvent, nodeId?: string) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            nodeId,
          }
        : null
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Gérer la sélection des éléments
  const handleSelectNode = (nodeId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-sélection avec Ctrl/Cmd
      setSelectedElements((prev) =>
        prev.includes(nodeId)
          ? prev.filter((id) => id !== nodeId)
          : [...prev, nodeId]
      );
    } else {
      // Sélection simple
      setSelectedElements([nodeId]);
    }
    event.stopPropagation();
  };

  // Effacer la sélection en cliquant sur le canevas
  const handleCanvasClick = () => {
    setSelectedElements([]);
  };

  // Gérer la sauvegarde
  const handleSave = () => {
    setIsSaveDialogOpen(true);
  };

  const handleSaveConfirm = () => {
    if (dataMap && id) {
      updateDataMapMutation.mutate({
        id,
        name: dataMap.name,
        description: dataMap.description,
        nodes: dataMap.nodes,
        edges: dataMap.edges,
        version: dataMap.version + 1,
      });
      setIsSaveDialogOpen(false);
    }
  };

  // Calculer la couleur de bordure pour les nœuds sélectionnés
  const getNodeBorderColor = (nodeId: string) => {
    return selectedElements.includes(nodeId)
      ? theme.palette.primary.main
      : "transparent";
  };

  // Obtenir la couleur de fond pour les nœuds
  const getNodeBackgroundColor = (node: DataMapNode) => {
    const baseColor = node.color || theme.palette.primary.main;
    return alpha(baseColor, theme.palette.mode === "dark" ? 0.7 : 0.1);
  };

  // Obtenir l'icône pour un type de nœud
  const getNodeIcon = (type: DataMapNode["type"]) => {
    switch (type) {
      case "database":
        return <FiDatabase size={20} />;
      case "table":
        return <FiGrid size={20} />;
      case "column":
        return <FiList size={20} />;
      case "process":
        return <FiCpu size={20} />;
      case "service":
        return <FiServer size={20} />;
      case "group":
        return <FiLayers size={20} />;
      default:
        return <FiBox size={20} />;
    }
  };

  // Obtenir la couleur pour un type d'arête
  const getEdgeColor = (type: DataMapEdge["type"]) => {
    switch (type) {
      case "dataflow":
        return theme.palette.primary.main;
      case "relationship":
        return theme.palette.secondary.main;
      case "dependency":
        return theme.palette.warning.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  // Calculer les points de connexion pour les arêtes
  const calculateEdgePoints = (
    edge: DataMapEdge
  ): { start: { x: number; y: number }; end: { x: number; y: number } } => {
    const sourceNode = dataMap.nodes.find((node) => node.id === edge.source);
    const targetNode = dataMap.nodes.find((node) => node.id === edge.target);

    if (!sourceNode || !targetNode) {
      return { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
    }

    // Points de départ et d'arrivée simplifiés (centres des nœuds)
    const start = {
      x: sourceNode.x + sourceNode.width / 2,
      y: sourceNode.y + sourceNode.height / 2,
    };

    const end = {
      x: targetNode.x + targetNode.width / 2,
      y: targetNode.y + targetNode.height / 2,
    };

    return { start, end };
  };

  // Générer le chemin SVG pour une arête
  const generateEdgePath = (edge: DataMapEdge): string => {
    const { start, end } = calculateEdgePoints(edge);

    // Calculer les points de contrôle pour une courbe de Bézier
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const controlPointOffset = Math.abs(dx) * 0.5;

    const controlPoint1 = {
      x: start.x + controlPointOffset,
      y: start.y,
    };

    const controlPoint2 = {
      x: end.x - controlPointOffset,
      y: end.y,
    };

    return `M ${start.x} ${start.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${end.x} ${end.y}`;
  };

  // Composant pour le panneau de propriétés
  const PropertiesPanel = () => {
    const selectedNode =
      selectedElements.length === 1
        ? dataMap.nodes.find((node) => node.id === selectedElements[0])
        : null;

    const selectedEdge =
      selectedElements.length === 1
        ? dataMap.edges.find((edge) => edge.id === selectedElements[0])
        : null;

    if (!selectedNode && !selectedEdge) {
      // Afficher un indicateur de chargement pendant le chargement des données
      if (isLoading) {
        return (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        );
      }

      // Afficher un message d'erreur si le chargement a échoué
      if (error || !dataMap) {
        return (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">
              Erreur lors du chargement de la carte de données. Veuillez
              réessayer plus tard.
            </Alert>
          </Box>
        );
      }

      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Sélectionnez un élément pour voir ses propriétés.
          </Typography>
        </Box>
      );
    }

    if (selectedNode) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Propriétés du nœud
          </Typography>

          <TextField
            label="Nom"
            value={selectedNode.name}
            fullWidth
            margin="dense"
            size="small"
            variant="outlined"
          />

          <TextField
            label="Description"
            value={selectedNode.description || ""}
            fullWidth
            margin="dense"
            size="small"
            variant="outlined"
            multiline
            rows={2}
          />

          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Type</InputLabel>
            <Select value={selectedNode.type} label="Type">
              <MenuItem value="database">Base de données</MenuItem>
              <MenuItem value="table">Table</MenuItem>
              <MenuItem value="column">Colonne</MenuItem>
              <MenuItem value="process">Processus</MenuItem>
              <MenuItem value="service">Service</MenuItem>
              <MenuItem value="group">Groupe</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Position et taille
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                label="X"
                value={selectedNode.x}
                size="small"
                type="number"
                sx={{ width: "50%" }}
              />
              <TextField
                label="Y"
                value={selectedNode.y}
                size="small"
                type="number"
                sx={{ width: "50%" }}
              />
            </Box>
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <TextField
                label="Largeur"
                value={selectedNode.width}
                size="small"
                type="number"
                sx={{ width: "50%" }}
              />
              <TextField
                label="Hauteur"
                value={selectedNode.height}
                size="small"
                type="number"
                sx={{ width: "50%" }}
              />
            </Box>
          </Box>

          {selectedNode.properties &&
            Object.keys(selectedNode.properties).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Propriétés personnalisées
                </Typography>
                {Object.entries(selectedNode.properties).map(([key, value]) => (
                  <Box key={key} sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <TextField
                      label="Clé"
                      value={key}
                      size="small"
                      sx={{ width: "40%" }}
                    />
                    <TextField
                      label="Valeur"
                      value={value}
                      size="small"
                      sx={{ width: "60%" }}
                    />
                  </Box>
                ))}
                <Button startIcon={<FiPlus />} size="small" sx={{ mt: 1 }}>
                  Ajouter une propriété
                </Button>
              </Box>
            )}
        </Box>
      );
    }

    if (selectedEdge) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Propriétés de la connexion
          </Typography>

          <TextField
            label="Étiquette"
            value={selectedEdge.label || ""}
            fullWidth
            margin="dense"
            size="small"
            variant="outlined"
          />

          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Type</InputLabel>
            <Select value={selectedEdge.type} label="Type">
              <MenuItem value="dataflow">Flux de données</MenuItem>
              <MenuItem value="relationship">Relation</MenuItem>
              <MenuItem value="dependency">Dépendance</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Connexion
            </Typography>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Source</InputLabel>
              <Select value={selectedEdge.source} label="Source">
                {dataMap.nodes.map((node) => (
                  <MenuItem key={node.id} value={node.id}>
                    {node.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense" size="small">
              <InputLabel>Cible</InputLabel>
              <Select value={selectedEdge.target} label="Cible">
                {dataMap.nodes.map((node) => (
                  <MenuItem key={node.id} value={node.id}>
                    {node.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {selectedEdge.properties &&
            Object.keys(selectedEdge.properties).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Propriétés personnalisées
                </Typography>
                {Object.entries(selectedEdge.properties).map(([key, value]) => (
                  <Box key={key} sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <TextField
                      label="Clé"
                      value={key}
                      size="small"
                      sx={{ width: "40%" }}
                    />
                    <TextField
                      label="Valeur"
                      value={value}
                      size="small"
                      sx={{ width: "60%" }}
                    />
                  </Box>
                ))}
                <Button startIcon={<FiPlus />} size="small" sx={{ mt: 1 }}>
                  Ajouter une propriété
                </Button>
              </Box>
            )}
        </Box>
      );
    }

    return null;
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        ...(isFullScreen && {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
        }),
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mr: 2 }}>
            Microsoft Purview
          </Typography>
          <Breadcrumbs separator={<FiChevronRight size={14} />} sx={{ ml: 2 }}>
            <Link
              href="#"
              underline="hover"
              color="inherit"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <FiHome size={16} style={{ marginRight: 8 }} />
              Accueil
            </Link>
            <Link href="#" underline="hover" color="inherit">
              Cartes de données
            </Link>
            <Typography color="text.primary">{dataMap?.name ?? ""}</Typography>
          </Breadcrumbs>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FiSave />}
            size="small"
            onClick={handleSave}
          >
            Enregistrer
          </Button>
          <ThemeToggle />
        </Box>
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: alpha(theme.palette.background.paper, 0.5),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Ajouter un nœud">
            <IconButton size="small">
              <FiPlus />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ajouter une connexion">
            <IconButton size="small">
              <FiLink />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Tooltip title="Supprimer">
            <IconButton size="small" disabled={selectedElements.length === 0}>
              <FiTrash2 />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dupliquer">
            <IconButton size="small" disabled={selectedElements.length === 0}>
              <FiCopy />
            </IconButton>
          </Tooltip>
          <Tooltip title="Éditer">
            <IconButton size="small" disabled={selectedElements.length !== 1}>
              <FiEdit />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Zoom avant">
            <IconButton size="small" onClick={handleZoomIn}>
              <FiZoomIn />
            </IconButton>
          </Tooltip>
          <Typography
            variant="body2"
            sx={{ minWidth: 45, textAlign: "center" }}
          >
            {Math.round(zoomLevel * 100)}%
          </Typography>
          <Tooltip title="Zoom arrière">
            <IconButton size="small" onClick={handleZoomOut}>
              <FiZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="Réinitialiser le zoom">
            <IconButton size="small" onClick={handleZoomReset}>
              <FiGrid />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          <Tooltip
            title={isFullScreen ? "Quitter le plein écran" : "Plein écran"}
          >
            <IconButton size="small" onClick={toggleFullScreen}>
              {isFullScreen ? <FiMinimize /> : <FiMaximize />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        {/* Left sidebar */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={isDrawerOpen}
          sx={{
            width: 280,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
              position: "relative",
              height: "100%",
              border: "none",
              borderRight: 1,
              borderColor: "divider",
            },
          }}
        >
          <Box sx={{ p: 1, borderBottom: 1, borderColor: "divider" }}>
            <TextField
              placeholder="Rechercher des éléments"
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <FiSearch style={{ marginRight: 8 }} />,
              }}
            />
          </Box>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Éléments" />
            <Tab label="Modèles" />
          </Tabs>
          {activeTab === 0 && (
            <List sx={{ overflow: "auto", flexGrow: 1 }}>
              <ListItem sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Nœuds
                </Typography>
              </ListItem>
              {(dataMap?.nodes ?? []).map((node) => (
                <ListItemButton
                  key={node.id}
                  selected={selectedElements.includes(node.id)}
                  onClick={(e) => handleSelectNode(node.id, e)}
                  sx={{ py: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getNodeIcon(node.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={node.name}
                    primaryTypographyProps={{
                      variant: "body2",
                      noWrap: true,
                    }}
                  />
                </ListItemButton>
              ))}
              <ListItem sx={{ px: 2, py: 1, mt: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Connexions
                </Typography>
              </ListItem>
              {(dataMap?.edges ?? []).map((edge) => {
                const sourceNode = (dataMap?.nodes ?? []).find(
                  (n) => n.id === edge.source
                );
                const targetNode = (dataMap?.nodes ?? []).find(
                  (n) => n.id === edge.target
                );
                return (
                  <ListItemButton
                    key={edge.id}
                    selected={selectedElements.includes(edge.id)}
                    onClick={(e) => handleSelectNode(edge.id, e)}
                    sx={{ py: 0.5 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <FiLink size={18} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        edge.label ||
                        `${sourceNode?.name || "Source"} → ${
                          targetNode?.name || "Cible"
                        }`
                      }
                      primaryTypographyProps={{
                        variant: "body2",
                        noWrap: true,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
          {activeTab === 1 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Les modèles vous permettent de réutiliser des structures de
                carte de données prédéfinies.
              </Typography>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Button variant="outlined" startIcon={<FiPlus />} size="small">
                  Créer un modèle
                </Button>
              </Box>
            </Box>
          )}
        </Drawer>

        {/* Canvas */}
        <Box
          ref={canvasRef}
          sx={{
            flexGrow: 1,
            position: "relative",
            overflow: "auto",
            bgcolor: theme.palette.mode === "dark" ? "#1a1a1a" : "#f5f5f5",
            backgroundImage: `
              linear-gradient(to right, ${alpha(
                theme.palette.divider,
                0.1
              )} 1px, transparent 1px),
              linear-gradient(to bottom, ${alpha(
                theme.palette.divider,
                0.1
              )} 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
          onClick={handleCanvasClick}
          onContextMenu={handleContextMenu}
        >
          <Box
            sx={{
              position: "relative",
              transform: `scale(${zoomLevel})`,
              transformOrigin: "0 0",
              width: "2000px",
              height: "1500px",
            }}
          >
            {/* Render edges */}
            <svg
              width="100%"
              height="100%"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                pointerEvents: "none",
              }}
            >
              {(dataMap?.edges ?? []).map((edge) => {
                const { start, end } = calculateEdgePoints(edge);
                const path = generateEdgePath(edge);
                const isSelected = selectedElements.includes(edge.id);
                const edgeColor = getEdgeColor(edge.type);

                return (
                  <g key={edge.id}>
                    <path
                      d={path}
                      fill="none"
                      stroke={edgeColor}
                      strokeWidth={isSelected ? 3 : 2}
                      strokeDasharray={
                        edge.type === "dependency" ? "5,5" : "none"
                      }
                      style={{ pointerEvents: "stroke" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectNode(edge.id, e);
                      }}
                    />
                    {edge.label && (
                      <text
                        x={(start.x + end.x) / 2}
                        y={(start.y + end.y) / 2 - 10}
                        textAnchor="middle"
                        fill={theme.palette.text.primary}
                        fontSize={12}
                        dy="-5"
                        style={{
                          pointerEvents: "none",
                          userSelect: "none",
                          filter: `drop-shadow(0px 0px 2px ${theme.palette.background.paper})`,
                        }}
                      >
                        {edge.label}
                      </text>
                    )}
                    {/* Arrow head */}
                    <marker
                      id={`arrowhead-${edge.id}`}
                      markerWidth="10"
                      markerHeight="7"
                      refX="10"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill={edgeColor} />
                    </marker>
                  </g>
                );
              })}
            </svg>

            {/* Render nodes */}
            {(dataMap?.nodes ?? []).map((node) => (
              <Paper
                key={node.id}
                elevation={selectedElements.includes(node.id) ? 8 : 2}
                sx={{
                  position: "absolute",
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${node.width}px`,
                  height: `${node.height}px`,
                  bgcolor: getNodeBackgroundColor(node),
                  color: node.color || theme.palette.primary.main,
                  borderRadius: 1,
                  border: 2,
                  borderColor: getNodeBorderColor(node),
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s, transform 0.1s",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={(e) => handleSelectNode(node.id, e)}
                onContextMenu={(e) => handleContextMenu(e, node.id)}
              >
                <Box
                  sx={{
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: alpha(
                      node.color || theme.palette.primary.main,
                      theme.palette.mode === "dark" ? 0.4 : 0.1
                    ),
                  }}
                >
                  <Box
                    sx={{
                      mr: 1,
                      display: "flex",
                      alignItems: "center",
                      color: node.color || theme.palette.primary.main,
                    }}
                  >
                    {getNodeIcon(node.type)}
                  </Box>
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    noWrap
                    sx={{ flexGrow: 1 }}
                  >
                    {node.name}
                  </Typography>
                </Box>
                {node.description && (
                  <Box sx={{ p: 1, fontSize: "0.75rem" }}>
                    <Typography variant="body2" noWrap>
                      {node.description}
                    </Typography>
                  </Box>
                )}
                {node.properties && Object.keys(node.properties).length > 0 && (
                  <Box
                    sx={{
                      mt: "auto",
                      p: 0.5,
                      borderTop: 1,
                      borderColor: "divider",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    {Object.entries(node.properties).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Right sidebar - Properties */}
        {isPropertiesOpen && (
          <Box
            sx={{
              width: 300,
              flexShrink: 0,
              borderLeft: 1,
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 1,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Propriétés
              </Typography>
              <IconButton
                size="small"
                onClick={() => setIsPropertiesOpen(false)}
                aria-label="Fermer le panneau de propriétés"
              >
                <FiX size={18} />
              </IconButton>
            </Box>
            <Box sx={{ overflow: "auto", flexGrow: 1 }}>
              <PropertiesPanel />
            </Box>
          </Box>
        )}

        {/* Button to open properties panel if closed */}
        {!isPropertiesOpen && (
          <Box
            sx={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
            }}
          >
            <Tooltip title="Afficher les propriétés" placement="left">
              <IconButton
                onClick={() => setIsPropertiesOpen(true)}
                sx={{
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                  borderRight: 0,
                  borderRadius: "4px 0 0 4px",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <FiSettings />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {contextMenu?.nodeId ? (
          // Menu for node
          <>
            <MenuItem onClick={handleCloseContextMenu}>
              <ListItemIcon>
                <FiEdit size={18} />
              </ListItemIcon>
              <ListItemText>Éditer</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleCloseContextMenu}>
              <ListItemIcon>
                <FiCopy size={18} />
              </ListItemIcon>
              <ListItemText>Dupliquer</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleCloseContextMenu}>
              <ListItemIcon>
                <FiLink size={18} />
              </ListItemIcon>
              <ListItemText>Créer une connexion</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleCloseContextMenu}>
              <ListItemIcon>
                <FiTrash2 size={18} />
              </ListItemIcon>
              <ListItemText>Supprimer</ListItemText>
            </MenuItem>
          </>
        ) : (
          // Menu for canvas
          <>
            <MenuItem onClick={handleCloseContextMenu}>
              <ListItemIcon>
                <FiPlus size={18} />
              </ListItemIcon>
              <ListItemText>Ajouter un nœud</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleCloseContextMenu}>
              <ListItemIcon>
                <FiGrid size={18} />
              </ListItemIcon>
              <ListItemText>Réinitialiser la vue</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleCloseContextMenu}>
              <ListItemIcon>
                <FiSave size={18} />
              </ListItemIcon>
              <ListItemText>Enregistrer la carte</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Save Dialog */}
      <Dialog
        open={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Enregistrer la carte de données</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom"
            fullWidth
            variant="outlined"
            value={dataMap?.name ?? ""}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={dataMap?.description ?? ""}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Version</InputLabel>
            <Select value={(dataMap?.version ?? "").toString()} label="Version">
              <MenuItem value={(dataMap?.version ?? "").toString()}>
                {dataMap?.version?.toFixed ? dataMap.version.toFixed(1) : ""}
              </MenuItem>
              <MenuItem
                value={
                  dataMap && typeof dataMap.version === "number"
                    ? (dataMap.version + 0.1).toString()
                    : ""
                }
              >
                {dataMap && typeof dataMap.version === "number"
                  ? (dataMap.version + 0.1).toFixed(1)
                  : ""}
              </MenuItem>
              <MenuItem
                value={
                  dataMap && typeof dataMap.version === "number"
                    ? (dataMap.version + 1).toString()
                    : ""
                }
              >
                {dataMap && typeof dataMap.version === "number"
                  ? (dataMap.version + 1).toFixed(1)
                  : ""}
              </MenuItem>
            </Select>
            <FormHelperText>
              La version actuelle est{" "}
              {dataMap?.version?.toFixed ? dataMap.version.toFixed(1) : ""}
            </FormHelperText>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsSaveDialogOpen(false)} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleSaveConfirm}
            variant="contained"
            color="primary"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataMapDesignerPage;