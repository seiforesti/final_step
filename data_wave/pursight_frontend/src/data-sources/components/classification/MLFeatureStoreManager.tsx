/**
 * Advanced ML Feature Store Manager Component
 * Comprehensive management interface for ML feature store
 */

import React, { useCallback, useState } from 'react'

interface MLFeatureStoreManagerProps {
  featureStoreState: {
    features: any[]
    selectedFeatures: string[]
    featureImportance: Record<string, number>
    featureCorrelations: Record<string, Record<string, number>>
  }
  onLoadFeatureStore: () => Promise<void>
  isLoading: boolean
  error: string | null
}

export default function MLFeatureStoreManager({
  featureStoreState,
  onLoadFeatureStore,
  isLoading,
  error
}: MLFeatureStoreManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCorrelationModal, setShowCorrelationModal] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('importance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterByType, setFilterByType] = useState<string>('all')

  const filteredFeatures = featureStoreState.features.filter(feature => {
    const matchesSearch = feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feature.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterByType === 'all' || feature.type === filterByType
    return matchesSearch && matchesType
  }).sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'numerical': return '🔢'
      case 'categorical': return '📊'
      case 'text': return '📝'
      case 'datetime': return '📅'
      case 'boolean': return '✅'
      case 'array': return '📋'
      default: return '❓'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'numerical': return 'text-blue-300'
      case 'categorical': return 'text-green-300'
      case 'text': return 'text-yellow-300'
      case 'datetime': return 'text-purple-300'
      case 'boolean': return 'text-pink-300'
      case 'array': return 'text-orange-300'
      default: return 'text-zinc-300'
    }
  }

  const getImportanceColor = (importance: number) => {
    if (importance >= 0.8) return 'text-green-300'
    if (importance >= 0.6) return 'text-yellow-300'
    if (importance >= 0.4) return 'text-orange-300'
    return 'text-red-300'
  }

  const getImportanceBgColor = (importance: number) => {
    if (importance >= 0.8) return 'bg-green-500/20'
    if (importance >= 0.6) return 'bg-yellow-500/20'
    if (importance >= 0.4) return 'bg-orange-500/20'
    return 'bg-red-500/20'
  }

  const formatImportance = (importance: number) => {
    return `${Math.round(importance * 100)}%`
  }

  const formatCorrelation = (correlation: number) => {
    return correlation.toFixed(3)
  }

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (abs >= 0.8) return 'text-red-300'
    if (abs >= 0.6) return 'text-orange-300'
    if (abs >= 0.4) return 'text-yellow-300'
    return 'text-zinc-300'
  }

  const handleViewCorrelations = useCallback((featureName: string) => {
    setSelectedFeature(featureName)
    setShowCorrelationModal(true)
  }, [])

  const handleCreateFeature = useCallback(async (featureData: any) => {
    try {
      // Simulate feature creation
      console.log('Creating feature:', featureData)
      setShowCreateModal(false)
    } catch (err) {
      console.error('Failed to create feature:', err)
    }
  }, [])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-200">Feature Store</h2>
          <p className="text-sm text-zinc-400">Manage machine learning features and their relationships</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onLoadFeatureStore}
            className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300"
          >
            Create Feature
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features..."
            className="flex-1 h-8 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-8 px-3 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
          >
            <option value="name">Name</option>
            <option value="type">Type</option>
            <option value="importance">Importance</option>
            <option value="correlation">Correlation</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterByType}
            onChange={(e) => setFilterByType(e.target.value)}
            className="h-8 px-3 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
          >
            <option value="all">All Types</option>
            <option value="numerical">Numerical</option>
            <option value="categorical">Categorical</option>
            <option value="text">Text</option>
            <option value="datetime">DateTime</option>
            <option value="boolean">Boolean</option>
            <option value="array">Array</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded border border-red-500/50 bg-red-500/10 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeatures.map((feature) => (
          <div
            key={feature.id}
            className="p-4 rounded border border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getTypeIcon(feature.type)}</span>
                <div>
                  <h3 className="font-medium text-zinc-200">{feature.name}</h3>
                  <p className={`text-xs ${getTypeColor(feature.type)}`}>{feature.type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${getImportanceBgColor(feature.importance)} ${getImportanceColor(feature.importance)}`}>
                {formatImportance(feature.importance)}
              </span>
            </div>

            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Importance:</span>
                <span className={`${getImportanceColor(feature.importance)}`}>
                  {formatImportance(feature.importance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Correlation:</span>
                <span className={getCorrelationColor(feature.correlation)}>
                  {formatCorrelation(feature.correlation)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ID:</span>
                <span className="text-zinc-200 font-mono">{feature.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 mt-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => handleViewCorrelations(feature.name)}
                className="h-6 px-2 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
              >
                Correlations
              </button>
              <button
                onClick={() => {
                  // Edit feature action
                }}
                className="h-6 px-2 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFeatures.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔧</div>
          <h3 className="text-lg font-medium text-zinc-200 mb-2">No Features Found</h3>
          <p className="text-zinc-400 mb-4">Create your first feature to start building your feature store.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-8 px-4 text-sm rounded border border-blue-600 bg-blue-600/20 text-blue-300"
          >
            Create Feature
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading features...</p>
        </div>
      )}

      {/* Create Feature Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Create Feature
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
                  <input
                    id="feature-name"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter feature name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Type</label>
                  <select
                    id="feature-type"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                  >
                    <option value="numerical">Numerical</option>
                    <option value="categorical">Categorical</option>
                    <option value="text">Text</option>
                    <option value="datetime">DateTime</option>
                    <option value="boolean">Boolean</option>
                    <option value="array">Array</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                <textarea
                  id="feature-description"
                  className="w-full h-20 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500"
                  placeholder="Enter feature description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Importance (0-1)</label>
                  <input
                    id="feature-importance"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Correlation (-1 to 1)</label>
                  <input
                    id="feature-correlation"
                    type="number"
                    min="-1"
                    max="1"
                    step="0.1"
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="0.0"
                  />
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const name = (document.getElementById('feature-name') as HTMLInputElement)?.value
                  const type = (document.getElementById('feature-type') as HTMLSelectElement)?.value
                  const description = (document.getElementById('feature-description') as HTMLTextAreaElement)?.value
                  const importance = parseFloat((document.getElementById('feature-importance') as HTMLInputElement)?.value || '0')
                  const correlation = parseFloat((document.getElementById('feature-correlation') as HTMLInputElement)?.value || '0')
                  
                  if (name && type) {
                    handleCreateFeature({
                      name,
                      type,
                      description,
                      importance,
                      correlation
                    })
                  }
                }}
                className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Correlations Modal */}
      {showCorrelationModal && selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-4xl rounded border border-zinc-700 bg-zinc-900">
            <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">
              Feature Correlations: {selectedFeature}
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-2 text-zinc-400">Feature</th>
                      <th className="text-right py-2 text-zinc-400">Correlation</th>
                      <th className="text-right py-2 text-zinc-400">Strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(featureStoreState.featureCorrelations[selectedFeature] || {})
                      .filter(([featureName]) => featureName !== selectedFeature)
                      .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                      .map(([featureName, correlation]) => (
                        <tr key={featureName} className="border-b border-zinc-800/50">
                          <td className="py-2 text-zinc-200">{featureName}</td>
                          <td className={`py-2 text-right ${getCorrelationColor(correlation)}`}>
                            {formatCorrelation(correlation)}
                          </td>
                          <td className="py-2 text-right text-zinc-400">
                            {Math.abs(correlation) >= 0.8 ? 'Strong' :
                             Math.abs(correlation) >= 0.6 ? 'Moderate' :
                             Math.abs(correlation) >= 0.4 ? 'Weak' : 'Very Weak'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end">
              <button
                onClick={() => setShowCorrelationModal(false)}
                className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
