import React from 'react';
import { AppThemeProvider, ThemeToggle } from '../pages';
import { Box, Container, Typography, Paper, Tabs, Tab, Button } from '@mui/material';
import { DataSourceConnectPage } from '../pages';
import { DataMapDesignerPage } from '../pages';

/**
 * Composant de démonstration des fonctionnalités Purview
 * 
 * Ce composant montre les différentes pages Purview dans un environnement de démonstration
 * avec un en-tête simple contenant le bouton de bascule de thème.
 */
const PurviewDemo: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <AppThemeProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* En-tête */}
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 2, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 0
          }}
        >
          <Typography variant="h5" component="h1">
            Microsoft Purview (Mode Sombre)
          </Typography>
          <ThemeToggle />
        </Paper>

        {/* Navigation par onglets */}
        <Paper square>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
          >
            <Tab label="Sources de données" />
            <Tab label="Carte de données" />
          </Tabs>
        </Paper>

        {/* Contenu principal */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {tabValue === 0 && (
            <DataSourceConnectPage />
          )}
          {tabValue === 1 && (
            <DataMapDesignerPage />
          )}
        </Box>

        {/* Pied de page */}
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 2, 
            borderRadius: 0,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="textSecondary">
            Démonstration des composants Purview en mode sombre - {new Date().getFullYear()}
          </Typography>
        </Paper>
      </Box>
    </AppThemeProvider>
  );
};

export default PurviewDemo;