import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  Description as DescriptionIcon,
  Storage as StorageIcon,
  TableChart as TableChartIcon,
  ViewColumn as ViewColumnIcon,
  FilterList as FilterListIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useScanRuleSets } from '../../hooks/useScanRules';
import { useDataSources } from '../../hooks/useDataSources';

interface ScanRuleVisualizerProps {
  ruleSetId: number;
  dataSourceId?: number;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'database' | 'schema' | 'table' | 'column' | 'folder' | 'file';
  included: boolean;
  excluded: boolean;
  children?: TreeNode[];
  parent?: string;
  level: number;
  matchedBy?: string;
  path?: string;
}

const ScanRuleVisualizer: React.FC<ScanRuleVisualizerProps> = ({ ruleSetId, dataSourceId }) => {
  const { getScanRuleSetById, validateScanRulePatterns } = useScanRuleSets();
  const { getDataSourceById } = useDataSources();
  
  const [ruleSet, setRuleSet] = useState<any | null>(null);
  const [dataSource, setDataSource] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showOnlyMatched, setShowOnlyMatched] = useState(false);
  const [validationResults, setValidationResults] = useState<any | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // Load rule set and data source data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load rule set
        const ruleSetData = await getScanRuleSetById(ruleSetId);
        setRuleSet(ruleSetData);
        
        // Load data source if provided
        if (dataSourceId || ruleSetData.data_source_id) {
          const sourceId = dataSourceId || ruleSetData.data_source_id;
          const sourceData = await getDataSourceById(sourceId);
          setDataSource(sourceData);
        }
        
        // Validate patterns to get tree data
        await validatePatterns();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load rule set data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [ruleSetId, dataSourceId]);
  
  // Validate patterns against data source
  const validatePatterns = async () => {
    try {
      setIsValidating(true);
      setError(null);
      
      if (!ruleSet) return;
      
      // If rule set is global and no data source is provided, we can't validate
      if (ruleSet.is_global && !dataSourceId) {
        setError('Please select a data source to validate global rule set patterns');
        return;
      }
      
      const sourceId = dataSourceId || ruleSet.data_source_id;
      
      // Validate patterns
      const results = await validateScanRulePatterns(ruleSet.id, sourceId);
      setValidationResults(results);
      
      // Build tree from validation results
      buildTreeFromValidation(results);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to validate patterns');
    } finally {
      setIsValidating(false);
    }
  };
  
  // Build tree structure from validation results
  const buildTreeFromValidation = (results: any) => {
    if (!results || !results.entities) {
      setTreeData([]);
      return;
    }
    
    const { entities, include_patterns, exclude_patterns } = results;
    
    // Create a map to track all nodes
    const nodeMap = new Map<string, TreeNode>();
    
    // Process all entities
    entities.forEach((entity: any) => {
      const { path, type, included, excluded, matched_by } = entity;
      
      // Split path into components
      const pathParts = path.split('/');
      let currentPath = '';
      
      // Create nodes for each level in the path
      pathParts.forEach((part: string, index: number) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        // Skip if node already exists
        if (nodeMap.has(currentPath)) return;
        
        // Determine node type based on level and entity type
        let nodeType: TreeNode['type'] = 'folder';
        if (index === pathParts.length - 1) {
          nodeType = type as TreeNode['type'];
        } else if (index === 0) {
          nodeType = 'database';
        } else if (index === 1) {
          nodeType = 'schema';
        }
        
        // Create parent path
        const parentPath = index > 0 ? pathParts.slice(0, index).join('/') : '';
        
        // Create node
        const node: TreeNode = {
          id: currentPath,
          name: part,
          type: nodeType,
          included: index === pathParts.length - 1 ? included : false,
          excluded: index === pathParts.length - 1 ? excluded : false,
          level: index,
          parent: parentPath || undefined,
          path: currentPath,
          children: [],
        };
        
        // Add matched_by information for leaf nodes
        if (index === pathParts.length - 1 && matched_by) {
          node.matchedBy = matched_by;
        }
        
        // Add node to map
        nodeMap.set(currentPath, node);
      });
    });
    
    // Build parent-child relationships
    nodeMap.forEach((node) => {
      if (node.parent) {
        const parent = nodeMap.get(node.parent);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      }
    });
    
    // Get root nodes (those without parents)
    const rootNodes = Array.from(nodeMap.values()).filter(node => !node.parent);
    
    // Sort children at each level
    const sortNodes = (nodes: TreeNode[]) => {
      // Sort by type first, then by name
      nodes.sort((a, b) => {
        // Type priority: database > schema > table > column > folder > file
        const typePriority: Record<TreeNode['type'], number> = {
          database: 1,
          schema: 2,
          table: 3,
          column: 4,
          folder: 5,
          file: 6,
        };
        
        if (typePriority[a.type] !== typePriority[b.type]) {
          return typePriority[a.type] - typePriority[b.type];
        }
        
        return a.name.localeCompare(b.name);
      });
      
      // Sort children recursively
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };
    
    sortNodes(rootNodes);
    
    // Expand first level by default
    const expanded = new Set<string>();
    rootNodes.forEach(node => expanded.add(node.id));
    setExpandedNodes(expanded);
    
    setTreeData(rootNodes);
  };
  
  // Toggle node expansion
  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };
  
  // Filter tree based on search term and filter type
  const filterTree = (nodes: TreeNode[]): TreeNode[] => {
    if (!searchTerm && filterType === 'all' && !showOnlyMatched) {
      return nodes;
    }
    
    return nodes.filter(node => {
      // Check if node matches search term
      const matchesSearch = !searchTerm || node.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Check if node matches filter type
      const matchesType = filterType === 'all' || node.type === filterType;
      
      // Check if node is matched by a pattern
      const matchesPattern = !showOnlyMatched || node.included || node.excluded;
      
      // If node matches criteria, include it
      if (matchesSearch && matchesType && matchesPattern) {
        return true;
      }
      
      // If node has children, check if any children match
      if (node.children && node.children.length > 0) {
        const filteredChildren = filterTree(node.children);
        if (filteredChildren.length > 0) {
          // Update node's children with filtered children
          node.children = filteredChildren;
          return true;
        }
      }
      
      return false;
    });
  };
  
  // Render tree node
  const renderTreeNode = (node: TreeNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    
    // Determine icon based on node type and expansion state
    let icon;
    switch (node.type) {
      case 'database':
        icon = <StorageIcon color="primary" />;
        break;
      case 'schema':
        icon = <FolderIcon color="secondary" />;
        break;
      case 'table':
        icon = <TableChartIcon color="info" />;
        break;
      case 'column':
        icon = <ViewColumnIcon color="action" />;
        break;
      case 'folder':
        icon = isExpanded ? <FolderOpenIcon color="primary" /> : <FolderIcon color="primary" />;
        break;
      case 'file':
        icon = <DescriptionIcon color="action" />;
        break;
      default:
        icon = <DescriptionIcon />;
    }
    
    return (
      <React.Fragment key={node.id}>
        <ListItem
          button
          onClick={() => hasChildren && toggleNodeExpansion(node.id)}
          sx={{
            pl: node.level * 2,
            bgcolor: node.included ? 'rgba(76, 175, 80, 0.1)' : node.excluded ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
            '&:hover': {
              bgcolor: node.included ? 'rgba(76, 175, 80, 0.2)' : node.excluded ? 'rgba(244, 67, 54, 0.2)' : 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            {icon}
          </ListItemIcon>
          
          <ListItemText
            primary={
              <Box display="flex" alignItems="center">
                <Typography variant="body2" noWrap>
                  {node.name}
                </Typography>
                {node.matchedBy && (
                  <Tooltip title={`Matched by: ${node.matchedBy}`}>
                    <Chip
                      size="small"
                      label={node.included ? 'Included' : 'Excluded'}
                      color={node.included ? 'success' : 'error'}
                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                    />
                  </Tooltip>
                )}
              </Box>
            }
          />
          
          {hasChildren && (
            <IconButton edge="end" size="small" onClick={(e) => {
              e.stopPropagation();
              toggleNodeExpansion(node.id);
            }}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </ListItem>
        
        {isExpanded && hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {node.children!.map(childNode => renderTreeNode(childNode))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };
  
  // Filter tree data
  const filteredTreeData = filterTree([...treeData]);
  
  // Calculate statistics
  const calculateStats = () => {
    if (!validationResults) return null;
    
    const { entities } = validationResults;
    
    const stats = {
      total: entities.length,
      included: entities.filter((e: any) => e.included).length,
      excluded: entities.filter((e: any) => e.excluded).length,
      tables: entities.filter((e: any) => e.type === 'table').length,
      columns: entities.filter((e: any) => e.type === 'column').length,
      schemas: entities.filter((e: any) => e.type === 'schema').length,
    };
    
    return stats;
  };
  
  const stats = calculateStats();
  
  return (
    <Box>
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Rule Set Pattern Visualization
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader
                    title="Rule Set Information"
                    titleTypographyProps={{ variant: 'subtitle1' }}
                  />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Name
                        </Typography>
                        <Typography variant="body1">
                          {ruleSet?.name}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Type
                        </Typography>
                        <Typography variant="body1">
                          {ruleSet?.is_global ? 'Global' : 'Data Source Specific'}
                        </Typography>
                      </Grid>
                      
                      {dataSource && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">
                            Data Source
                          </Typography>
                          <Typography variant="body1">
                            {dataSource.name} ({dataSource.source_type})
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader
                    title="Pattern Statistics"
                    titleTypographyProps={{ variant: 'subtitle1' }}
                    action={
                      <Tooltip title="Refresh">
                        <IconButton onClick={validatePatterns} disabled={isValidating}>
                          {isValidating ? <CircularProgress size={20} /> : <RefreshIcon />}
                        </IconButton>
                      </Tooltip>
                    }
                  />
                  <Divider />
                  <CardContent>
                    {stats ? (
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Total Entities
                          </Typography>
                          <Typography variant="h6">
                            {stats.total}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Included
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {stats.included}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Excluded
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {stats.excluded}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Schemas
                          </Typography>
                          <Typography variant="body1">
                            {stats.schemas}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Tables
                          </Typography>
                          <Typography variant="body1">
                            {stats.tables}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Columns
                          </Typography>
                          <Typography variant="body1">
                            {stats.columns}
                          </Typography>
                        </Grid>
                      </Grid>
                    ) : (
                      <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
                        <Button
                          variant="outlined"
                          startIcon={<PlayArrowIcon />}
                          onClick={validatePatterns}
                          disabled={isValidating}
                        >
                          {isValidating ? 'Validating...' : 'Validate Patterns'}
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          
          <Box mb={3}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Pattern Rules
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Include Patterns
                  </Typography>
                  
                  {ruleSet?.include_patterns && ruleSet.include_patterns.length > 0 ? (
                    <List dense>
                      {ruleSet.include_patterns.map((pattern: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckIcon color="success" />
                          </ListItemIcon>
                          <ListItemText primary={pattern} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No include patterns defined
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Exclude Patterns
                  </Typography>
                  
                  {ruleSet?.exclude_patterns && ruleSet.exclude_patterns.length > 0 ? (
                    <List dense>
                      {ruleSet.exclude_patterns.map((pattern: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CloseIcon color="error" />
                          </ListItemIcon>
                          <ListItemText primary={pattern} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No exclude patterns defined
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Box>
          
          <Box>
            <Paper variant="outlined">
              <Box p={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Entity Tree View
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      variant="outlined"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="filter-type-label">Filter by Type</InputLabel>
                      <Select
                        labelId="filter-type-label"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        label="Filter by Type"
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="database">Databases</MenuItem>
                        <MenuItem value="schema">Schemas</MenuItem>
                        <MenuItem value="table">Tables</MenuItem>
                        <MenuItem value="column">Columns</MenuItem>
                        <MenuItem value="folder">Folders</MenuItem>
                        <MenuItem value="file">Files</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showOnlyMatched}
                          onChange={(e) => setShowOnlyMatched(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Show only matched entities"
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Divider />
              
              <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                {filteredTreeData.length > 0 ? (
                  <List>
                    {filteredTreeData.map(node => renderTreeNode(node))}
                  </List>
                ) : (
                  <Box p={3} display="flex" justifyContent="center" alignItems="center">
                    <Typography variant="body2" color="textSecondary">
                      {validationResults ? 'No entities match the current filters' : 'Validate patterns to view entity tree'}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {validationResults && filteredTreeData.length === 0 && (
                <Box p={2} display="flex" justifyContent="center">
                  <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                      setShowOnlyMatched(false);
                    }}
                  >
                    Clear Filters
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ScanRuleVisualizer;