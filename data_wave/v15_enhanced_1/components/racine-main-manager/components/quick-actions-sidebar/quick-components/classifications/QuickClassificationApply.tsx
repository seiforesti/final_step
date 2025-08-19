/**
 * Quick Classification Apply Component
 * ===================================
 * 
 * Enterprise-grade quick access component for applying data classifications.
 * Provides streamlined classification application with bulk operations.
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tag, 
  Play, 
  Check, 
  X, 
  Search, 
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  Database,
  FileText,
  RefreshCw,
  Eye,
  Settings,
  Zap,
  Star,
  Users,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Import types and services
import type { 
  Classification, 
  DataAsset, 
  ClassificationApplication,
  ApplyClassificationRequest
} from '../../../types/racine-core.types';

import { useClassifications } from '../../../hooks/useClassifications';
import { useCrossGroupIntegration } from '../../../hooks/useCrossGroupIntegration';

interface QuickClassificationApplyProps {
  isVisible?: boolean;
  onClose?: () => void;
  preselectedAssets?: DataAsset[];
  suggestedClassification?: Classification;
  className?: string;
}

export const QuickClassificationApply: React.FC<QuickClassificationApplyProps> = ({
  isVisible = true,
  onClose,
  preselectedAssets = [],
  suggestedClassification,
  className = ''
}) => {
  // Hooks
  const {
    getClassifications,
    applyClassification,
    bulkApplyClassifications,
    isLoading,
    error,
    classifications
  } = useClassifications();

  const { searchDataAssets } = useCrossGroupIntegration();

  // State
  const [selectedClassification, setSelectedClassification] = useState<Classification | null>(suggestedClassification || null);
  const [selectedAssets, setSelectedAssets] = useState<DataAsset[]>(preselectedAssets);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableAssets, setAvailableAssets] = useState<DataAsset[]>([]);
  const [applying, setApplying] = useState(false);
  const [applications, setApplications] = useState<ClassificationApplication[]>([]);

  // Load data
  useEffect(() => {
    if (isVisible) {
      getClassifications();
      loadDataAssets();
    }
  }, [isVisible]);

  const loadDataAssets = useCallback(async () => {
    try {
      const assets = await searchDataAssets({
        query: searchQuery,
        includeClassified: false,
        limit: 50
      });
      setAvailableAssets(assets);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  }, [searchQuery, searchDataAssets]);

  // Handle asset selection
  const handleAssetToggle = useCallback((asset: DataAsset) => {
    setSelectedAssets(prev => {
      const exists = prev.find(a => a.id === asset.id);
      if (exists) {
        return prev.filter(a => a.id !== asset.id);
      } else {
        return [...prev, asset];
      }
    });
  }, []);

  // Handle bulk selection
  const handleSelectAll = useCallback(() => {
    setSelectedAssets(availableAssets);
  }, [availableAssets]);

  const handleDeselectAll = useCallback(() => {
    setSelectedAssets([]);
  }, []);

  // Handle classification application
  const handleApplyClassification = useCallback(async () => {
    if (!selectedClassification || selectedAssets.length === 0) return;

    setApplying(true);
    try {
      const requests: ApplyClassificationRequest[] = selectedAssets.map(asset => ({
        assetId: asset.id,
        classificationId: selectedClassification.id,
        confidence: 1.0,
        appliedBy: 'manual'
      }));

      const results = await bulkApplyClassifications(requests);
      setApplications(results);
      
      const successCount = results.filter(r => r.status === 'success').length;
      toast.success(`Applied classification to ${successCount} assets`);
      
      if (successCount === selectedAssets.length) {
        onClose?.();
      }
    } catch (error) {
      toast.error('Failed to apply classification');
      console.error('Application error:', error);
    } finally {
      setApplying(false);
    }
  }, [selectedClassification, selectedAssets, bulkApplyClassifications, onClose]);

  // Get asset type icon
  const getAssetTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'table': return Database;
      case 'file': return FileText;
      case 'schema': return Target;
      default: return FileText;
    }
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`quick-classification-apply ${className}`}
    >
      <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Tag className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Quick Classification Apply
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Apply classifications to data assets
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {selectedAssets.length} selected
              </Badge>
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  ×
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="p-6 space-y-6">
              
              {/* Classification Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Classification</Label>
                <Select
                  value={selectedClassification?.id || ''}
                  onValueChange={(value) => {
                    const classification = classifications?.find(c => c.id === value);
                    setSelectedClassification(classification || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose classification..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classifications?.map((classification) => (
                      <SelectItem key={classification.id} value={classification.id}>
                        <div className="flex items-center gap-2">
                          <span>{classification.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {classification.level}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedClassification && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-emerald-900">
                        {selectedClassification.name}
                      </span>
                      <Badge className="text-xs bg-emerald-100 text-emerald-700">
                        {selectedClassification.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-emerald-700">
                      {selectedClassification.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-emerald-600">Level:</span>
                        <span className="font-medium">{selectedClassification.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-600">Sensitivity:</span>
                        <span className="font-medium">{selectedClassification.sensitivity}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Asset Search */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Search Data Assets</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search assets..."
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadDataAssets}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Asset Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Select Assets</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableAssets.map((asset) => {
                    const isSelected = selectedAssets.some(a => a.id === asset.id);
                    const AssetIcon = getAssetTypeIcon(asset.type);
                    
                    return (
                      <motion.div
                        key={asset.id}
                        layout
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          isSelected ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAssetToggle(asset)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleAssetToggle(asset)}
                          />
                          <AssetIcon className="h-4 w-4 text-gray-500" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm text-gray-900">
                                {asset.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {asset.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {asset.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>Source: {asset.source}</span>
                              {asset.currentClassifications && asset.currentClassifications.length > 0 && (
                                <span>• {asset.currentClassifications.length} classifications</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {availableAssets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No assets found</p>
                    <p className="text-xs">Try adjusting your search query</p>
                  </div>
                )}
              </div>

              {/* Selected Assets Summary */}
              {selectedAssets.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <Label className="text-sm font-medium">Selected Assets ({selectedAssets.length})</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedAssets.map((asset) => {
                      const AssetIcon = getAssetTypeIcon(asset.type);
                      return (
                        <div key={asset.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                          <AssetIcon className="h-3 w-3 text-gray-500" />
                          <span className="flex-1 truncate">{asset.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleAssetToggle(asset)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Application Results */}
              {applications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <Label className="text-sm font-medium">Application Results</Label>
                  <div className="space-y-2">
                    {applications.map((result, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="flex-1">
                          {result.assetName || result.assetId}
                        </span>
                        <Badge 
                          variant={result.status === 'success' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {result.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t">
                <Button
                  onClick={handleApplyClassification}
                  disabled={!selectedClassification || selectedAssets.length === 0 || applying}
                  className="w-full"
                  size="sm"
                >
                  {applying ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Applying Classification...
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Apply to {selectedAssets.length} Asset{selectedAssets.length !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>

                {selectedClassification && selectedAssets.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Preview Classification Impact
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Assets:</span>
                        <span className="font-medium">{selectedAssets.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-medium">{selectedClassification.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{selectedClassification.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto-apply:</span>
                        <span className="font-medium">
                          {selectedClassification.autoApply ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickClassificationApply;