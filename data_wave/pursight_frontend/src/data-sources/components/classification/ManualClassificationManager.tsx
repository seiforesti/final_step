import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useManualClassification } from '../../hooks/useManualClassification'
import { ClassificationScope, SensitivityLevel, ClassificationRule, ClassificationPolicy, ClassificationDictionary, ClassificationResult } from '../../types/classification'
import FrameworkManager from './FrameworkManager'
import RulesManager from './RulesManager'
import DictionariesManager from './DictionariesManager'
import ResultsViewer from './ResultsViewer'

interface ManualClassificationManagerProps {
  dataSourceId?: number
  className?: string
}

type View = 'overview' | 'frameworks' | 'rules' | 'dictionaries' | 'results' | 'policies' | 'metrics' | 'bulk' | 'audit' | 'rule-tester' | 'policy-editor' | 'dictionary-editor' | 'batch-wizard'

interface RuleTestResult {
  matched: boolean
  confidence: number
  patterns: string[]
  values: string[]
  context: any
  sample_data: any
  match_percentage: number
}

interface PolicyEditorState {
  name: string
  description: string
  priority: number
  is_mandatory: boolean
  auto_apply: boolean
  requires_approval: boolean
  scope: ClassificationScope
  default_sensitivity: SensitivityLevel
  conditions: any
  inheritance_rules: any
  notification_rules: any
}

interface DictionaryEditorState {
  name: string
  description: string
  language: string
  entries: string[]
  category: string
  subcategory: string
  tags: string[]
  source_type: string
}

interface BatchWizardStep {
  id: string
  title: string
  description: string
  completed: boolean
  data?: any
}

interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  target: string
  details: string
  status: 'success' | 'error' | 'warning'
}

export function ManualClassificationManager({ dataSourceId, className }: ManualClassificationManagerProps) {
  const [frameworkId, setFrameworkId] = useState<number | undefined>(undefined)
  const [scope, setScope] = useState<ClassificationScope | undefined>(undefined)
  const [sensitivity, setSensitivity] = useState<SensitivityLevel | undefined>(undefined)
  const [activeView, setActiveView] = useState<View>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [showCreateRule, setShowCreateRule] = useState(false)
  const [showCreateFramework, setShowCreateFramework] = useState(false)
  const [showBulkApply, setShowBulkApply] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<{ type: string; id: string; name?: string } | null>(null)
  const [selectedRule, setSelectedRule] = useState<ClassificationRule | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<ClassificationPolicy | null>(null)
  const [selectedDictionary, setSelectedDictionary] = useState<ClassificationDictionary | null>(null)
  const [selectedResult, setSelectedResult] = useState<ClassificationResult | null>(null)
  const [ruleTestData, setRuleTestData] = useState('')
  const [ruleTestResult, setRuleTestResult] = useState<RuleTestResult | null>(null)
  const [policyEditorState, setPolicyEditorState] = useState<PolicyEditorState>({
    name: '',
    description: '',
    priority: 100,
    is_mandatory: false,
    auto_apply: true,
    requires_approval: false,
    scope: ClassificationScope.GLOBAL,
    default_sensitivity: SensitivityLevel.INTERNAL,
    conditions: {},
    inheritance_rules: {},
    notification_rules: {}
  })
  const [dictionaryEditorState, setDictionaryEditorState] = useState<DictionaryEditorState>({
    name: '',
    description: '',
    language: 'en',
    entries: [],
    category: '',
    subcategory: '',
    tags: [],
    source_type: 'manual'
  })
  const [batchWizardSteps, setBatchWizardSteps] = useState<BatchWizardStep[]>([
    { id: 'select', title: 'Select Data Sources', description: 'Choose data sources to classify', completed: false },
    { id: 'configure', title: 'Configure Rules', description: 'Select or create classification rules', completed: false },
    { id: 'preview', title: 'Preview Changes', description: 'Review what will be classified', completed: false },
    { id: 'execute', title: 'Execute Classification', description: 'Run the classification process', completed: false }
  ])
  const [currentBatchStep, setCurrentBatchStep] = useState(0)
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([])
  const [metricsTimeRange, setMetricsTimeRange] = useState('24h')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filterByStatus, setFilterByStatus] = useState<string>('all')
  const [filterByConfidence, setFilterByConfidence] = useState<[number, number]>([0, 1])
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [pageSize, setPageSize] = useState(50)
  const [currentPage, setCurrentPage] = useState(1)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const keyboardHandlerRef = useRef<(e: KeyboardEvent) => void>()

  const {
    frameworks,
    framework,
    policies,
    rules,
    dictionaries,
    results,
    metrics,
    createFramework,
    updateFramework,
    deleteFramework,
    createRule,
    updateRule,
    deleteRule,
    createAssignment,
    applyBulk,
  } = useManualClassification({ frameworkId, dataSourceId, scope, sensitivity })

  const views: { id: View; label: string; icon?: string; shortcut?: string }[] = useMemo(() => ([
    { id: 'overview', label: 'Overview', icon: '📊', shortcut: '⌘1' },
    { id: 'frameworks', label: 'Frameworks', icon: '🏗️', shortcut: '⌘2' },
    { id: 'rules', label: 'Rules', icon: '⚙️', shortcut: '⌘3' },
    { id: 'dictionaries', label: 'Dictionaries', icon: '📚', shortcut: '⌘4' },
    { id: 'results', label: 'Results', icon: '📋', shortcut: '⌘5' },
    { id: 'policies', label: 'Policies', icon: '📜', shortcut: '⌘6' },
    { id: 'metrics', label: 'Metrics', icon: '📈', shortcut: '⌘7' },
    { id: 'bulk', label: 'Bulk Ops', icon: '🔄', shortcut: '⌘B' },
    { id: 'audit', label: 'Audit', icon: '🔍', shortcut: '⌘A' },
    { id: 'rule-tester', label: 'Rule Tester', icon: '🧪', shortcut: '⌘T' },
    { id: 'policy-editor', label: 'Policy Editor', icon: '✏️', shortcut: '⌘E' },
    { id: 'dictionary-editor', label: 'Dictionary Editor', icon: '📝', shortcut: '⌘D' },
    { id: 'batch-wizard', label: 'Batch Wizard', icon: '🧙', shortcut: '⌘W' },
  ]), [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case '1': setActiveView('overview'); e.preventDefault(); break
        case '2': setActiveView('frameworks'); e.preventDefault(); break
        case '3': setActiveView('rules'); e.preventDefault(); break
        case '4': setActiveView('dictionaries'); e.preventDefault(); break
        case '5': setActiveView('results'); e.preventDefault(); break
        case '6': setActiveView('policies'); e.preventDefault(); break
        case '7': setActiveView('metrics'); e.preventDefault(); break
        case 'b': setActiveView('bulk'); e.preventDefault(); break
        case 'a': setActiveView('audit'); e.preventDefault(); break
        case 't': setActiveView('rule-tester'); e.preventDefault(); break
        case 'e': setActiveView('policy-editor'); e.preventDefault(); break
        case 'd': setActiveView('dictionary-editor'); e.preventDefault(); break
        case 'w': setActiveView('batch-wizard'); e.preventDefault(); break
        case 'f': setShowCreateFramework(true); e.preventDefault(); break
        case 'r': setShowCreateRule(true); e.preventDefault(); break
        case '?': setShowKeyboardShortcuts(true); e.preventDefault(); break
        case 'k': setSearch(''); e.preventDefault(); break
        case 's': setShowAdvancedFilters(v => !v); e.preventDefault(); break
      }
    } else if (e.key === 'Escape') {
      setShowCreateFramework(false)
      setShowCreateRule(false)
      setShowBulkApply(false)
      setShowAssignModal(false)
      setShowKeyboardShortcuts(false)
      setShowAdvancedFilters(false)
    }
  }, [])

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => handleKeyDown(ev)
    keyboardHandlerRef.current = handler
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [handleKeyDown])

  const createFrameworkAction = useCallback(async (payload: Partial<any>) => {
    const data = await createFramework.mutateAsync({
      name: payload.name || 'New Framework',
      version: payload.version || '1.0.0',
      is_default: false,
      is_active: true,
      applies_to_columns: true,
      applies_to_tables: true,
      applies_to_schemas: true,
      applies_to_data_sources: true,
    })
    setFrameworkId((data as any).id)
    setShowCreateFramework(false)
  }, [createFramework])

  const createRuleAction = useCallback(async (payload: Partial<any>) => {
    const rule = await createRule.mutateAsync({
      framework_id: frameworkId,
      name: payload.name || 'New Rule',
      rule_type: payload.rule_type || 'regex_pattern',
      pattern: payload.pattern || 'email|ssn|phone',
      sensitivity_level: payload.sensitivity_level || 'confidential',
      priority: 100,
      is_active: true,
      scope: payload.scope || 'global',
      confidence_threshold: 0.8,
    } as any)
    setShowCreateRule(false)
  }, [createRule, frameworkId])

  const assignAction = useCallback(async () => {
    if (!selectedEntity || !framework?.data) return
    await createAssignment({
      asset_type: selectedEntity.type,
      asset_id: selectedEntity.id,
      asset_name: selectedEntity.name || selectedEntity.id,
      classification_id: (framework.data as any).id,
      confidence_score: 1,
    } as any)
    setShowAssignModal(false)
  }, [selectedEntity, framework?.data, createAssignment])

  const bulkApplyAction = useCallback(async () => {
    await applyBulk({ force_reclassify: false, batch_size: 500, parallel_jobs: 2 })
    setShowBulkApply(false)
  }, [applyBulk])

  const testRule = useCallback(async (rule: ClassificationRule, testData: string) => {
    setIsLoading(true)
    try {
      // Simulate rule testing logic
      const mockResult: RuleTestResult = {
        matched: testData.includes(rule.pattern || ''),
        confidence: Math.random() * 0.4 + 0.6,
        patterns: [rule.pattern || ''],
        values: testData.split('\n').filter(line => line.includes(rule.pattern || '')),
        context: { rule_id: rule.id, test_data_length: testData.length },
        sample_data: testData.split('\n').slice(0, 3),
        match_percentage: Math.random() * 100
      }
      setRuleTestResult(mockResult)
    } catch (err) {
      setError('Failed to test rule')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const savePolicy = useCallback(async () => {
    setIsLoading(true)
    try {
      // Simulate policy save
      console.log('Saving policy:', policyEditorState)
      setPolicyEditorState({
        name: '',
        description: '',
        priority: 100,
        is_mandatory: false,
        auto_apply: true,
        requires_approval: false,
        scope: ClassificationScope.GLOBAL,
        default_sensitivity: SensitivityLevel.INTERNAL,
        conditions: {},
        inheritance_rules: {},
        notification_rules: {}
      })
    } catch (err) {
      setError('Failed to save policy')
    } finally {
      setIsLoading(false)
    }
  }, [policyEditorState])

  const saveDictionary = useCallback(async () => {
    setIsLoading(true)
    try {
      // Simulate dictionary save
      console.log('Saving dictionary:', dictionaryEditorState)
      setDictionaryEditorState({
        name: '',
        description: '',
        language: 'en',
        entries: [],
        category: '',
        subcategory: '',
        tags: [],
        source_type: 'manual'
      })
    } catch (err) {
      setError('Failed to save dictionary')
    } finally {
      setIsLoading(false)
    }
  }, [dictionaryEditorState])

  const nextBatchStep = useCallback(() => {
    if (currentBatchStep < batchWizardSteps.length - 1) {
      setCurrentBatchStep(currentBatchStep + 1)
    }
  }, [currentBatchStep, batchWizardSteps.length])

  const prevBatchStep = useCallback(() => {
    if (currentBatchStep > 0) {
      setCurrentBatchStep(currentBatchStep - 1)
    }
  }, [currentBatchStep])

  const loadAuditEntries = useCallback(async () => {
    setIsLoading(true)
    try {
      // Simulate audit entries loading
      const mockEntries: AuditEntry[] = Array.from({ length: 20 }, (_, i) => ({
        id: `audit-${i}`,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        user: `user${i % 5}`,
        action: ['create', 'update', 'delete', 'apply', 'test'][i % 5],
        target: `target-${i}`,
        details: `Action performed on target-${i}`,
        status: ['success', 'error', 'warning'][i % 3] as 'success' | 'error' | 'warning'
      }))
      setAuditEntries(mockEntries)
    } catch (err) {
      setError('Failed to load audit entries')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMetrics = useCallback(async () => {
    setIsLoading(true)
    try {
      // Simulate metrics loading
      console.log('Loading metrics for time range:', metricsTimeRange)
    } catch (err) {
      setError('Failed to load metrics')
    } finally {
      setIsLoading(false)
    }
  }, [metricsTimeRange])

  useEffect(() => {
    loadAuditEntries()
    loadMetrics()
  }, [loadAuditEntries, loadMetrics])

  const renderToolbar = useCallback(() => {
    return (
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/50 bg-zinc-900/50">
        <div className="flex items-center space-x-2">
          <button
            className="h-8 px-2 text-xs text-zinc-300 bg-zinc-800/50 border border-zinc-700 rounded"
            onClick={() => setSidebarCollapsed(v => !v)}
          >
            {sidebarCollapsed ? 'Expand' : 'Collapse'}
          </button>
          <div className="hidden md:flex items-center space-x-1">
            {views.map(v => (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={`h-8 px-3 text-xs rounded border ${activeView === v.id ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-zinc-700 bg-zinc-800/50 text-zinc-300'}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search (⌘/Ctrl+F)"
            className="h-8 px-3 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500"
          />
          <button className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300" onClick={() => setShowCreateFramework(true)}>New Framework</button>
          <button className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300" onClick={() => setShowCreateRule(true)}>New Rule</button>
          <button className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300" onClick={() => setShowBulkApply(true)}>Bulk Apply</button>
        </div>
      </div>
    )
  }, [views, activeView, search, sidebarCollapsed])

  const renderSidebar = useCallback(() => {
    return (
      <aside className={`border-r border-zinc-800/50 bg-zinc-900/30 ${sidebarCollapsed ? 'w-14' : 'w-72'} transition-all duration-200`}> 
        <div className="p-3 space-y-3">
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 mb-2">Scope</div>
            <div className="grid grid-cols-2 gap-1">
              {(['global','data_source','schema','table','column'] as ClassificationScope[]).map(s => (
                <button key={s} onClick={() => setScope(s)} className={`h-7 px-2 text-[11px] rounded border ${scope === s ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-zinc-700 bg-zinc-900 text-zinc-300'}`}>{s}</button>
              ))}
              <button onClick={() => setScope(undefined)} className={`col-span-2 h-7 px-2 text-[11px] rounded border ${!scope ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-zinc-700 bg-zinc-900 text-zinc-300'}`}>Any</button>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 mb-2">Sensitivity</div>
            <div className="grid grid-cols-2 gap-1">
              {(['public','internal','confidential','restricted'] as SensitivityLevel[]).map(l => (
                <button key={l} onClick={() => setSensitivity(l)} className={`h-7 px-2 text-[11px] rounded border ${sensitivity === l ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-zinc-700 bg-zinc-900 text-zinc-300'}`}>{l}</button>
              ))}
              <button onClick={() => setSensitivity(undefined)} className={`col-span-2 h-7 px-2 text-[11px] rounded border ${!sensitivity ? 'border-blue-500 bg-blue-500/10 text-blue-300' : 'border-zinc-700 bg-zinc-900 text-zinc-300'}`}>Any</button>
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 mb-2">Frameworks</div>
            <FrameworkManager frameworkId={frameworkId} onSelect={setFrameworkId} />
          </div>
        </div>
      </aside>
    )
  }, [sidebarCollapsed, scope, sensitivity, frameworkId])

  const renderContent = useCallback(() => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="rounded border border-zinc-800 bg-zinc-950">
              <div className="px-4 py-3 border-b border-zinc-800 text-sm font-semibold">Frameworks</div>
              <div className="p-4">
                <FrameworkManager frameworkId={frameworkId} onSelect={setFrameworkId} />
              </div>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-950">
              <div className="px-4 py-3 border-b border-zinc-800 text-sm font-semibold">Rules</div>
              <div className="p-4">
                <RulesManager frameworkId={frameworkId} scope={scope} />
              </div>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-950">
              <div className="px-4 py-3 border-b border-zinc-800 text-sm font-semibold">Dictionaries</div>
              <div className="p-4">
                <DictionariesManager />
              </div>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-950">
              <div className="px-4 py-3 border-b border-zinc-800 text-sm font-semibold">Recent Results</div>
              <div className="p-4">
                <ResultsViewer dataSourceId={dataSourceId} />
              </div>
            </div>
          </div>
        )
      case 'frameworks':
        return (
          <div className="p-4">
            <FrameworkManager frameworkId={frameworkId} onSelect={setFrameworkId} />
          </div>
        )
      case 'rules':
        return (
          <div className="p-4">
            <RulesManager frameworkId={frameworkId} scope={scope} />
          </div>
        )
      case 'dictionaries':
        return (
          <div className="p-4">
            <DictionariesManager />
          </div>
        )
      case 'results':
        return (
          <div className="p-4">
            <ResultsViewer dataSourceId={dataSourceId} />
          </div>
        )
      case 'policies':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Classification Policies</h2>
              <button className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300" onClick={() => setActiveView('policy-editor')}>
                Create Policy
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {policies?.data?.map((policy: any) => (
                <div key={policy.id} className="p-4 rounded border border-zinc-800 bg-zinc-900">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{policy.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${policy.is_active ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                      {policy.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{policy.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Priority: <span className="text-zinc-200">{policy.priority}</span></div>
                    <div>Scope: <span className="text-zinc-200">{policy.scope}</span></div>
                    <div>Mandatory: <span className="text-zinc-200">{policy.is_mandatory ? 'Yes' : 'No'}</span></div>
                    <div>Auto Apply: <span className="text-zinc-200">{policy.auto_apply ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'metrics':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Classification Metrics</h2>
              <select value={metricsTimeRange} onChange={e => setMetricsTimeRange(e.target.value)} className="h-8 px-3 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200">
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
                <div className="text-2xl font-bold text-blue-300">1,234</div>
                <div className="text-sm text-zinc-400">Total Classifications</div>
                <div className="text-xs text-green-300">+12% from last period</div>
              </div>
              <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
                <div className="text-2xl font-bold text-green-300">89%</div>
                <div className="text-sm text-zinc-400">Accuracy Rate</div>
                <div className="text-xs text-green-300">+3% from last period</div>
              </div>
              <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
                <div className="text-2xl font-bold text-yellow-300">156</div>
                <div className="text-sm text-zinc-400">Pending Reviews</div>
                <div className="text-xs text-red-300">+8 from last period</div>
              </div>
              <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
                <div className="text-2xl font-bold text-purple-300">45</div>
                <div className="text-sm text-zinc-400">Active Rules</div>
                <div className="text-xs text-zinc-400">No change</div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
                <h3 className="font-medium mb-3">Classification Distribution</h3>
                <div className="space-y-2">
                  {['Public', 'Internal', 'Confidential', 'Restricted'].map((level, i) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300">{level}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-zinc-700 rounded">
                          <div className="h-2 bg-blue-500 rounded" style={{ width: `${25 + i * 15}%` }}></div>
                        </div>
                        <span className="text-xs text-zinc-400">{25 + i * 15}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
                <h3 className="font-medium mb-3">Performance Trends</h3>
                <div className="h-32 flex items-center justify-center text-zinc-500">
                  Chart placeholder
                </div>
              </div>
            </div>
          </div>
        )
      case 'bulk':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Bulk Operations</h2>
              <button className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300" onClick={() => setActiveView('batch-wizard')}>
                New Batch Job
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
                <h3 className="font-medium mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full h-10 px-3 text-sm rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-left" onClick={() => setShowBulkApply(true)}>
                    Apply Framework to Data Source
                  </button>
                  <button className="w-full h-10 px-3 text-sm rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-left">
                    Export Classification Results
                  </button>
                  <button className="w-full h-10 px-3 text-sm rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-left">
                    Import Classification Rules
                  </button>
                  <button className="w-full h-10 px-3 text-sm rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300 text-left">
                    Bulk Update Sensitivity Levels
                  </button>
                </div>
              </div>
              <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
                <h3 className="font-medium mb-3">Recent Batch Jobs</h3>
                <div className="space-y-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-zinc-800/50">
                      <div>
                        <div className="text-sm text-zinc-200">Batch Job #{i + 1}</div>
                        <div className="text-xs text-zinc-400">2 hours ago</div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${i % 3 === 0 ? 'bg-green-500/20 text-green-300' : i % 3 === 1 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>
                        {i % 3 === 0 ? 'Completed' : i % 3 === 1 ? 'Running' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case 'audit':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Audit Trail</h2>
              <div className="flex items-center space-x-2">
                <select value={filterByStatus} onChange={e => setFilterByStatus(e.target.value)} className="h-8 px-3 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200">
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                </select>
                <button className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300" onClick={loadAuditEntries}>
                  Refresh
                </button>
              </div>
            </div>
            <div className="rounded border border-zinc-800 bg-zinc-900">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-zinc-400">Timestamp</th>
                      <th className="px-4 py-3 text-left text-zinc-400">User</th>
                      <th className="px-4 py-3 text-left text-zinc-400">Action</th>
                      <th className="px-4 py-3 text-left text-zinc-400">Target</th>
                      <th className="px-4 py-3 text-left text-zinc-400">Status</th>
                      <th className="px-4 py-3 text-left text-zinc-400">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-zinc-800/50">
                        <td className="px-4 py-3 text-zinc-300">{new Date(entry.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3 text-zinc-300">{entry.user}</td>
                        <td className="px-4 py-3 text-zinc-300">{entry.action}</td>
                        <td className="px-4 py-3 text-zinc-300">{entry.target}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded ${
                            entry.status === 'success' ? 'bg-green-500/20 text-green-300' :
                            entry.status === 'error' ? 'bg-red-500/20 text-red-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-400">{entry.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      case 'rule-tester':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Rule Tester</h2>
              <div className="flex items-center space-x-2">
                <select value={selectedRule?.id || ''} onChange={e => {
                  const rule = rules?.data?.find((r: any) => r.id === parseInt(e.target.value))
                  setSelectedRule(rule || null)
                }} className="h-8 px-3 text-xs bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200">
                  <option value="">Select Rule</option>
                  {rules?.data?.map((rule: any) => (
                    <option key={rule.id} value={rule.id}>{rule.name}</option>
                  ))}
                </select>
                <button 
                  className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300"
                  onClick={() => selectedRule && testRule(selectedRule, ruleTestData)}
                  disabled={!selectedRule || !ruleTestData}
                >
                  Test Rule
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Test Data</label>
                  <textarea
                    value={ruleTestData}
                    onChange={e => setRuleTestData(e.target.value)}
                    placeholder="Enter test data here..."
                    className="w-full h-32 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500"
                  />
                </div>
                {selectedRule && (
                  <div className="p-4 rounded border border-zinc-800 bg-zinc-900">
                    <h3 className="font-medium mb-2">Rule Details</h3>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-zinc-400">Name:</span> <span className="text-zinc-200">{selectedRule.name}</span></div>
                      <div><span className="text-zinc-400">Type:</span> <span className="text-zinc-200">{selectedRule.rule_type}</span></div>
                      <div><span className="text-zinc-400">Pattern:</span> <span className="text-zinc-200 font-mono">{selectedRule.pattern}</span></div>
                      <div><span className="text-zinc-400">Sensitivity:</span> <span className="text-zinc-200">{selectedRule.sensitivity_level}</span></div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Test Results</label>
                {ruleTestResult ? (
                  <div className="p-4 rounded border border-zinc-800 bg-zinc-900 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Match:</span>
                      <span className={`px-2 py-1 text-xs rounded ${ruleTestResult.matched ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                        {ruleTestResult.matched ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Confidence:</span>
                      <span className="text-sm text-zinc-200">{(ruleTestResult.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Match Percentage:</span>
                      <span className="text-sm text-zinc-200">{ruleTestResult.match_percentage.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-sm text-zinc-400">Matched Values:</span>
                      <div className="mt-1 space-y-1">
                        {ruleTestResult.values.map((value, i) => (
                          <div key={i} className="px-2 py-1 text-xs bg-zinc-800 rounded font-mono text-zinc-200">{value}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded border border-zinc-800 bg-zinc-900 text-center text-zinc-500">
                    Run a test to see results
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      case 'policy-editor':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Policy Editor</h2>
              <div className="flex items-center space-x-2">
                <button className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300" onClick={() => setActiveView('policies')}>
                  Cancel
                </button>
                <button className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300" onClick={savePolicy}>
                  Save Policy
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Policy Name</label>
                  <input
                    value={policyEditorState.name}
                    onChange={e => setPolicyEditorState(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter policy name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                  <textarea
                    value={policyEditorState.description}
                    onChange={e => setPolicyEditorState(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full h-20 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500"
                    placeholder="Enter policy description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
                    <input
                      type="number"
                      value={policyEditorState.priority}
                      onChange={e => setPolicyEditorState(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                      className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Scope</label>
                    <select
                      value={policyEditorState.scope}
                      onChange={e => setPolicyEditorState(prev => ({ ...prev, scope: e.target.value as ClassificationScope }))}
                      className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    >
                      {Object.values(ClassificationScope).map(scope => (
                        <option key={scope} value={scope}>{scope}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Default Sensitivity</label>
                    <select
                      value={policyEditorState.default_sensitivity}
                      onChange={e => setPolicyEditorState(prev => ({ ...prev, default_sensitivity: e.target.value as SensitivityLevel }))}
                      className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    >
                      {Object.values(SensitivityLevel).map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">Policy Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={policyEditorState.is_mandatory}
                        onChange={e => setPolicyEditorState(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                        className="rounded border-zinc-700 bg-zinc-800"
                      />
                      <span className="text-sm text-zinc-300">Mandatory Policy</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={policyEditorState.auto_apply}
                        onChange={e => setPolicyEditorState(prev => ({ ...prev, auto_apply: e.target.checked }))}
                        className="rounded border-zinc-700 bg-zinc-800"
                      />
                      <span className="text-sm text-zinc-300">Auto Apply</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={policyEditorState.requires_approval}
                        onChange={e => setPolicyEditorState(prev => ({ ...prev, requires_approval: e.target.checked }))}
                        className="rounded border-zinc-700 bg-zinc-800"
                      />
                      <span className="text-sm text-zinc-300">Requires Approval</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">Conditions</h3>
                  <textarea
                    value={JSON.stringify(policyEditorState.conditions, null, 2)}
                    onChange={e => {
                      try {
                        const parsed = JSON.parse(e.target.value)
                        setPolicyEditorState(prev => ({ ...prev, conditions: parsed }))
                      } catch (err) {
                        // Invalid JSON, keep current state
                      }
                    }}
                    className="w-full h-32 px-3 py-2 text-xs font-mono bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter JSON conditions"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 'dictionary-editor':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Dictionary Editor</h2>
              <div className="flex items-center space-x-2">
                <button className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300" onClick={() => setActiveView('dictionaries')}>
                  Cancel
                </button>
                <button className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300" onClick={saveDictionary}>
                  Save Dictionary
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Dictionary Name</label>
                  <input
                    value={dictionaryEditorState.name}
                    onChange={e => setDictionaryEditorState(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="Enter dictionary name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
                  <textarea
                    value={dictionaryEditorState.description}
                    onChange={e => setDictionaryEditorState(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full h-20 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500"
                    placeholder="Enter dictionary description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Language</label>
                    <select
                      value={dictionaryEditorState.language}
                      onChange={e => setDictionaryEditorState(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Category</label>
                    <input
                      value={dictionaryEditorState.category}
                      onChange={e => setDictionaryEditorState(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                      placeholder="e.g., PII, Financial"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Tags (comma-separated)</label>
                  <input
                    value={dictionaryEditorState.tags.join(', ')}
                    onChange={e => setDictionaryEditorState(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) }))}
                    className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200"
                    placeholder="e.g., sensitive, financial, personal"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Dictionary Entries</label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        value={dictionaryEditorState.entries.join('\n')}
                        onChange={e => setDictionaryEditorState(prev => ({ ...prev, entries: e.target.value.split('\n').filter(entry => entry.trim()) }))}
                        className="flex-1 h-32 px-3 py-2 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200 placeholder:text-zinc-500"
                        placeholder="Enter dictionary entries, one per line"
                      />
                    </div>
                    <div className="text-xs text-zinc-400">
                      {dictionaryEditorState.entries.length} entries
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-zinc-300 mb-3">Preview</h3>
                  <div className="p-3 rounded border border-zinc-800 bg-zinc-900 max-h-32 overflow-y-auto">
                    {dictionaryEditorState.entries.length > 0 ? (
                      <div className="space-y-1">
                        {dictionaryEditorState.entries.slice(0, 10).map((entry, i) => (
                          <div key={i} className="text-xs text-zinc-300 font-mono">{entry}</div>
                        ))}
                        {dictionaryEditorState.entries.length > 10 && (
                          <div className="text-xs text-zinc-500">... and {dictionaryEditorState.entries.length - 10} more</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500">No entries yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'batch-wizard':
        return (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Batch Classification Wizard</h2>
              <div className="flex items-center space-x-2">
                <button className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300" onClick={() => setActiveView('bulk')}>
                  Cancel
                </button>
                <button className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300" onClick={nextBatchStep}>
                  {currentBatchStep === batchWizardSteps.length - 1 ? 'Execute' : 'Next'}
                </button>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                {batchWizardSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      index === currentBatchStep ? 'bg-blue-500 text-white' :
                      step.completed ? 'bg-green-500 text-white' :
                      'bg-zinc-700 text-zinc-300'
                    }`}>
                      {step.completed ? '✓' : index + 1}
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-zinc-200">{step.title}</div>
                      <div className="text-xs text-zinc-400">{step.description}</div>
                    </div>
                    {index < batchWizardSteps.length - 1 && (
                      <div className="w-8 h-px bg-zinc-700 mx-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded border border-zinc-800 bg-zinc-900">
              {currentBatchStep === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Select Data Sources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }, (_, i) => (
                      <label key={i} className="flex items-center space-x-2 p-3 rounded border border-zinc-700 bg-zinc-800/50 cursor-pointer hover:bg-zinc-800">
                        <input type="checkbox" className="rounded border-zinc-700 bg-zinc-800" />
                        <div>
                          <div className="text-sm font-medium text-zinc-200">Data Source {i + 1}</div>
                          <div className="text-xs text-zinc-400">PostgreSQL • 1,234 tables</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {currentBatchStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Configure Classification Rules</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Select Framework</label>
                      <select className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200">
                        <option>GDPR Compliance Framework</option>
                        <option>HIPAA Compliance Framework</option>
                        <option>PCI DSS Framework</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Additional Rules</label>
                      <div className="space-y-2">
                        {Array.from({ length: 3 }, (_, i) => (
                          <label key={i} className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded border-zinc-700 bg-zinc-800" />
                            <span className="text-sm text-zinc-300">Rule {i + 1}: Email Pattern Detection</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentBatchStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preview Changes</h3>
                  <div className="rounded border border-zinc-800 bg-zinc-950">
                    <div className="px-4 py-3 border-b border-zinc-800 text-sm font-medium">Classification Preview</div>
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-zinc-400">Total Tables</div>
                          <div className="text-lg font-semibold text-zinc-200">1,234</div>
                        </div>
                        <div>
                          <div className="text-zinc-400">Will be Classified</div>
                          <div className="text-lg font-semibold text-blue-300">856</div>
                        </div>
                        <div>
                          <div className="text-zinc-400">Already Classified</div>
                          <div className="text-lg font-semibold text-green-300">378</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300">Public</span>
                          <span className="text-zinc-200">234 (27%)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300">Internal</span>
                          <span className="text-zinc-200">456 (53%)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300">Confidential</span>
                          <span className="text-zinc-200">134 (16%)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300">Restricted</span>
                          <span className="text-zinc-200">32 (4%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentBatchStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Execute Classification</h3>
                  <div className="p-4 rounded border border-zinc-800 bg-zinc-950">
                    <div className="text-sm text-zinc-300 mb-4">Ready to execute batch classification on 1,234 tables across 6 data sources.</div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">Estimated Duration</span>
                        <span className="text-sm text-zinc-200">~15 minutes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">Parallel Jobs</span>
                        <span className="text-sm text-zinc-200">2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">Batch Size</span>
                        <span className="text-sm text-zinc-200">500</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <button
                className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300"
                onClick={prevBatchStep}
                disabled={currentBatchStep === 0}
              >
                Previous
              </button>
              <div className="text-xs text-zinc-400">
                Step {currentBatchStep + 1} of {batchWizardSteps.length}
              </div>
            </div>
          </div>
        )
    }
  }, [activeView, frameworkId, scope, dataSourceId, rules, selectedRule, ruleTestData, ruleTestResult, testRule, policyEditorState, savePolicy, dictionaryEditorState, saveDictionary, batchWizardSteps, currentBatchStep, nextBatchStep, prevBatchStep])

  const renderCreateFrameworkModal = useCallback(() => {
    if (!showCreateFramework) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-full max-w-lg rounded border border-zinc-700 bg-zinc-900">
          <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">Create Framework</div>
          <div className="p-4 space-y-3">
            <input id="fw-name" placeholder="Name" className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200" />
            <input id="fw-version" placeholder="Version (e.g., 1.0.0)" className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200" />
          </div>
          <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end space-x-2">
            <button className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300" onClick={() => setShowCreateFramework(false)}>Cancel</button>
            <button
              className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300"
              onClick={() => {
                const name = (document.getElementById('fw-name') as HTMLInputElement)?.value || 'New Framework'
                const version = (document.getElementById('fw-version') as HTMLInputElement)?.value || '1.0.0'
                createFrameworkAction({ name, version })
              }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    )
  }, [showCreateFramework, createFrameworkAction])

  const renderCreateRuleModal = useCallback(() => {
    if (!showCreateRule) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-full max-w-xl rounded border border-zinc-700 bg-zinc-900">
          <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">Create Rule</div>
          <div className="p-4 grid gap-3">
            <input id="rl-name" placeholder="Name" className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200" />
            <select id="rl-type" className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200">
              <option value="regex_pattern">Regex Pattern</option>
              <option value="dictionary_lookup">Dictionary Lookup</option>
              <option value="column_name_pattern">Column Name Pattern</option>
              <option value="table_name_pattern">Table Name Pattern</option>
              <option value="data_type_pattern">Data Type Pattern</option>
              <option value="metadata_pattern">Metadata Pattern</option>
              <option value="composite_pattern">Composite Pattern</option>
            </select>
            <input id="rl-pattern" placeholder="Pattern (regex or term)" className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200" />
            <select id="rl-sens" className="w-full h-9 px-3 text-sm bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200">
              {(['public','internal','confidential','restricted'] as SensitivityLevel[]).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end space-x-2">
            <button className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300" onClick={() => setShowCreateRule(false)}>Cancel</button>
            <button
              className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300"
              onClick={() => {
                const name = (document.getElementById('rl-name') as HTMLInputElement)?.value || 'New Rule'
                const rule_type = (document.getElementById('rl-type') as HTMLSelectElement)?.value || 'regex_pattern'
                const pattern = (document.getElementById('rl-pattern') as HTMLInputElement)?.value || ''
                const sensitivity_level = (document.getElementById('rl-sens') as HTMLSelectElement)?.value || 'confidential'
                createRuleAction({ name, rule_type, pattern, sensitivity_level })
              }}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    )
  }, [showCreateRule, createRuleAction])

  const renderBulkApplyModal = useCallback(() => {
    if (!showBulkApply) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-full max-w-lg rounded border border-zinc-700 bg-zinc-900">
          <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">Bulk Apply Classification</div>
          <div className="p-4 space-y-3 text-xs text-zinc-400">
            <div>Applies current framework rules to the selected data source.</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">Data Source ID: <span className="text-zinc-200">{dataSourceId || 'N/A'}</span></div>
              <label className="flex items-center space-x-2"><input type="checkbox" id="bk-force" /><span>Force reclassify</span></label>
              <label className="flex items-center space-x-2"><span>Batch size</span><input id="bk-batch" defaultValue={500} className="w-24 h-8 px-2 bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200" /></label>
              <label className="flex items-center space-x-2"><span>Parallel jobs</span><input id="bk-par" defaultValue={2} className="w-24 h-8 px-2 bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200" /></label>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end space-x-2">
            <button className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300" onClick={() => setShowBulkApply(false)}>Cancel</button>
            <button
              className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300"
              onClick={() => {
                const force = (document.getElementById('bk-force') as HTMLInputElement)?.checked
                const batch = parseInt((document.getElementById('bk-batch') as HTMLInputElement)?.value || '500', 10)
                const par = parseInt((document.getElementById('bk-par') as HTMLInputElement)?.value || '2', 10)
                applyBulk({ force_reclassify: !!force, batch_size: batch, parallel_jobs: par })
                setShowBulkApply(false)
              }}
            >
              Start
            </button>
          </div>
        </div>
      </div>
    )
  }, [showBulkApply, applyBulk, dataSourceId])

  const renderAssignModal = useCallback(() => {
    if (!showAssignModal || !selectedEntity) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-full max-w-lg rounded border border-zinc-700 bg-zinc-900">
          <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">Assign Classification</div>
          <div className="p-4 space-y-3 text-xs text-zinc-400">
            <div>Target: <span className="text-zinc-200">{selectedEntity.type}:{selectedEntity.name || selectedEntity.id}</span></div>
            <div>Framework: <span className="text-zinc-200">{framework?.data?.name || 'N/A'}</span></div>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2"><span>Confidence</span><input id="as-conf" defaultValue={1} className="w-24 h-8 px-2 bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200" /></label>
              <input id="as-just" placeholder="Justification" className="col-span-2 h-8 px-2 bg-zinc-800/50 border border-zinc-700 rounded text-zinc-200" />
            </div>
          </div>
          <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end space-x-2">
            <button className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300" onClick={() => setShowAssignModal(false)}>Cancel</button>
            <button className="h-8 px-3 text-xs rounded border border-blue-600 bg-blue-600/20 text-blue-300" onClick={assignAction}>Assign</button>
          </div>
        </div>
      </div>
    )
  }, [showAssignModal, selectedEntity, framework?.data, assignAction])

  return (
    <div className={`dark ${className || ''}`}>
      <div className="min-h-[600px] bg-zinc-950 text-zinc-100 rounded border border-zinc-800/50 overflow-hidden">
        {renderToolbar()}
        <div className="flex h-[calc(100vh-12rem)]">
          {renderSidebar()}
          <main className="flex-1 overflow-auto bg-zinc-950">
            {renderContent()}
          </main>
        </div>
      </div>
      {renderCreateFrameworkModal()}
      {renderCreateRuleModal()}
      {renderBulkApplyModal()}
      {renderAssignModal()}
      {renderKeyboardShortcutsModal(showKeyboardShortcuts, setShowKeyboardShortcuts)}
    </div>
  )
}

const renderKeyboardShortcutsModal = (showKeyboardShortcuts: boolean, setShowKeyboardShortcuts: (show: boolean) => void) => {
  if (!showKeyboardShortcuts) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl rounded border border-zinc-700 bg-zinc-900">
        <div className="px-4 py-3 border-b border-zinc-700 text-sm font-semibold">Keyboard Shortcuts</div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-2">Navigation</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>Overview</span><span className="text-zinc-400">⌘1</span></div>
                <div className="flex justify-between"><span>Frameworks</span><span className="text-zinc-400">⌘2</span></div>
                <div className="flex justify-between"><span>Rules</span><span className="text-zinc-400">⌘3</span></div>
                <div className="flex justify-between"><span>Dictionaries</span><span className="text-zinc-400">⌘4</span></div>
                <div className="flex justify-between"><span>Results</span><span className="text-zinc-400">⌘5</span></div>
                <div className="flex justify-between"><span>Policies</span><span className="text-zinc-400">⌘6</span></div>
                <div className="flex justify-between"><span>Metrics</span><span className="text-zinc-400">⌘7</span></div>
                <div className="flex justify-between"><span>Bulk Ops</span><span className="text-zinc-400">⌘B</span></div>
                <div className="flex justify-between"><span>Audit</span><span className="text-zinc-400">⌘A</span></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-2">Tools</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>Rule Tester</span><span className="text-zinc-400">⌘T</span></div>
                <div className="flex justify-between"><span>Policy Editor</span><span className="text-zinc-400">⌘E</span></div>
                <div className="flex justify-between"><span>Dictionary Editor</span><span className="text-zinc-400">⌘D</span></div>
                <div className="flex justify-between"><span>Batch Wizard</span><span className="text-zinc-400">⌘W</span></div>
                <div className="flex justify-between"><span>New Framework</span><span className="text-zinc-400">⌘F</span></div>
                <div className="flex justify-between"><span>New Rule</span><span className="text-zinc-400">⌘R</span></div>
                <div className="flex justify-between"><span>Search</span><span className="text-zinc-400">⌘K</span></div>
                <div className="flex justify-between"><span>Advanced Filters</span><span className="text-zinc-400">⌘S</span></div>
                <div className="flex justify-between"><span>Help</span><span className="text-zinc-400">⌘?</span></div>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-800">
            <div className="text-xs text-zinc-400">
              Press <span className="text-zinc-200">Escape</span> to close any modal or this help dialog.
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-zinc-700 flex items-center justify-end">
          <button className="h-8 px-3 text-xs rounded border border-zinc-700 bg-zinc-800/50 text-zinc-300" onClick={() => setShowKeyboardShortcuts(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ManualClassificationManager


