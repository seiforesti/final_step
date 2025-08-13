import React, { useState, useRef, useEffect } from 'react';
import {
  FiPlus,
  FiMinus,
  FiCopy,
  FiPlay,
  FiRefreshCw,
  FiTrash2,
  FiMoon,
  FiSun,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiBook,
  FiCode,
  FiDatabase,
  FiGitBranch,
  FiPlayCircle,
  FiBarChart2,
  FiChevronDown,
  FiChevronUp,
  FiFolder,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiExternalLink,
  FiMaximize2,
  FiMinimize2
} from 'react-icons/fi';

// Types
type TaskType = 'Notebook' | 'Python' | 'SQL' | 'Pipeline' | 'Run job' | 'Dashboard';
type ComputeType = 'Serverless' | 'Autoscaling' | 'Fixed';

interface Task {
  id: string;
  name: string;
  type: TaskType;
  path: string;
  compute: ComputeType;
  position: { x: number; y: number };
  dependsOn?: string[];
  outputs?: string[];
  sourceType?: 'Workspace' | 'URL' | 'Repo' | 'Query' | 'Git provider';
  parameters?: { key: string; value: string }[];
  jobId?: string;
  dashboardId?: string;
  sqlQuery?: string;
  pipelineRefresh?: boolean;
  gitInfo?: {
    url: string;
    provider: string;
    referenceType: 'branch' | 'tag' | 'commit';
    referenceValue: string;
  };
}

interface Connector {
  id: string;
  source: string;
  target: string;
  points: { x: number; y: number }[];
}

const initialTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Inputs-pipeline',
    type: 'Pipeline',
    path: 'Hostile: Bakehouse_ETL',
    compute: 'Serverless',
    position: { x: 100, y: 100 },
    outputs: ['task-2', 'task-4']
  },
  {
    id: 'task-2',
    name: 'DRX_with_SOL',
    type: 'Pipeline',
    path: 'Bakehouse: Flagship AI (K: front_workflow.java)',
    compute: 'Serverless',
    position: { x: 400, y: 100 },
    dependsOn: ['task-1'],
    outputs: ['task-3']
  },
  {
    id: 'task-3',
    name: 'Update_downstream',
    type: 'Pipeline',
    path: '...execution-coupled-site_Overview',
    compute: 'Serverless',
    position: { x: 700, y: 100 },
    dependsOn: ['task-2']
  },
  {
    id: 'task-4',
    name: 'Email_bar',
    type: 'Pipeline',
    path: '"FAST"',
    compute: 'Serverless',
    position: { x: 400, y: 300 },
    dependsOn: ['task-1']
  }
];

const initialParameters = [
  { key: 'input_path', value: '/data/input' },
  { key: 'output_path', value: '/data/output' }
];

const TASK_TYPE_ICONS: Record<TaskType, React.ReactNode> = {
  Notebook: <FiBook className="mr-2" />,
  Python: <FiCode className="mr-2" />,
  SQL: <FiDatabase className="mr-2" />,
  Pipeline: <FiGitBranch className="mr-2" />,
  'Run job': <FiPlayCircle className="mr-2" />,
  Dashboard: <FiBarChart2 className="mr-2" />
};

const NOTEBOOK_EXAMPLES = [
  { name: 'Build your first AI agent', path: '/Workspace/AI/first_agent', lastModified: '2024-06-10', owner: 'selfabdaoui8@gmail.com' },
  { name: 'Explore data with AI-assisted note...', path: '/Workspace/AI/explore_data', lastModified: '2024-06-09', owner: 'selfabdaoui8@gmail.com' },
  { name: 'New Pipeline 2025-06-09 16:55', path: '/Workspace/Pipelines/new_pipeline', lastModified: '2024-06-08', owner: 'selfabdaoui8@gmail.com' },
  { name: 'Untitled Notebook 2025-06-02 14...', path: '/Workspace/Notebooks/untitled', lastModified: '2024-06-07', owner: 'selfabdaoui8@gmail.com' }
];

const TASK_TYPE_COLORS: Record<TaskType, string> = {
  Notebook: 'from-blue-400 to-blue-600',
  Python: 'from-green-400 to-green-600',
  SQL: 'from-purple-400 to-purple-600',
  Pipeline: 'from-pink-400 to-pink-600',
  'Run job': 'from-yellow-400 to-yellow-600',
  Dashboard: 'from-indigo-400 to-indigo-600'
};

const JobCreationPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [jobDetailsPanelExpanded, setJobDetailsPanelExpanded] = useState(true);
  const [taskDetailsPanelExpanded, setTaskDetailsPanelExpanded] = useState(true);
  const [taskDetailsHeight, setTaskDetailsHeight] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [jobName, setJobName] = useState<string>('Bakehouse Orchestration');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTasks[0].id);
  const [parameters, setParameters] = useState(initialParameters);

  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [draggingConnector, setDraggingConnector] = useState<string | null>(null);
  const [tempConnector, setTempConnector] = useState<{ source: string; x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragTaskStart, setDragTaskStart] = useState({ x: 0, y: 0 });
  const [isFullScreen, setIsFullScreen] = useState(false);

  const workflowRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);

  // Notebook/Git modal states
  const [showNotebookExplorer, setShowNotebookExplorer] = useState(false);
  const [notebookSearch, setNotebookSearch] = useState('');
  const [showGitForm, setShowGitForm] = useState(false);
  const [gitCredentialsMissing, setGitCredentialsMissing] = useState(true);
  const [gitProvider, setGitProvider] = useState<string>('');
  const [gitReferenceType, setGitReferenceType] = useState<'branch' | 'tag' | 'commit'>('branch');
  const [gitReferenceValue, setGitReferenceValue] = useState<string>('');
  const [gitRepoUrl, setGitRepoUrl] = useState<string>('');

  // Get selected task object
  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  // Handle resizing of task details panel
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const containerRect = resizeRef.current?.parentElement?.getBoundingClientRect();
      if (!containerRect) return;
      const newHeight = containerRect.bottom - e.clientY;
      if (newHeight > 150 && newHeight < 500) {
        setTaskDetailsHeight(newHeight);
      }
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Update connectors when tasks change
  useEffect(() => {
    const newConnectors: Connector[] = [];
    tasks.forEach(task => {
      if (task.outputs) {
        task.outputs.forEach(targetId => {
          const targetTask = tasks.find(t => t.id === targetId);
          if (targetTask) {
            newConnectors.push({
              id: `conn-${task.id}-${targetId}`,
              source: task.id,
              target: targetId,
              points: calculateConnectorPoints(task, targetTask)
            });
          }
        });
      }
      if (task.dependsOn) {
        task.dependsOn.forEach(sourceId => {
          const sourceTask = tasks.find(t => t.id === sourceId);
          if (sourceTask && !sourceTask.outputs?.includes(task.id)) {
            newConnectors.push({
              id: `conn-${sourceId}-${task.id}`,
              source: sourceId,
              target: task.id,
              points: calculateConnectorPoints(sourceTask, task)
            });
          }
        });
      }
    });
    setConnectors(newConnectors);
    // eslint-disable-next-line
  }, [tasks, zoomLevel, offset]);

  // Improved connector points: always attach to edge of container, even on zoom/offset
  function calculateConnectorPoints(source: Task, target: Task) {
    // Container size
    const width = 220;
    const height = 90;
    // Attach from right center of source to left center of target
    const sourceX = source.position.x + width;
    const sourceY = source.position.y + height / 2;
    const targetX = target.position.x;
    const targetY = target.position.y + height / 2;
    const distance = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
    const curveIntensity = Math.min(120, Math.max(60, distance * 0.25));
    return [
      { x: sourceX, y: sourceY },
      { x: sourceX + curveIntensity, y: sourceY },
      { x: targetX - curveIntensity, y: targetY },
      { x: targetX, y: targetY }
    ];
  }

  // Canvas and drag logic
  function handleDragging(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }
  function handleTaskDrag(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (draggedTask) {
      setTasks(tasks =>
        tasks.map(task =>
          task.id === draggedTask
            ? {
                ...task,
                position: {
                  x: e.clientX - dragTaskStart.x,
                  y: e.clientY - dragTaskStart.y
                }
              }
            : task
        )
      );
    }
  }
  function handleConnectorDrag(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (draggingConnector && tempConnector) {
      const rect = workflowRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTempConnector({
        ...tempConnector,
        x: (e.clientX - rect.left - offset.x) / zoomLevel,
        y: (e.clientY - rect.top - offset.y) / zoomLevel
      });
    }
  }
  function stopTaskDrag() {
    setDraggedTask(null);
  }
  function startDragging(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e.button !== 0 || draggingConnector) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }
  function stopDragging() {
    setIsDragging(false);
  }
  function completeConnector(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!draggingConnector || !tempConnector) return;
    const rect = workflowRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - offset.x) / zoomLevel;
    const y = (e.clientY - rect.top - offset.y) / zoomLevel;
    // Container size
    const width = 220;
    const height = 90;
    const targetTask = tasks.find(task => {
      const taskX = task.position.x;
      const taskY = task.position.y;
      return x >= taskX && x <= taskX + width && y >= taskY && y <= taskY + height;
    });
    if (targetTask && targetTask.id !== draggingConnector) {
      setTasks(tasks =>
        tasks.map(task =>
          task.id === draggingConnector
            ? {
                ...task,
                outputs: task.outputs
                  ? [...task.outputs, targetTask.id]
                  : [targetTask.id]
              }
            : task
        )
      );
    }
    setDraggingConnector(null);
    setTempConnector(null);
  }

  function addNewTask(x: number, y: number) {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: 'New task',
      type: 'Notebook',
      path: '/path/to/notebook',
      compute: 'Serverless',
      position: { x: x - offset.x, y: y - offset.y }
    };
    setTasks(tasks => [...tasks, newTask]);
    setSelectedTaskId(newTask.id);
  }

  // Task node rendering
  function renderTaskNodes(): React.ReactNode {
    const width = 220;
    const height = 90;
    return tasks.map(task => (
      <div
        key={task.id}
        className={`absolute shadow-lg transition-all duration-150 group select-none
          ${selectedTaskId === task.id
            ? 'ring-4 ring-blue-400 z-30'
            : 'hover:ring-2 hover:ring-blue-300 z-20'}
        `}
        style={{
          left: task.position.x,
          top: task.position.y,
          width,
          height,
          borderRadius: 18,
          background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
          cursor: 'move',
          backgroundImage: `linear-gradient(135deg, ${getTaskTypeColor(task.type, darkMode)})`
        }}
        onClick={() => setSelectedTaskId(task.id)}
        onMouseDown={e => {
          e.stopPropagation();
          setDraggedTask(task.id);
          setDragTaskStart({
            x: e.clientX - task.position.x,
            y: e.clientY - task.position.y
          });
        }}
      >
        <div className="flex items-center justify-between px-4 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{TASK_TYPE_ICONS[task.type]}</span>
            <span className="font-semibold text-base truncate text-white drop-shadow">{task.name}</span>
          </div>
          <button
            className="opacity-0 group-hover:opacity-100 transition text-white"
            onClick={e => {
              e.stopPropagation();
              setDraggingConnector(task.id);
              setTempConnector({
                source: task.id,
                x: task.position.x + width,
                y: task.position.y + height / 2
              });
            }}
            title="Add connection"
          >
            <FiPlus size={18} />
          </button>
        </div>
        <div className="px-4 pb-2 pt-1 flex items-center justify-between">
          <span className="text-xs text-white/80 truncate">{task.path}</span>
          <span className="text-xs font-medium text-white/90">{task.type}</span>
        </div>
        {/* Task action bar */}
        <div className="absolute -bottom-7 left-0 right-0 flex justify-center space-x-2">
          <button
            className="bg-white/80 text-gray-700 rounded-full p-1 hover:bg-blue-100 shadow"
            onClick={e => {
              e.stopPropagation();
              const newTask = {
                ...task,
                id: `task-${Date.now()}`,
                position: { x: task.position.x + 50, y: task.position.y + 50 }
              };
              setTasks(tasks => [...tasks, newTask]);
              setSelectedTaskId(newTask.id);
            }}
            title="Clone task"
          >
            <FiCopy size={12} />
          </button>
          <button
            className="bg-white/80 text-gray-700 rounded-full p-1 hover:bg-blue-100 shadow"
            onClick={e => e.stopPropagation()}
            title="Run task"
          >
            <FiPlay size={12} />
          </button>
          <button
            className="bg-white/80 text-gray-700 rounded-full p-1 hover:bg-blue-100 shadow"
            onClick={e => e.stopPropagation()}
            title="Reset task"
          >
            <FiRefreshCw size={12} />
          </button>
          <button
            className="bg-white/80 text-gray-700 rounded-full p-1 hover:bg-red-100 shadow"
            onClick={e => {
              e.stopPropagation();
              if (tasks.length <= 1) return;
              setTasks(tasks => tasks.filter(t => t.id !== task.id));
              if (selectedTaskId === task.id) {
                setSelectedTaskId(tasks.find(t => t.id !== task.id)?.id || null);
              }
            }}
            title="Delete task"
          >
            <FiTrash2 size={12} />
          </button>
        </div>
      </div>
    ));
  }

  // Connector rendering
  function renderConnectors(): React.ReactNode {
    return connectors.map(connector => {
      const points = connector.points;
      const path = `M ${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y}, ${points[2].x} ${points[2].y}, ${points[3].x} ${points[3].y}`;
      const arrowSize = 10;
      const dx = points[3].x - points[2].x;
      const dy = points[3].y - points[2].y;
      const angle = Math.atan2(dy, dx);
      const arrowPoints = [
        `${points[3].x},${points[3].y}`,
        `${points[3].x - arrowSize * Math.cos(angle - Math.PI / 6)},${points[3].y - arrowSize * Math.sin(angle - Math.PI / 6)}`,
        `${points[3].x - arrowSize * Math.cos(angle + Math.PI / 6)},${points[3].y - arrowSize * Math.sin(angle + Math.PI / 6)}`
      ].join(' ');
      return (
        <svg
          key={connector.id}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ overflow: 'visible', zIndex: 10 }}
        >
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.18" />
            </filter>
          </defs>
          <path
            d={path}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeDasharray="0"
            filter="url(#shadow)"
          />
          <polygon
            points={arrowPoints}
            fill="#6366f1"
            filter="url(#shadow)"
          />
        </svg>
      );
    });
  }

  function renderTempConnector(): React.ReactNode {
    if (!tempConnector) return null;
    const sourceTask = tasks.find(t => t.id === tempConnector.source);
    if (!sourceTask) return null;
    const width = 220;
    const height = 90;
    const startX = sourceTask.position.x + width;
    const startY = sourceTask.position.y + height / 2;
    const midX = startX + (tempConnector.x - startX) * 0.5;
    const curveIntensity = Math.min(120, Math.abs(tempConnector.y - startY) * 0.25);
    const points = [
      { x: startX, y: startY },
      { x: midX - curveIntensity, y: startY },
      { x: midX + curveIntensity, y: tempConnector.y },
      { x: tempConnector.x, y: tempConnector.y }
    ];
    const path = `M ${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y}, ${points[2].x} ${points[2].y}, ${points[3].x} ${points[3].y}`;
    const arrowSize = 10;
    const dx = points[3].x - points[2].x;
    const dy = points[3].y - points[2].y;
    const angle = Math.atan2(dy, dx);
    const arrowPoints = [
      `${points[3].x},${points[3].y}`,
      `${points[3].x - arrowSize * Math.cos(angle - Math.PI / 6)},${points[3].y - arrowSize * Math.sin(angle - Math.PI / 6)}`,
      `${points[3].x - arrowSize * Math.cos(angle + Math.PI / 6)},${points[3].y - arrowSize * Math.sin(angle + Math.PI / 6)}`
    ].join(' ');
    return (
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ overflow: 'visible', zIndex: 20 }}
      >
        <path
          d={path}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="3"
          strokeDasharray="0"
        />
        <polygon
          points={arrowPoints}
          fill="#22d3ee"
        />
      </svg>
    );
  }

  function zoomIn() {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  }
  function zoomOut() {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  }
  function fitToView() {
    setZoomLevel(1);
    setOffset({ x: 0, y: 0 });
  }
  function toggleFullScreen() {
    setIsFullScreen(v => !v);
  }

  // --- Notebook Task Details Section (Databricks-like) ---
  // ... (unchanged, see previous code for notebook modal, etc.)

  // Render dynamic section for task type
  function renderTaskTypeSection() {
    if (!selectedTask) return null;
    if (selectedTask.type === 'Notebook') {
      return renderNotebookSection();
    }
    // ... (rest unchanged)
    return null;
  }

  // Task type selection buttons
  function renderTaskTypeButtons() {
    if (!selectedTask) return null;
    return (
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(TASK_TYPE_ICONS) as TaskType[]).map(type => (
          <button
            key={type}
            className={`flex items-center justify-center p-2 border rounded transition
              ${selectedTask.type === type
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                : 'border-gray-300 dark:border-gray-600'}
            `}
            style={{
              background: selectedTask.type === type
                ? `linear-gradient(90deg, ${getTaskTypeColor(type, darkMode)})`
                : undefined,
              color: selectedTask.type === type ? '#2563eb' : undefined
            }}
            onClick={() =>
              setTasks(tasks =>
                tasks.map(t =>
                  t.id === selectedTask.id ? { ...t, type } : t
                )
              )
            }
          >
            {TASK_TYPE_ICONS[type]} {type}
          </button>
        ))}
      </div>
    );
  }

  // Helper for gradient color
  function getTaskTypeColor(type: TaskType, dark: boolean) {
    // Use tailwind color palette
    switch (type) {
      case 'Notebook': return dark ? '#2563eb,#1e40af' : '#60a5fa,#2563eb';
      case 'Python': return dark ? '#059669,#065f46' : '#6ee7b7,#059669';
      case 'SQL': return dark ? '#7c3aed,#4c1d95' : '#c4b5fd,#7c3aed';
      case 'Pipeline': return dark ? '#db2777,#831843' : '#f472b6,#db2777';
      case 'Run job': return dark ? '#f59e42,#b45309' : '#fde68a,#f59e42';
      case 'Dashboard': return dark ? '#6366f1,#312e81' : '#a5b4fc,#6366f1';
      default: return dark ? '#64748b,#334155' : '#e5e7eb,#64748b';
    }
  }

  // --- Notebook Section (unchanged, see previous code) ---
function renderNotebookSection() {
    if (!selectedTask) return null;

    // Simulate notebook path validation
    const isValidNotebook = !!selectedTask.path && selectedTask.path.startsWith('/Workspace');
    const notebookName = selectedTask.path?.split('/').pop() || '';

    return (
      <div className="mt-4">
        {/* Source type selection */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 dark:text-gray-400">
            Source
          </label>
          <div className="flex space-x-2">
            {['Workspace', 'Git provider'].map(src => (
              <button
                key={src}
                className={`flex items-center px-3 py-1 rounded-full border text-sm font-medium transition ${
                  selectedTask.sourceType === src
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'border-gray-300 bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                }`}
                onClick={() =>
                  setTasks(tasks =>
                    tasks.map(t =>
                      t.id === selectedTask.id
                        ? { ...t, sourceType: src as Task['sourceType'] }
                        : t
                    )
                  )
                }
              >
                {src === 'Workspace' ? <FiFolder className="mr-1" /> : <FiGitBranch className="mr-1" />}
                {src}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace notebook picker */}
        {selectedTask.sourceType === 'Workspace' && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 dark:text-gray-400">
              Notebook
            </label>
            <div className="flex items-center space-x-2">
              <div className={`flex-1 flex items-center px-3 py-2 rounded border transition ${
                isValidNotebook
                  ? 'border-green-400 bg-green-50 dark:bg-green-900'
                  : 'border-gray-300 bg-white dark:bg-gray-700'
              }`}>
                <FiBook className="mr-2 text-blue-500" />
                <span className="truncate">{selectedTask.path || <span className="italic text-gray-400">No notebook selected</span>}</span>
                {isValidNotebook ? (
                  <FiCheckCircle className="ml-2 text-green-500" />
                ) : (
                  <FiXCircle className="ml-2 text-gray-400" />
                )}
              </div>
              <button
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                onClick={() => setShowNotebookExplorer(true)}
                title="Browse workspace"
              >
                <FiSearch />
              </button>
              {isValidNotebook && (
                <a
                  href="#"
                  className="ml-1 text-blue-600 hover:underline dark:text-blue-400"
                  title="Open in new tab"
                  tabIndex={-1}
                >
                  <FiExternalLink />
                </a>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Select a notebook from your workspace.
            </div>
          </div>
        )}

        {/* Git provider notebook picker */}
        {selectedTask.sourceType === 'Git provider' && (
          <div className="mb-4">
            {gitCredentialsMissing && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">
                Git credentials for this account are missing. <a href="#" className="text-blue-600 dark:text-blue-400 underline">Add credentials</a>
              </div>
            )}
            <button
              className="text-blue-600 text-sm dark:text-blue-400"
              onClick={() => setShowGitForm(true)}
            >
              + Add a git reference
            </button>
          </div>
        )}

        {/* Parameters */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 dark:text-gray-400">
            Parameters
          </label>
          <div className="flex flex-col gap-2">
            {(selectedTask.parameters || [{ key: '', value: '' }]).map((param, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Key"
                  value={param.key}
                  onChange={e =>
                    setTasks(tasks =>
                      tasks.map(t =>
                        t.id === selectedTask.id
                          ? {
                              ...t,
                              parameters: (t.parameters || []).map((p, i) =>
                                i === idx ? { ...p, key: e.target.value } : p
                              )
                            }
                          : t
                      )
                    )
                  }
                />
                <input
                  type="text"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Value"
                  value={param.value}
                  onChange={e =>
                    setTasks(tasks =>
                      tasks.map(t =>
                        t.id === selectedTask.id
                          ? {
                              ...t,
                              parameters: (t.parameters || []).map((p, i) =>
                                i === idx ? { ...p, value: e.target.value } : p
                              )
                            }
                          : t
                      )
                    )
                  }
                />
                <button
                  className="text-gray-400 hover:text-red-500"
                  onClick={() =>
                    setTasks(tasks =>
                      tasks.map(t =>
                        t.id === selectedTask.id
                          ? {
                              ...t,
                              parameters: (t.parameters || []).filter((_, i) => i !== idx)
                            }
                          : t
                      )
                    )
                  }
                  title="Remove parameter"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
            <button
              className="text-blue-600 text-xs mt-1 self-start dark:text-blue-400"
              onClick={() =>
                setTasks(tasks =>
                  tasks.map(t =>
                    t.id === selectedTask.id
                      ? {
                          ...t,
                          parameters: [...(t.parameters || []), { key: '', value: '' }]
                        }
                      : t
                  )
                )
              }
            >
              + Add parameter
            </button>
          </div>
        </div>

        {/* Notebook Explorer Modal */}
        {showNotebookExplorer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-[600px] h-[500px] flex flex-col shadow-2xl">
              <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <h3 className="text-lg font-semibold dark:text-white">Select Notebook</h3>
                <button onClick={() => setShowNotebookExplorer(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  ×
                </button>
              </div>
              <div className="flex-1 flex">
                {/* Sidebar */}
                <div className="w-40 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-3">
                  <div className="font-semibold text-xs text-gray-500 dark:text-gray-400 mb-2">Folders</div>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded">
                      <FiFolder /> Recents
                    </li>
                    <li className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded">
                      <FiFolder /> Users
                    </li>
                    <li className="flex items-center gap-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded">
                      <FiFolder /> Trash
                    </li>
                  </ul>
                </div>
                {/* Main content */}
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex items-center mb-3">
                    <FiSearch className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search notebooks..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={notebookSearch}
                      onChange={e => setNotebookSearch(e.target.value)}
                    />
                  </div>
                  <div className="overflow-y-auto flex-1">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                          <th className="text-left py-1 font-medium">Name</th>
                          <th className="text-left py-1 font-medium">Last Modified</th>
                          <th className="text-left py-1 font-medium">Owner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {NOTEBOOK_EXAMPLES.filter(nb =>
                          nb.name.toLowerCase().includes(notebookSearch.toLowerCase())
                        ).map(nb => (
                          <tr
                            key={nb.path}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer transition"
                            onClick={() => {
                              setTasks(tasks => tasks.map(t => t.id === selectedTask.id ? { ...t, path: nb.path } : t));
                              setShowNotebookExplorer(false);
                            }}
                          >
                            <td className="py-2 flex items-center">
                              <FiBook className="mr-2 text-blue-500" />
                              <span className="truncate">{nb.name}</span>
                            </td>
                            <td className="py-2">{nb.lastModified}</td>
                            <td className="py-2">{nb.owner}</td>
                          </tr>
                        ))}
                        {NOTEBOOK_EXAMPLES.filter(nb =>
                          nb.name.toLowerCase().includes(notebookSearch.toLowerCase())
                        ).length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-gray-400">
                              No notebooks found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex justify-end">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                  onClick={() => setShowNotebookExplorer(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Git Form Modal */}
        {showGitForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-1/3 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold dark:text-white">Add a git reference</h3>
                <button onClick={() => setShowGitForm(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Git repository URL*
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="https://github.com/user/repo.git"
                    value={gitRepoUrl}
                    onChange={e => setGitRepoUrl(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Git provider*
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={gitProvider}
                    onChange={e => setGitProvider(e.target.value)}
                  >
                    <option value="">Select provider</option>
                    <option value="github">GitHub</option>
                    <option value="gitlab">GitLab</option>
                    <option value="azure">Azure DevOps Services</option>
                    <option value="aws">AWS CodeCommit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                    Git reference (branch / tag / commit)*
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <button
                      className={`px-3 py-1 rounded ${gitReferenceType === 'branch' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700'}`}
                      onClick={() => setGitReferenceType('branch')}
                    >
                      Branch
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${gitReferenceType === 'tag' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700'}`}
                      onClick={() => setGitReferenceType('tag')}
                    >
                      Tag
                    </button>
                    <button
                      className={`px-3 py-1 rounded ${gitReferenceType === 'commit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-700'}`}
                      onClick={() => setGitReferenceType('commit')}
                    >
                      Commit
                    </button>
                  </div>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={gitReferenceType === 'branch' ? 'main, release-1.1' :
                      gitReferenceType === 'tag' ? 'v1.0.0, release-2023' :
                        'a0b1c2d3...'}
                    value={gitReferenceValue}
                    onChange={e => setGitReferenceValue(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                  onClick={() => setShowGitForm(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  onClick={() => {
                    setTasks(tasks => tasks.map(t =>
                      t.id === selectedTask.id
                        ? {
                          ...t,
                          gitInfo: {
                            url: gitRepoUrl,
                            provider: gitProvider,
                            referenceType: gitReferenceType,
                            referenceValue: gitReferenceValue
                          }
                        }
                        : t
                    ));
                    setShowGitForm(false);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold dark:text-white">Workflows &gt; Jobs &gt;</h1>
            <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">{jobName}</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-gray-700" />}
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
              Create Job
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex gap-0">
          {/* Left column - Job details panel */}
          {jobDetailsPanelExpanded && (
            <div className="w-80 flex-shrink-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="p-5">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Job details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      Job ID
                    </label>
                    <div className="text-sm dark:text-gray-400">320533988096536</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      Creator
                    </label>
                    <div className="text-sm dark:text-gray-400">selfabdaoui8@gmail.com</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      Run as
                    </label>
                    <div className="text-sm dark:text-gray-400">selfabdaoui8@gmail.com</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      Tags
                    </label>
                    <button className="text-blue-600 text-sm dark:text-blue-400">Add tag</button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      Description
                    </label>
                    <button className="text-blue-600 text-sm dark:text-blue-400">Add description</button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                      Lineage
                    </label>
                    <div className="text-sm dark:text-gray-400">No lineage information for this job.</div>
                  </div>
                </div>
              </div>
              <div className="p-5 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Schedules & Triggers</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">None</div>
                <button className="text-blue-600 text-sm dark:text-blue-400">Add trigger</button>
              </div>
              <div className="p-5 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Job parameters</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  No job parameters are defined for this job
                </div>
                <button className="text-blue-600 text-sm dark:text-blue-400">Edit parameters</button>
              </div>
            </div>
          )}
          {/* Job details panel toggle */}
          <button
            onClick={() => setJobDetailsPanelExpanded(!jobDetailsPanelExpanded)}
            className={`h-8 w-6 flex items-center justify-center self-center rounded ${jobDetailsPanelExpanded ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            {jobDetailsPanelExpanded ? <FiChevronLeft className="text-gray-600 dark:text-gray-300" /> : <FiChevronRight className="text-gray-600 dark:text-gray-300" />}
          </button>
          {/* Main content area */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-gray-900' : ''}`}>
            {/* Workflow header */}
            <div className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 px-5 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold dark:text-white">Workflow</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={fitToView}
                  className="p-2 bg-white text-gray-600 rounded-md hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  title="Fit to view"
                >
                  <FiSettings size={20} />
                </button>
                <button
                  onClick={zoomIn}
                  className="p-2 bg-white text-gray-600 rounded-md hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  title="Zoom in"
                >
                  <FiPlus size={20} />
                </button>
                <button
                  onClick={zoomOut}
                  className="p-2 bg-white text-gray-600 rounded-md hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  title="Zoom out"
                >
                  <FiMinus size={20} />
                </button>
                <button
                  onClick={toggleFullScreen}
                  className="p-2 bg-white text-gray-600 rounded-md hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  title={isFullScreen ? "Exit full screen" : "Full screen"}
                >
                  {isFullScreen ? <FiMinimize2 size={20} /> : <FiMaximize2 size={20} />}
                </button>
              </div>
            </div>
            {/* Workflow canvas area */}
            <div
              ref={workflowRef}
              className={`flex-1 relative border border-dashed border-gray-300 bg-gray-50 overflow-hidden dark:border-gray-600 dark:bg-gray-900 transition-all duration-300 ${isFullScreen ? 'h-[calc(100vh-80px)]' : ''}`}
              onMouseDown={startDragging}
              onMouseMove={e => {
                handleDragging(e);
                handleTaskDrag(e);
                handleConnectorDrag(e);
              }}
              onMouseUp={e => {
                stopDragging();
                stopTaskDrag();
                completeConnector(e);
              }}
              onMouseLeave={() => {
                stopDragging();
                stopTaskDrag();
                setDraggingConnector(null);
                setTempConnector(null);
              }}
              // Remove addNewTask on click on empty grid
              style={{
                cursor: isDragging
                  ? 'grabbing'
                  : draggedTask
                  ? 'move'
                  : draggingConnector
                  ? 'crosshair'
                  : 'grab',
                height: `calc(100% - ${taskDetailsPanelExpanded ? taskDetailsHeight : 0}px)`
              }}
            >
              {/* Canvas wrapper with unified transform */}
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'top left'
                }}
              >
                {/* Background grid */}
                <div
                  className="absolute"
                  style={{
                    left: -2000,
                    top: -2000,
                    width: 4000,
                    height: 4000,
                    backgroundSize: "20px 20px",
                    backgroundImage: darkMode
                      ? 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
                      : 'linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
                    pointerEvents: 'none'
                  }}
                />
                {/* Connectors */}
                {renderConnectors()}
                {/* Temporary connector during drag */}
                {renderTempConnector()}
                {/* Task nodes */}
                {renderTaskNodes()}
                {/* Add task button */}
                <button
                  onClick={() => addNewTask(80, 80)}
                  className="absolute flex items-center justify-center w-12 h-12 bg-white border-2 border-dashed border-gray-400 rounded-full hover:bg-blue-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 shadow-lg"
                  style={{
                    left: 80,
                    top: 80,
                    zIndex: 100
                  }}
                  title="Add new task"
                >
                  <span className="text-3xl text-blue-500 dark:text-blue-400">+</span>
                </button>
              </div>
              {/* Zoom level indicator */}
              <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300 shadow">
                {Math.round(zoomLevel * 100)}%
              </div>
            </div>
            {/* Resizable separator */}
            <div
              ref={resizeRef}
              className="relative h-2 bg-gray-200 cursor-row-resize flex items-center justify-center dark:bg-gray-700"
              onMouseDown={() => setIsResizing(true)}
            >
              <button
                className="absolute text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setTaskDetailsPanelExpanded(!taskDetailsPanelExpanded)}
              >
                {taskDetailsPanelExpanded ? <FiChevronDown size={18} /> : <FiChevronUp size={18} />}
              </button>
              <div className="w-8 h-1 bg-gray-400 rounded dark:bg-gray-500"></div>
            </div>
            {/* Task details panel */}
            <div
              className="bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-auto"
              style={{
                height: taskDetailsPanelExpanded ? `${taskDetailsHeight}px` : '0',
                display: taskDetailsPanelExpanded ? 'block' : 'none'
              }}
            >
              <div className="p-5">
                <h2 className="text-lg font-semibold mb-4 dark:text-white">Task details</h2>
                {selectedTask ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                        Task name*
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter task name"
                        value={selectedTask.name}
                        onChange={e =>
                          setTasks(tasks =>
                            tasks.map(t =>
                              t.id === selectedTask.id ? { ...t, name: e.target.value } : t
                            )
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                        Type*
                      </label>
                      {renderTaskTypeButtons()}
                    </div>
                    {/* Section dynamique selon le type de tâche */}
                    {renderTaskTypeSection()}
                    {/* Section commune à tous les types de tâches */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-md font-semibold mb-3 dark:text-white">Notifications</h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No notifications
                        </span>
                        <button className="ml-2 text-blue-600 text-sm dark:text-blue-400">
                          + Add
                        </button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-md font-semibold mb-3 dark:text-white">Retries</h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Retry at most
                        </span>
                        <select className="ml-2 px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <option>No retries</option>
                          <option>1 time</option>
                          <option>2 times</option>
                          <option>3 times</option>
                        </select>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          and wait
                        </span>
                        <input
                          type="number"
                          className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          defaultValue={15}
                        />
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          mins between retries
                        </span>
                      </div>
                      <div className="mt-2 flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                        />
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                          Retry on timeout
                        </label>
                      </div>
                      <div className="mt-2 flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          defaultChecked
                        />
                        <label className="text-sm text-gray-700 dark:text-gray-300">
                          Enable serverless auto-optimization
                        </label>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-md font-semibold mb-3 dark:text-white">Metric thresholds</h3>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No metric thresholds
                        </span>
                        <button className="ml-2 text-blue-600 text-sm dark:text-blue-400">
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    Select a task to view details
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Bottom section - Advanced settings */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Advanced settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 dark:text-white">Job notifications</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">No notifications</div>
              <button className="text-blue-600 text-sm dark:text-blue-400">Edit notifications</button>
              <div className="mt-4">
                <h3 className="font-medium mb-2 dark:text-white">Duration and streaming backlog thresholds</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">No thresholds defined</div>
                <button className="text-blue-600 text-sm dark:text-blue-400">Add metric thresholds</button>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2 dark:text-white">Permissions</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-sm dark:text-white">ssfabdcloud5@gmail.com</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Is Owner</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm dark:text-white">adminis</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Can Manage</div>
                </div>
              </div>
              <button className="text-blue-600 text-sm dark:text-blue-400 mt-2">Edit permissions</button>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white">
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
              Create task
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobCreationPage;
