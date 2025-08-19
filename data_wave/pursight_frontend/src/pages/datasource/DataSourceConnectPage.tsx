import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Breadcrumbs,
  Link,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import { FiHome, FiPlus, FiSearch, FiX, FiChevronRight, FiInfo, FiCheck } from 'react-icons/fi';
import ThemeToggle from '../../components/ThemeToggle';

// Définition des types pour les sources de données
interface DataSourceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sources: DataSource[];
}

interface DataSource {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  popular?: boolean;
}

// Données fictives pour les catégories de sources de données
const dataSourceCategories: DataSourceCategory[] = [
  {
    id: 'azure',
    name: 'Azure',
    description: 'Services de données Microsoft Azure',
    icon: '/icons/azure.svg',
    sources: [
      {
        id: 'azure-sql',
        name: 'Azure SQL Database',
        description: 'Service de base de données relationnelle entièrement géré',
        icon: '/icons/azure-sql.svg',
        category: 'azure',
        popular: true,
      },
      {
        id: 'azure-synapse',
        name: 'Azure Synapse Analytics',
        description: 'Service d\'analyse illimité qui réunit l\'entreposage de données et l\'analyse de Big Data',
        icon: '/icons/azure-synapse.svg',
        category: 'azure',
        popular: true,
      },
      {
        id: 'azure-cosmos-db',
        name: 'Azure Cosmos DB',
        description: 'Service de base de données multi-modèle distribué à l\'échelle mondiale',
        icon: '/icons/azure-cosmos-db.svg',
        category: 'azure',
      },
      {
        id: 'azure-data-lake',
        name: 'Azure Data Lake Storage',
        description: 'Stockage hyperscale et sécurisé pour les charges de travail d\'analyse de données',
        icon: '/icons/azure-data-lake.svg',
        category: 'azure',
      },
    ],
  },
  {
    id: 'aws',
    name: 'Amazon Web Services',
    description: 'Services de données AWS',
    icon: '/icons/aws.svg',
    sources: [
      {
        id: 'aws-rds',
        name: 'Amazon RDS',
        description: 'Service de base de données relationnelle géré',
        icon: '/icons/aws-rds.svg',
        category: 'aws',
        popular: true,
      },
      {
        id: 'aws-redshift',
        name: 'Amazon Redshift',
        description: 'Entrepôt de données rapide et entièrement géré',
        icon: '/icons/aws-redshift.svg',
        category: 'aws',
      },
      {
        id: 'aws-dynamodb',
        name: 'Amazon DynamoDB',
        description: 'Service de base de données NoSQL entièrement géré',
        icon: '/icons/aws-dynamodb.svg',
        category: 'aws',
      },
      {
        id: 'aws-s3',
        name: 'Amazon S3',
        description: 'Service de stockage d\'objets offrant évolutivité, disponibilité des données et sécurité',
        icon: '/icons/aws-s3.svg',
        category: 'aws',
        popular: true,
      },
    ],
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    description: 'Services de données Google Cloud',
    icon: '/icons/gcp.svg',
    sources: [
      {
        id: 'gcp-bigquery',
        name: 'Google BigQuery',
        description: 'Entrepôt de données sans serveur, hautement évolutif et rentable',
        icon: '/icons/gcp-bigquery.svg',
        category: 'gcp',
        popular: true,
      },
      {
        id: 'gcp-cloud-sql',
        name: 'Google Cloud SQL',
        description: 'Service de base de données relationnelle entièrement géré',
        icon: '/icons/gcp-cloud-sql.svg',
        category: 'gcp',
      },
      {
        id: 'gcp-firestore',
        name: 'Google Firestore',
        description: 'Base de données NoSQL flexible et évolutive',
        icon: '/icons/gcp-firestore.svg',
        category: 'gcp',
      },
      {
        id: 'gcp-storage',
        name: 'Google Cloud Storage',
        description: 'Stockage d\'objets unifié pour les développeurs et les entreprises',
        icon: '/icons/gcp-storage.svg',
        category: 'gcp',
      },
    ],
  },
  {
    id: 'on-premise',
    name: 'On-Premise',
    description: 'Bases de données et stockage sur site',
    icon: '/icons/on-premise.svg',
    sources: [
      {
        id: 'sql-server',
        name: 'SQL Server',
        description: 'Système de gestion de base de données relationnelle Microsoft',
        icon: '/icons/sql-server.svg',
        category: 'on-premise',
        popular: true,
      },
      {
        id: 'oracle',
        name: 'Oracle Database',
        description: 'Système de gestion de base de données relationnelle Oracle',
        icon: '/icons/oracle.svg',
        category: 'on-premise',
        popular: true,
      },
      {
        id: 'mysql',
        name: 'MySQL',
        description: 'Système de gestion de base de données relationnelle open source',
        icon: '/icons/mysql.svg',
        category: 'on-premise',
      },
      {
        id: 'postgresql',
        name: 'PostgreSQL',
        description: 'Système de gestion de base de données relationnelle-objet open source',
        icon: '/icons/postgresql.svg',
        category: 'on-premise',
      },
    ],
  },
  {
    id: 'saas',
    name: 'SaaS',
    description: 'Applications et services cloud',
    icon: '/icons/saas.svg',
    sources: [
      {
        id: 'salesforce',
        name: 'Salesforce',
        description: 'Plateforme de gestion de la relation client (CRM)',
        icon: '/icons/salesforce.svg',
        category: 'saas',
        popular: true,
      },
      {
        id: 'sap',
        name: 'SAP',
        description: 'Logiciel de gestion d\'entreprise',
        icon: '/icons/sap.svg',
        category: 'saas',
      },
      {
        id: 'servicenow',
        name: 'ServiceNow',
        description: 'Plateforme de gestion des services d\'entreprise',
        icon: '/icons/servicenow.svg',
        category: 'saas',
      },
      {
        id: 'workday',
        name: 'Workday',
        description: 'Logiciel de gestion financière et des ressources humaines',
        icon: '/icons/workday.svg',
        category: 'saas',
      },
    ],
  },
];

// Composant principal pour la page de connexion des sources de données
const DataSourceConnectPage: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // Filtrer les sources de données en fonction de la recherche et de la catégorie sélectionnée
  const filteredSources = React.useMemo(() => {
    let sources: DataSource[] = [];
    
    // Collecter toutes les sources ou seulement celles de la catégorie sélectionnée
    if (selectedCategory) {
      const category = dataSourceCategories.find(cat => cat.id === selectedCategory);
      sources = category ? category.sources : [];
    } else {
      sources = dataSourceCategories.flatMap(category => category.sources);
    }
    
    // Filtrer par terme de recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      sources = sources.filter(source => 
        source.name.toLowerCase().includes(query) || 
        source.description.toLowerCase().includes(query)
      );
    }
    
    return sources;
  }, [searchQuery, selectedCategory]);
  
  // Sources populaires pour l'affichage en vedette
  const popularSources = React.useMemo(() => {
    return dataSourceCategories
      .flatMap(category => category.sources)
      .filter(source => source.popular);
  }, []);
  
  // Gérer l'ouverture du dialogue de connexion
  const handleOpenConnectDialog = (source: DataSource) => {
    setSelectedSource(source);
    setIsConnectDialogOpen(true);
    setActiveStep(0);
  };
  
  // Gérer la fermeture du dialogue de connexion
  const handleCloseConnectDialog = () => {
    setIsConnectDialogOpen(false);
  };
  
  // Gérer les étapes du processus de connexion
  const handleNext = () => {
    setActiveStep(prevStep => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Étapes du processus de connexion
  const steps = ['Informations de base', 'Configuration de la connexion', 'Validation'];
  
  // Rendu du contenu de l'étape actuelle
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Nom de la connexion"
              variant="outlined"
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              variant="outlined"
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Environnement</InputLabel>
              <Select
                label="Environnement"
                defaultValue=""
              >
                <MenuItem value="dev">Développement</MenuItem>
                <MenuItem value="test">Test</MenuItem>
                <MenuItem value="prod">Production</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 1:
        return (
          <Box>
            {selectedSource?.id === 'azure-sql' && (
              <>
                <TextField
                  fullWidth
                  label="Serveur"
                  variant="outlined"
                  margin="normal"
                  required
                  placeholder="exemple.database.windows.net"
                />
                <TextField
                  fullWidth
                  label="Base de données"
                  variant="outlined"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Nom d'utilisateur"
                  variant="outlined"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Mot de passe"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  required
                />
              </>
            )}
            {selectedSource?.id === 'aws-s3' && (
              <>
                <TextField
                  fullWidth
                  label="Région AWS"
                  variant="outlined"
                  margin="normal"
                  required
                  placeholder="eu-west-1"
                />
                <TextField
                  fullWidth
                  label="Nom du bucket"
                  variant="outlined"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Access Key ID"
                  variant="outlined"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Secret Access Key"
                  type="password"
                  variant="outlined"
                  margin="normal"
                  required
                />
              </>
            )}
            {/* Ajouter d'autres formulaires spécifiques aux sources ici */}
            {!['azure-sql', 'aws-s3'].includes(selectedSource?.id || '') && (
              <Typography color="text.secondary">
                Veuillez configurer les paramètres de connexion pour {selectedSource?.name}.
              </Typography>
            )}
          </Box>
        );
      case 2:
        return (
          <Box>
            <Box sx={{ 
              p: 2, 
              mb: 2, 
              borderRadius: 1, 
              bgcolor: alpha(theme.palette.success.main, 0.1),
              border: `1px solid ${theme.palette.success.main}`,
              display: 'flex',
              alignItems: 'center'
            }}>
              <FiCheck color={theme.palette.success.main} size={24} style={{ marginRight: 12 }} />
              <Typography>
                La connexion a été validée avec succès.
              </Typography>
            </Box>
            <Typography variant="h6" gutterBottom>
              Résumé de la connexion
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Type de source
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {selectedSource?.name}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Nom de la connexion
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  Connexion à {selectedSource?.name}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Environnement
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  Production
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1, 
        borderColor: 'divider' 
      }}>
        <Typography variant="h5" fontWeight="bold">
          Microsoft Purview
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ThemeToggle />
        </Box>
      </Box>

      {/* Breadcrumbs */}
      <Box sx={{ p: 2, pb: 0 }}>
        <Breadcrumbs separator={<FiChevronRight size={14} />}>
          <Link 
            href="#" 
            underline="hover" 
            color="inherit" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <FiHome size={16} style={{ marginRight: 8 }} />
            Accueil
          </Link>
          <Typography color="text.primary">Sources de données</Typography>
        </Breadcrumbs>
      </Box>

      {/* Main content */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Sources de données
          </Typography>
          <Typography color="text.secondary">
            Connectez-vous à vos sources de données pour commencer à cataloguer et à gérer vos actifs de données.
          </Typography>
        </Box>

        {/* Search and filter */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4, 
          gap: 2,
          flexWrap: 'wrap' 
        }}>
          <TextField
            placeholder="Rechercher une source de données"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <FiSearch style={{ marginRight: 8 }} />,
              endAdornment: searchQuery ? (
                <IconButton size="small" onClick={() => setSearchQuery('')}>
                  <FiX size={16} />
                </IconButton>
              ) : null,
            }}
            sx={{ minWidth: 300, flex: 1, maxWidth: 500 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={selectedCategory || ''}
              label="Catégorie"
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              displayEmpty
            >
              <MenuItem value="">Toutes les catégories</MenuItem>
              {dataSourceCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Popular sources section */}
        {!searchQuery && !selectedCategory && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Sources populaires
            </Typography>
            <Grid container spacing={3}>
              {popularSources.map((source) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={source.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => handleOpenConnectDialog(source)}
                  >
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        height: 48
                      }}>
                        <Box 
                          component="img"
                          src={source.icon}
                          alt={source.name}
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            mr: 2,
                            filter: theme.palette.mode === 'dark' ? 'brightness(0.8) contrast(1.2)' : 'none'
                          }}
                        />
                        <Typography variant="h6">{source.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {source.description}
                      </Typography>
                      <Box sx={{ mt: 'auto' }}>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          startIcon={<FiPlus />}
                          fullWidth
                        >
                          Connecter
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* All sources or filtered sources */}
        <Box>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            {selectedCategory 
              ? `Sources ${dataSourceCategories.find(cat => cat.id === selectedCategory)?.name}` 
              : searchQuery 
                ? 'Résultats de recherche' 
                : 'Toutes les sources de données'}
          </Typography>
          
          {filteredSources.length === 0 ? (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              border: 1,
              borderColor: 'divider'
            }}>
              <FiInfo size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                Aucune source de données trouvée
              </Typography>
              <Typography color="text.secondary">
                Essayez de modifier vos critères de recherche ou de sélectionner une autre catégorie.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredSources.map((source) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={source.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => handleOpenConnectDialog(source)}
                  >
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        height: 48
                      }}>
                        <Box 
                          component="img"
                          src={source.icon}
                          alt={source.name}
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            mr: 2,
                            filter: theme.palette.mode === 'dark' ? 'brightness(0.8) contrast(1.2)' : 'none'
                          }}
                        />
                        <Typography variant="h6">{source.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {source.description}
                      </Typography>
                      <Box sx={{ mt: 'auto' }}>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          startIcon={<FiPlus />}
                          fullWidth
                        >
                          Connecter
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Connection Dialog */}
      <Dialog 
        open={isConnectDialogOpen} 
        onClose={handleCloseConnectDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box 
            component="img"
            src={selectedSource?.icon}
            alt={selectedSource?.name}
            sx={{ 
              width: 32, 
              height: 32,
              filter: theme.palette.mode === 'dark' ? 'brightness(0.8) contrast(1.2)' : 'none'
            }}
          />
          Connecter {selectedSource?.name}
          <IconButton 
            aria-label="close" 
            onClick={handleCloseConnectDialog} 
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <FiX />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} sx={{ py: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box sx={{ mt: 2 }}>
            {renderStepContent()}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseConnectDialog} color="inherit">
            Annuler
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep > 0 && (
            <Button onClick={handleBack}>
              Précédent
            </Button>
          )}
          <Button 
            onClick={activeStep === steps.length - 1 ? handleCloseConnectDialog : handleNext}
            variant="contained" 
            color="primary"
          >
            {activeStep === steps.length - 1 ? 'Terminer' : 'Suivant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataSourceConnectPage;