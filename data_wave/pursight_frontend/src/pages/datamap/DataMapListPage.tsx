import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Tooltip,
  useTheme,
  Divider,
} from '@mui/material';
import {
  FiHome,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiDownload,
  FiUpload,
  FiMoreVertical,
  FiSearch,
  FiFilter,
  FiChevronRight,
} from 'react-icons/fi';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDataMapsQuery, useCreateDataMapMutation, useDeleteDataMapMutation, useDuplicateDataMapMutation, useExportDataMapMutation } from '../../api/dataMaps';
import { DataMap } from '../../models/DataMap';
import ThemeToggle from '../../components/ThemeToggle';

const DataMapListPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    dataMapId: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dataMapToDelete, setDataMapToDelete] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newDataMapName, setNewDataMapName] = useState('');
  const [newDataMapDescription, setNewDataMapDescription] = useState('');

  // États pour la duplication
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [dataMapToDuplicate, setDataMapToDuplicate] = useState<string | null>(null);
  const [duplicateDataMapName, setDuplicateDataMapName] = useState('');

  // Utiliser React Query pour charger les données
  const { data: dataMaps, isLoading, error } = useDataMapsQuery({ search: searchQuery });
  const createDataMapMutation = useCreateDataMapMutation();
  const deleteDataMapMutation = useDeleteDataMapMutation();
  const duplicateDataMapMutation = useDuplicateDataMapMutation();
  const exportDataMapMutation = useExportDataMapMutation();

  // Gérer le menu contextuel
  const handleContextMenu = (event: React.MouseEvent, dataMapId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      dataMapId,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Gérer la pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Gérer la création d'une nouvelle carte de données
  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewDataMapName('');
    setNewDataMapDescription('');
  };

  const handleCreateDataMap = () => {
    if (newDataMapName.trim()) {
      createDataMapMutation.mutate({
        name: newDataMapName,
        description: newDataMapDescription,
        nodes: [],
        edges: [],
      }, {
        onSuccess: (newDataMap) => {
          handleCloseCreateDialog();
          navigate(`/datamap/designer/${newDataMap.id}`);
        }
      });
    }
  };

  // Gérer la suppression d'une carte de données
  const handleOpenDeleteDialog = (dataMapId: string) => {
    setDataMapToDelete(dataMapId);
    setDeleteDialogOpen(true);
    handleCloseContextMenu();
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDataMapToDelete(null);
  };

  const handleDeleteDataMap = () => {
    if (dataMapToDelete) {
      deleteDataMapMutation.mutate(dataMapToDelete, {
        onSuccess: () => {
          handleCloseDeleteDialog();
        }
      });
    }
  };

  // Gérer la duplication d'une carte de données
  const handleOpenDuplicateDialog = (dataMapId: string) => {
    const dataMap = dataMaps?.find(dm => dm.id === dataMapId);
    if (dataMap) {
      setDataMapToDuplicate(dataMapId);
      setDuplicateDataMapName(`${dataMap.name} (copie)`);
      setDuplicateDialogOpen(true);
      handleCloseContextMenu();
    }
  };

  const handleCloseDuplicateDialog = () => {
    setDuplicateDialogOpen(false);
    setDataMapToDuplicate(null);
    setDuplicateDataMapName('');
  };

  const handleDuplicateDataMap = () => {
    if (dataMapToDuplicate && duplicateDataMapName.trim()) {
      duplicateDataMapMutation.mutate({
        id: dataMapToDuplicate,
        newName: duplicateDataMapName
      }, {
        onSuccess: (newDataMap) => {
          handleCloseDuplicateDialog();
          // Optionnel : naviguer vers la nouvelle carte dupliquée
          // navigate(`/datamap/designer/${newDataMap.id}`);
        }
      });
    }
  };

  // Gérer l'exportation d'une carte de données
  const handleExportDataMap = (dataMapId: string) => {
    exportDataMapMutation.mutate(dataMapId, {
      onSuccess: (blob) => {
        // Créer un URL pour le blob
        const url = window.URL.createObjectURL(blob);
        
        // Créer un élément a temporaire
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // Trouver le nom de la carte de données pour le nom du fichier
        const dataMap = dataMaps?.find(dm => dm.id === dataMapId);
        a.download = `${dataMap?.name || 'datamap'}_${new Date().toISOString().split('T')[0]}.json`;
        
        // Ajouter au DOM et déclencher le téléchargement
        document.body.appendChild(a);
        a.click();
        
        // Nettoyer
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        handleCloseContextMenu();
      }
    });
  };

  // Gérer la navigation vers la page de conception
  const handleOpenDataMap = (dataMapId: string) => {
    navigate(`/datamap/designer/${dataMapId}`);
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  // Afficher un indicateur de chargement pendant le chargement des données
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Afficher un message d'erreur si le chargement a échoué
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Erreur lors du chargement des cartes de données. Veuillez réessayer plus tard.
        </Alert>
      </Box>
    );
  }

  // Filtrer et paginer les données
  const filteredDataMaps = dataMaps || [];
  const paginatedDataMaps = filteredDataMaps.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Breadcrumbs separator={<FiChevronRight size={14} />} aria-label="breadcrumb">
            <Link color="inherit" href="/" underline="hover">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FiHome size={16} style={{ marginRight: '4px' }} />
                Accueil
              </Box>
            </Link>
            <Typography color="text.primary">Cartes de données</Typography>
          </Breadcrumbs>
          <Typography variant="h4" sx={{ mt: 1 }}>
            Cartes de données
          </Typography>
        </Box>
        <Box>
          <ThemeToggle />
        </Box>
      </Box>

      {/* Barre d'outils */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <FiSearch size={18} style={{ marginRight: '8px' }} />,
            }}
            sx={{ width: '300px', mr: 2 }}
          />
          <IconButton size="small" sx={{ mr: 1 }}>
            <FiFilter />
          </IconButton>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<FiPlus />}
            onClick={handleOpenCreateDialog}
          >
            Nouvelle carte
          </Button>
        </Box>
      </Box>

      {/* Tableau des cartes de données */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Créé par</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell>Dernière mise à jour</TableCell>
              <TableCell>Version</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedDataMaps.length > 0 ? (
              paginatedDataMaps.map((dataMap: DataMap) => (
                <TableRow key={dataMap.id} hover onClick={() => handleOpenDataMap(dataMap.id)}>
                  <TableCell>{dataMap.name}</TableCell>
                  <TableCell>{dataMap.description || '-'}</TableCell>
                  <TableCell>{dataMap.createdBy}</TableCell>
                  <TableCell>{formatDate(dataMap.createdAt)}</TableCell>
                  <TableCell>{formatDate(dataMap.updatedAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={`v${dataMap.version}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e, dataMap.id);
                      }}
                    >
                      <FiMoreVertical />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucune carte de données trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredDataMaps.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Lignes par page :"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />

      {/* Menu contextuel */}
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
        <MenuItem onClick={() => {
          if (contextMenu) handleOpenDataMap(contextMenu.dataMapId);
          handleCloseContextMenu();
        }}>
          <ListItemIcon>
            <FiEdit size={18} />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (contextMenu) {
            handleOpenDuplicateDialog(contextMenu.dataMapId);
          }
        }}>
          <ListItemIcon>
            <FiCopy size={18} />
          </ListItemIcon>
          <ListItemText>Dupliquer</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (contextMenu) {
            handleExportDataMap(contextMenu.dataMapId);
          }
        }}>
          <ListItemIcon>
            <FiDownload size={18} />
          </ListItemIcon>
          <ListItemText>Exporter</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          if (contextMenu) handleOpenDeleteDialog(contextMenu.dataMapId);
        }}>
          <ListItemIcon>
            <FiTrash2 size={18} color={theme.palette.error.main} />
          </ListItemIcon>
          <ListItemText sx={{ color: theme.palette.error.main }}>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialogue de création */}
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Créer une nouvelle carte de données</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom"
            fullWidth
            value={newDataMapName}
            onChange={(e) => setNewDataMapName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newDataMapDescription}
            onChange={(e) => setNewDataMapDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Annuler</Button>
          <Button
            onClick={handleCreateDataMap}
            variant="contained"
            disabled={!newDataMapName.trim() || createDataMapMutation.isLoading}
          >
            {createDataMapMutation.isLoading ? <CircularProgress size={24} /> : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de suppression */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette carte de données ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button
            onClick={handleDeleteDataMap}
            color="error"
            disabled={deleteDataMapMutation.isLoading}
          >
            {deleteDataMapMutation.isLoading ? <CircularProgress size={24} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de duplication */}
      <Dialog open={duplicateDialogOpen} onClose={handleCloseDuplicateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Dupliquer la carte de données</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la copie"
            fullWidth
            value={duplicateDataMapName}
            onChange={(e) => setDuplicateDataMapName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDuplicateDialog}>Annuler</Button>
          <Button
            onClick={handleDuplicateDataMap}
            variant="contained"
            disabled={!duplicateDataMapName.trim() || duplicateDataMapMutation.isLoading}
          >
            {duplicateDataMapMutation.isLoading ? <CircularProgress size={24} /> : 'Dupliquer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataMapListPage;