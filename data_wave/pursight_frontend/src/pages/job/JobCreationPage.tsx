// // src/pages/JobCreationPage.tsx
// import React, { useState, useRef } from 'react';

// // Types
// type TaskType = 'Notebook' | 'JAR' | 'Python' | 'Spark' | 'SQL';
// type ComputeType = 'Serverless' | 'Autoscaling' | 'Fixed';
// type NotificationType = 'Email' | 'Slack' | 'Webhook';
// type PermissionLevel = 'Owner' | 'Can Manage' | 'Can Edit' | 'Can View';

// interface Task {
//   id: string;
//   name: string;
//   type: TaskType;
//   path: string;
//   compute: ComputeType;
//   position: { x: number; y: number };
// }

// interface JobParameter {
//   key: string;
//   value: string;
// }

// interface Permission {
//   email: string;
//   level: PermissionLevel;
// }

// interface NotificationRule {
//   type: NotificationType;
//   target: string;
//   onSuccess: boolean;
//   onFailure: boolean;
//   onStart: boolean;
// }

// // Simple ID generator
// const generateId = () => {
//   return 'id-' + Math.random().toString(36).substr(2, 9);
// };

// const JobCreationPage = () => {
//   // Job metadata
//   const [jobName, setJobName] = useState<string>('Untitled Job');
//   const [jobDescription, setJobDescription] = useState<string>('');
  
//   // Tasks state
//   const [tasks, setTasks] = useState<Task[]>([
//     {
//       id: generateId(),
//       name: 'Unnamed task',
//       type: 'Notebook',
//       path: '/path/to/notebook',
//       compute: 'Serverless',
//       position: { x: 50, y: 100 }
//     }
//   ]);
//   const [selectedTask, setSelectedTask] = useState<string | null>(tasks[0].id);
  
//   // Workflow view state
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [offset, setOffset] = useState({ x: 0, y: 0 });
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const workflowRef = useRef<HTMLDivElement>(null);
  
//   // Parameters
//   const [parameters, setParameters] = useState<JobParameter[]>([
//     { key: 'input_path', value: '/data/input' },
//     { key: 'output_path', value: '/data/output' }
//   ]);
  
//   // Notifications
//   const [notifications, setNotifications] = useState<NotificationRule[]>([]);
  
//   // Permissions
//   const [permissions, setPermissions] = useState<Permission[]>([
//     { email: 'setbacksou58@gmail.com', level: 'Owner' }
//   ]);
  
//   // Notification settings
//   const [retryPolicy, setRetryPolicy] = useState({
//     immediateRetry: true,
//     maxAttempts: 4
//   });

//   // Add a new task
//   const addNewTask = () => {
//     const newTask: Task = {
//       id: generateId(),
//       name: 'New task',
//       type: 'Notebook',
//       path: '/path/to/notebook',
//       compute: 'Serverless',
//       position: { 
//         x: tasks.length > 0 ? tasks[tasks.length - 1].position.x + 200 : 50,
//         y: 100
//       }
//     };
    
//     setTasks([...tasks, newTask]);
//     setSelectedTask(newTask.id);
//   };

//   // Update task properties
//   const updateTask = (id: string, field: keyof Task, value: any) => {
//     setTasks(tasks.map(task => 
//       task.id === id ? { ...task, [field]: value } : task
//     ));
//   };

//   // Add a new parameter
//   const addParameter = () => {
//     setParameters([...parameters, { key: '', value: '' }]);
//   };

//   // Update parameter
//   const updateParameter = (index: number, field: keyof JobParameter, value: string) => {
//     const newParams = [...parameters];
//     newParams[index][field] = value;
//     setParameters(newParams);
//   };

//   // Handle workflow panning
//   const startDragging = (e: React.MouseEvent) => {
//     if (e.button !== 0) return; // Only left mouse button
//     setIsDragging(true);
//     setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
//   };

//   const handleDragging = (e: React.MouseEvent) => {
//     if (!isDragging) return;
//     const newOffset = {
//       x: e.clientX - dragStart.x,
//       y: e.clientY - dragStart.y
//     };
//     setOffset(newOffset);
//   };

//   const stopDragging = () => {
//     setIsDragging(false);
//   };

//   // Zoom controls
//   const zoomIn = () => {
//     setZoomLevel(prev => Math.min(prev + 0.1, 2));
//   };

//   const zoomOut = () => {
//     setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
//   };

//   const fitToView = () => {
//     setZoomLevel(1);
//     setOffset({ x: 0, y: 0 });
//   };

//   // Render task nodes with connections
//   const renderTaskNodes = () => {
//     return tasks.map((task, index) => (
//       <React.Fragment key={task.id}>
//         {/* Connection line */}
//         {index > 0 && (
//           <svg className="absolute" style={{ 
//             left: tasks[index-1].position.x + 120, 
//             top: tasks[index-1].position.y + 30,
//             width: task.position.x - tasks[index-1].position.x - 120,
//             height: 2
//           }}>
//             <line 
//               x1="0" y1="1" 
//               x2={task.position.x - tasks[index-1].position.x - 120} y2="1" 
//               stroke="#6b7280" 
//               strokeWidth="2" 
//               strokeDasharray="5,5"
//             />
//             <polygon 
//               points="0,1 8,6 8,-4" 
//               fill="#6b7280" 
//               transform={`translate(${task.position.x - tasks[index-1].position.x - 120}, 1)`}
//             />
//           </svg>
//         )}
        
//         {/* Task node */}
//         <div
//           className={`absolute border rounded-lg p-4 w-48 cursor-pointer transition-all ${
//             selectedTask === task.id 
//               ? 'bg-blue-50 border-blue-500 shadow-md' 
//               : 'bg-white border-gray-300 hover:border-blue-300'
//           }`}
//           style={{ 
//             left: task.position.x, 
//             top: task.position.y,
//             transform: `scale(${zoomLevel})`,
//             transformOrigin: 'top left'
//           }}
//           onClick={() => setSelectedTask(task.id)}
//         >
//           <div className="font-medium truncate">{task.name}</div>
//           <div className="text-sm text-gray-500 truncate mt-1">{task.path}</div>
//           <div className="mt-2 flex items-center">
//             <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
//             <span className="text-xs text-gray-500">{task.type}</span>
//           </div>
//         </div>
//       </React.Fragment>
//     ));
//   };

//   // Get selected task details
//   const currentTask = tasks.find(t => t.id === selectedTask) || tasks[0];

//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-900">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200 px-6 py-4">
//         <div className="flex justify-between items-center">
//           <h1 className="text-xl font-semibold">New Job - {new Date().toLocaleDateString('en-US', { 
//             month: 'short', 
//             day: 'numeric', 
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//           })}</h1>
//           <div className="flex space-x-2">
//             <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
//               Cancel
//             </button>
//             <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
//               Create Job
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="p-6 max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left column - Job settings */}
//           <div className="lg:col-span-1 space-y-6">
//             {/* Job name */}
//             <div className="bg-white rounded-lg border border-gray-200 p-5">
//               <h2 className="text-lg font-semibold mb-4">Name</h2>
//               <input
//                 type="text"
//                 value={jobName}
//                 onChange={(e) => setJobName(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter job name"
//               />
//             </div>

//             {/* Task list */}
//             <div className="bg-white rounded-lg border border-gray-200 p-5">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-semibold">Tasks</h2>
//                 <button 
//                   onClick={addNewTask}
//                   className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
//                 >
//                   + Add Task
//                 </button>
//               </div>
              
//               <div className="space-y-2 max-h-60 overflow-y-auto">
//                 {tasks.map((task) => (
//                   <div 
//                     key={task.id}
//                     className={`p-3 rounded-md cursor-pointer ${
//                       selectedTask === task.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
//                     }`}
//                     onClick={() => setSelectedTask(task.id)}
//                   >
//                     <div className="font-medium">{task.name}</div>
//                     <div className="text-sm text-gray-500 truncate">{task.path}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Parameters */}
//             <div className="bg-white rounded-lg border border-gray-200 p-5">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-semibold">Parameters</h2>
//                 <button 
//                   onClick={addParameter}
//                   className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200"
//                 >
//                   + Add
//                 </button>
//               </div>
              
//               <div className="space-y-3">
//                 {parameters.map((param, index) => (
//                   <div key={index} className="flex space-x-2">
//                     <input
//                       type="text"
//                       value={param.key}
//                       onChange={(e) => updateParameter(index, 'key', e.target.value)}
//                       placeholder="Key"
//                       className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
//                     />
//                     <input
//                       type="text"
//                       value={param.value}
//                       onChange={(e) => updateParameter(index, 'value', e.target.value)}
//                       placeholder="Value"
//                       className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Center column - Enhanced Task visualization */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg border border-gray-200 p-5 h-full">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-semibold">Workflow</h2>
//                 <div className="flex space-x-2">
//                   <div className="relative">
//                     <input
//                       type="text"
//                       placeholder="Find tasks"
//                       className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                   <button 
//                     onClick={fitToView}
//                     className="p-1 text-gray-600 hover:bg-gray-100 rounded"
//                     title="Fit to viewport"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
//                     </svg>
//                   </button>
//                   <button 
//                     onClick={zoomIn}
//                     className="p-1 text-gray-600 hover:bg-gray-100 rounded"
//                     title="Zoom in"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
//                     </svg>
//                   </button>
//                   <button 
//                     onClick={zoomOut}
//                     className="p-1 text-gray-600 hover:bg-gray-100 rounded"
//                     title="Zoom out"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
              
//               <div 
//                 ref={workflowRef}
//                 className="relative h-96 border border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden"
//                 onMouseDown={startDragging}
//                 onMouseMove={handleDragging}
//                 onMouseUp={stopDragging}
//                 onMouseLeave={stopDragging}
//                 style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
//               >
//                 {/* Background grid */}
//                 <div 
//                   className="absolute inset-0 bg-grid bg-repeat"
//                   style={{ 
//                     backgroundSize: '20px 20px',
//                     backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
//                     transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomLevel})`,
//                     transformOrigin: 'top left'
//                   }}
//                 />
                
//                 {/* Task nodes */}
//                 {renderTaskNodes()}
                
//                 {/* Add task button at end */}
//                 {tasks.length > 0 && (
//                   <button
//                     onClick={addNewTask}
//                     className="absolute flex items-center justify-center w-10 h-10 bg-white border-2 border-dashed border-gray-400 rounded-full hover:bg-gray-100"
//                     style={{ 
//                       left: tasks[tasks.length - 1].position.x + 200, 
//                       top: tasks[tasks.length - 1].position.y + 20,
//                       transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomLevel})`,
//                       transformOrigin: 'top left'
//                     }}
//                   >
//                     <span className="text-2xl text-gray-500">+</span>
//                   </button>
//                 )}
                
//                 {/* Zoom level indicator */}
//                 <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-gray-600">
//                   {Math.round(zoomLevel * 100)}%
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Task details section */}
//         {currentTask && (
//           <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
//             <h2 className="text-lg font-semibold mb-4">Task Details</h2>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Task name*
//                   </label>
//                   <input
//                     type="text"
//                     value={currentTask.name}
//                     onChange={(e) => updateTask(currentTask.id, 'name', e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
                
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Type*
//                   </label>
//                   <select
//                     value={currentTask.type}
//                     onChange={(e) => updateTask(currentTask.id, 'type', e.target.value as TaskType)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="Notebook">Notebook</option>
//                     <option value="JAR">JAR</option>
//                     <option value="Python">Python</option>
//                     <option value="Spark">Spark</option>
//                     <option value="SQL">SQL</option>
//                   </select>
//                 </div>
                
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Source*
//                   </label>
//                   <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
//                     <option>Workspace</option>
//                     <option>Git</option>
//                     <option>DBFS</option>
//                   </select>
//                 </div>
//               </div>
              
//               <div>
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Path*
//                   </label>
//                   <div className="flex">
//                     <input
//                       type="text"
//                       value={currentTask.path}
//                       onChange={(e) => updateTask(currentTask.id, 'path', e.target.value)}
//                       className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                     <button className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200">
//                       Browse
//                     </button>
//                   </div>
//                 </div>
                
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Compute
//                   </label>
//                   <div className="space-y-2">
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         name="compute"
//                         checked={currentTask.compute === 'Serverless'}
//                         onChange={() => updateTask(currentTask.id, 'compute', 'Serverless')}
//                         className="mr-2"
//                       />
//                       Serverless
//                     </label>
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         name="compute"
//                         checked={currentTask.compute === 'Autoscaling'}
//                         onChange={() => updateTask(currentTask.id, 'compute', 'Autoscaling')}
//                         className="mr-2"
//                       />
//                       Autoscaling
//                     </label>
//                     <label className="flex items-center">
//                       <input
//                         type="radio"
//                         name="compute"
//                         checked={currentTask.compute === 'Fixed'}
//                         onChange={() => updateTask(currentTask.id, 'compute', 'Fixed')}
//                         className="mr-2"
//                       />
//                       Fixed size
//                     </label>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Additional sections */}
//         <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Notifications */}
//           <div className="bg-white rounded-lg border border-gray-200 p-5">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold">Notifications</h2>
//               <button className="text-blue-600 text-sm">Edit notifications</button>
//             </div>
            
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Retry Policy
//               </label>
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={retryPolicy.immediateRetry}
//                   onChange={(e) => setRetryPolicy({...retryPolicy, immediateRetry: e.target.checked})}
//                   className="mr-2"
//                 />
//                 <span>Immediately, at most 3x (4 total attempts)</span>
//               </div>
//             </div>
            
//             <div>
//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="font-medium">Metric thresholds</h3>
//                 <button className="text-blue-600 text-sm">+ Add</button>
//               </div>
//               <div className="text-gray-500 text-sm">No thresholds defined</div>
//             </div>
//           </div>

//           {/* Permissions */}
//           <div className="bg-white rounded-lg border border-gray-200 p-5">
//             <h2 className="text-lg font-semibold mb-4">Permissions</h2>
            
//             <div className="space-y-3">
//               {permissions.map((perm, index) => (
//                 <div key={index} className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       checked={true}
//                       onChange={() => {}}
//                       className="mr-3"
//                     />
//                     <span>{perm.email}</span>
//                   </div>
//                   <select
//                     value={perm.level}
//                     onChange={(e) => {
//                       const newPerms = [...permissions];
//                       newPerms[index].level = e.target.value as PermissionLevel;
//                       setPermissions(newPerms);
//                     }}
//                     className="border border-gray-300 rounded px-2 py-1 text-sm"
//                   >
//                     <option value="Owner">Owner</option>
//                     <option value="Can Manage">Can Manage</option>
//                     <option value="Can Edit">Can Edit</option>
//                     <option value="Can View">Can View</option>
//                   </select>
//                 </div>
//               ))}
              
//               <button className="mt-3 text-blue-600 text-sm flex items-center">
//                 + Add permission
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Advanced settings */}
//         <div className="mt-6 bg-white rounded-lg border border-gray-200 p-5">
//           <h2 className="text-lg font-semibold mb-4">Advanced settings</h2>
//           <div className="text-gray-500">No advanced settings configured</div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default JobCreationPage;














// // src/pages/JobCreationPage.tsx
// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   FiPlus, 
//   FiMinus, 
//   FiCopy, 
//   FiPlay, 
//   FiRefreshCw, 
//   FiTrash2,
//   FiMoon,
//   FiSun,
//   FiSettings,
//   FiChevronLeft,
//   FiChevronRight
// } from 'react-icons/fi';

// // Types
// type TaskType = 'Pipeline' | 'Notebook' | 'JAR' | 'Python' | 'Spark' | 'SQL';
// type ComputeType = 'Serverless' | 'Autoscaling' | 'Fixed';

// interface Task {
//   id: string;
//   name: string;
//   type: TaskType;
//   path: string;
//   compute: ComputeType;
//   position: { x: number; y: number };
//   dependsOn?: string[];
//   outputs?: string[];
// }

// interface Connector {
//   id: string;
//   source: string;
//   target: string;
//   points: { x: number; y: number }[];
// }

// const JobCreationPage = () => {
//   const [darkMode, setDarkMode] = useState(true);
//   // Job metadata
//   const [jobName, setJobName] = useState<string>('Bakehouse Orchestration');
  
//   // Tasks state
//   const [tasks, setTasks] = useState<Task[]>([
//     {
//       id: 'task-1',
//       name: 'Inputs-pipeline',
//       type: 'Pipeline',
//       path: 'Hostile: Bakehouse_ETL',
//       compute: 'Serverless',
//       position: { x: 100, y: 100 },
//       outputs: ['task-2', 'task-4']
//     },
//     {
//       id: 'task-2',
//       name: 'DRX_with_SOL',
//       type: 'Pipeline',
//       path: 'Bakehouse: Flagship AI (K: front_workflow.java)',
//       compute: 'Serverless',
//       position: { x: 400, y: 100 },
//       dependsOn: ['task-1'],
//       outputs: ['task-3']
//     },
//     {
//       id: 'task-3',
//       name: 'Update_downstream',
//       type: 'Pipeline',
//       path: '...execution-coupled-site_Overview',
//       compute: 'Serverless',
//       position: { x: 700, y: 100 },
//       dependsOn: ['task-2']
//     },
//     {
//       id: 'task-4',
//       name: 'Email_bar',
//       type: 'Pipeline',
//       path: '"FAST"',
//       compute: 'Serverless',
//       position: { x: 400, y: 300 },
//       dependsOn: ['task-1']
//     }
//   ]);
  
//   // Connectors between tasks
//   const [connectors, setConnectors] = useState<Connector[]>([]);
  
//   const [selectedTask, setSelectedTask] = useState<string | null>(tasks[0].id);
//   const [draggingConnector, setDraggingConnector] = useState<string | null>(null);
//   const [tempConnector, setTempConnector] = useState<{source: string, x: number, y: number} | null>(null);
  
//   // Workflow view state
//   const [zoomLevel, setZoomLevel] = useState(1);
//   const [offset, setOffset] = useState({ x: 0, y: 0 });
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const [isPanelExpanded, setIsPanelExpanded] = useState(true);
//   const [draggedTask, setDraggedTask] = useState<string | null>(null);
//   const [dragTaskStart, setDragTaskStart] = useState({ x: 0, y: 0 });
  
//   const workflowRef = useRef<HTMLDivElement>(null);
  
//   // Parameters
//   const [parameters, setParameters] = useState([
//     { key: 'input_path', value: '/data/input' },
//     { key: 'output_path', value: '/data/output' }
//   ]);
  
//   // Initialize connectors based on dependencies
//   useEffect(() => {
//     const newConnectors: Connector[] = [];
    
//     tasks.forEach(task => {
//       // Handle outputs (source connectors)
//       if (task.outputs) {
//         task.outputs.forEach(targetId => {
//           const targetTask = tasks.find(t => t.id === targetId);
//           if (targetTask) {
//             newConnectors.push({
//               id: `conn-${task.id}-${targetId}`,
//               source: task.id,
//               target: targetId,
//               points: calculateConnectorPoints(task, targetTask)
//             });
//           }
//         });
//       }
      
//       // Handle dependencies (target connectors)
//       if (task.dependsOn) {
//         task.dependsOn.forEach(sourceId => {
//           const sourceTask = tasks.find(t => t.id === sourceId);
//           if (sourceTask && !sourceTask.outputs?.includes(task.id)) {
//             newConnectors.push({
//               id: `conn-${sourceId}-${task.id}`,
//               source: sourceId,
//               target: task.id,
//               points: calculateConnectorPoints(sourceTask, task)
//             });
//           }
//         });
//       }
//     });
    
//     setConnectors(newConnectors);
//   }, [tasks]);

//   // Calculate connector points with smooth curves
//   const calculateConnectorPoints = (source: Task, target: Task) => {
//     const sourceX = source.position.x + 192;
//     const sourceY = source.position.y + 40;
//     const targetX = target.position.x;
//     const targetY = target.position.y + 40;
    
//     // Calculate midpoints with curve
//     const midX = sourceX + (targetX - sourceX) * 0.5;
//     const curveIntensity = Math.min(100, Math.abs(targetY - sourceY) * 0.3);
    
//     return [
//       { x: sourceX, y: sourceY },
//       { x: midX - curveIntensity, y: sourceY },
//       { x: midX + curveIntensity, y: targetY },
//       { x: targetX, y: targetY }
//     ];
//   };

//   // Add a new task
//   const addNewTask = (x: number, y: number) => {
//     const newTask: Task = {
//       id: `task-${Date.now()}`,
//       name: 'New task',
//       type: 'Pipeline',
//       path: '/path/to/task',
//       compute: 'Serverless',
//       position: { 
//         x: x - offset.x, 
//         y: y - offset.y
//       }
//     };
    
//     setTasks([...tasks, newTask]);
//     setSelectedTask(newTask.id);
//   };

//   // Update task properties
//   const updateTask = (id: string, field: keyof Task, value: any) => {
//     setTasks(tasks.map(task => 
//       task.id === id ? { ...task, [field]: value } : task
//     ));
//   };

//   // Add dependency between tasks
//   const addDependency = (sourceId: string, targetId: string) => {
//     setTasks(tasks.map(task => {
//       if (task.id === sourceId) {
//         const outputs = task.outputs ? [...task.outputs, targetId] : [targetId];
//         return { ...task, outputs };
//       }
//       return task;
//     }));
//   };

//   // Remove dependency
//   const removeDependency = (sourceId: string, targetId: string) => {
//     setTasks(tasks.map(task => {
//       if (task.id === sourceId && task.outputs) {
//         const outputs = task.outputs.filter(id => id !== targetId);
//         return { ...task, outputs: outputs.length > 0 ? outputs : undefined };
//       }
//       if (task.id === targetId && task.dependsOn) {
//         const dependsOn = task.dependsOn.filter(id => id !== sourceId);
//         return { ...task, dependsOn: dependsOn.length > 0 ? dependsOn : undefined };
//       }
//       return task;
//     }));
//   };

//   // Start creating a connector
//   const startConnector = (taskId: string, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setDraggingConnector(taskId);
    
//     const task = tasks.find(t => t.id === taskId);
//     if (task) {
//       setTempConnector({
//         source: taskId,
//         x: task.position.x + 192,
//         y: task.position.y + 40
//       });
//     }
//   };

//   // Handle connector dragging
//   const handleConnectorDrag = (e: React.MouseEvent) => {
//     if (draggingConnector && tempConnector) {
//       const rect = workflowRef.current?.getBoundingClientRect();
//       if (!rect) return;
      
//       setTempConnector({
//         ...tempConnector,
//         x: (e.clientX - rect.left - offset.x) / zoomLevel,
//         y: (e.clientY - rect.top - offset.y) / zoomLevel
//       });
//     }
//   };

//   // Complete connector creation
//   const completeConnector = (e: React.MouseEvent) => {
//     if (!draggingConnector || !tempConnector) return;
    
//     const rect = workflowRef.current?.getBoundingClientRect();
//     if (!rect) return;
    
//     const x = (e.clientX - rect.left - offset.x) / zoomLevel;
//     const y = (e.clientY - rect.top - offset.y) / zoomLevel;
    
//     // Find task under cursor
//     const targetTask = tasks.find(task => {
//       const taskX = task.position.x;
//       const taskY = task.position.y;
//       return x >= taskX && x <= taskX + 192 && 
//              y >= taskY && y <= taskY + 80;
//     });
    
//     if (targetTask && targetTask.id !== draggingConnector) {
//       addDependency(draggingConnector, targetTask.id);
//     }
    
//     setDraggingConnector(null);
//     setTempConnector(null);
//   };

//   // Handle workflow panning
//   const startDragging = (e: React.MouseEvent) => {
//     if (e.button !== 0 || draggingConnector) return;
//     setIsDragging(true);
//     setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
//   };

//   const handleDragging = (e: React.MouseEvent) => {
//     if (isDragging) {
//       const newOffset = {
//         x: e.clientX - dragStart.x,
//         y: e.clientY - dragStart.y
//       };
//       setOffset(newOffset);
//     }
//   };

//   const stopDragging = () => {
//     setIsDragging(false);
//   };

//   // Handle task dragging
//   const startTaskDrag = (taskId: string, e: React.MouseEvent) => {
//     e.stopPropagation();
//     setDraggedTask(taskId);
//     const task = tasks.find(t => t.id === taskId);
//     if (task) {
//       setDragTaskStart({
//         x: e.clientX - task.position.x,
//         y: e.clientY - task.position.y
//       });
//     }
//   };

//   const handleTaskDrag = (e: React.MouseEvent) => {
//     if (draggedTask) {
//       setTasks(tasks.map(task => {
//         if (task.id === draggedTask) {
//           return {
//             ...task,
//             position: {
//               x: e.clientX - dragTaskStart.x,
//               y: e.clientY - dragTaskStart.y
//             }
//           };
//         }
//         return task;
//       }));
//     }
//   };

//   const stopTaskDrag = () => {
//     setDraggedTask(null);
//   };

//   // Zoom controls
//   const zoomIn = () => {
//     setZoomLevel(prev => Math.min(prev + 0.1, 2));
//   };

//   const zoomOut = () => {
//     setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
//   };

//   const fitToView = () => {
//     setZoomLevel(1);
//     setOffset({ x: 0, y: 0 });
//   };

//   // Task actions
//   const cloneTask = (taskId: string) => {
//     const task = tasks.find(t => t.id === taskId);
//     if (task) {
//       const newTask = {
//         ...task,
//         id: `task-${Date.now()}`,
//         position: { x: task.position.x + 50, y: task.position.y + 50 }
//       };
//       setTasks([...tasks, newTask]);
//       setSelectedTask(newTask.id);
//     }
//   };

//   const runTask = (taskId: string) => {
//     console.log(`Running task: ${taskId}`);
//   };

//   const resetTask = (taskId: string) => {
//     console.log(`Resetting task: ${taskId}`);
//   };

//   const deleteTask = (taskId: string) => {
//     if (tasks.length <= 1) return;
    
//     setTasks(tasks.filter(t => t.id !== taskId));
    
//     // Remove any dependencies related to this task
//     setTasks(tasks.map(task => {
//       if (task.outputs?.includes(taskId)) {
//         const outputs = task.outputs.filter(id => id !== taskId);
//         return { ...task, outputs: outputs.length > 0 ? outputs : undefined };
//       }
//       if (task.dependsOn?.includes(taskId)) {
//         const dependsOn = task.dependsOn.filter(id => id !== taskId);
//         return { ...task, dependsOn: dependsOn.length > 0 ? dependsOn : undefined };
//       }
//       return task;
//     }));
    
//     // Select a different task if we deleted the selected one
//     if (selectedTask === taskId) {
//       setSelectedTask(tasks.find(t => t.id !== taskId)?.id || null);
//     }
//   };

//   // Render task nodes
//   const renderTaskNodes = () => {
//     return tasks.map((task) => (
//       <div
//         key={task.id}
//         className={`absolute border rounded-lg p-4 w-48 cursor-move transition-all ${
//           selectedTask === task.id 
//             ? 'bg-blue-50 border-blue-500 shadow-md dark:bg-blue-900 dark:border-blue-600' 
//             : 'bg-white border-gray-300 hover:border-blue-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-blue-500'
//         }`}
//         style={{ 
//           left: task.position.x, 
//           top: task.position.y,
//           transform: `scale(${zoomLevel})`,
//           transformOrigin: 'top left'
//         }}
//         onClick={() => setSelectedTask(task.id)}
//         onMouseDown={(e) => startTaskDrag(task.id, e)}
//       >
//         <div className="flex justify-between items-start mb-2">
//           <div className="w-full">
//             <div className="font-medium truncate dark:text-white">{task.name}</div>
//             <div className="text-sm text-gray-500 truncate dark:text-gray-400">{task.path}</div>
//           </div>
//         </div>
        
//         <div className="mt-2 flex items-center justify-between">
//           <div className="flex items-center">
//             <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
//             <span className="text-xs text-gray-500 dark:text-gray-400">{task.type}</span>
//           </div>
          
//           <div className="flex space-x-1">
//             <button 
//               className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-1"
//               onClick={(e) => { e.stopPropagation(); startConnector(task.id, e); }}
//               title="Add connection"
//             >
//               <FiPlus size={14} />
//             </button>
//           </div>
//         </div>
        
//         {/* Task action bar */}
//         <div className="absolute -bottom-7 left-0 right-0 flex justify-center space-x-2">
//           <button 
//             className="bg-gray-100 text-gray-700 rounded-full p-1 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
//             onClick={(e) => { e.stopPropagation(); cloneTask(task.id); }}
//             title="Clone task"
//           >
//             <FiCopy size={12} />
//           </button>
//           <button 
//             className="bg-gray-100 text-gray-700 rounded-full p-1 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
//             onClick={(e) => { e.stopPropagation(); runTask(task.id); }}
//             title="Run task"
//           >
//             <FiPlay size={12} />
//           </button>
//           <button 
//             className="bg-gray-100 text-gray-700 rounded-full p-1 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
//             onClick={(e) => { e.stopPropagation(); resetTask(task.id); }}
//             title="Reset task"
//           >
//             <FiRefreshCw size={12} />
//           </button>
//           <button 
//             className="bg-gray-100 text-gray-700 rounded-full p-1 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
//             onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
//             title="Delete task"
//           >
//             <FiTrash2 size={12} />
//           </button>
//         </div>
//       </div>
//     ));
//   };

//   // Render connectors between tasks
//   const renderConnectors = () => {
//     return connectors.map(connector => {
//       const sourceTask = tasks.find(t => t.id === connector.source);
//       const targetTask = tasks.find(t => t.id === connector.target);
      
//       if (!sourceTask || !targetTask) return null;
      
//       const points = calculateConnectorPoints(sourceTask, targetTask);
      
//       // Create SVG path with bezier curve
//       const path = `M ${points[0].x} ${points[0].y} 
//                     C ${points[1].x} ${points[1].y}, 
//                       ${points[2].x} ${points[2].y}, 
//                       ${points[3].x} ${points[3].y}`;
      
//       return (
//         <svg 
//           key={connector.id} 
//           className="absolute top-0 left-0 w-full h-full pointer-events-none"
//           style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
//         >
//           <path
//             d={path}
//             fill="none"
//             stroke="#94a3b8"
//             strokeWidth="2"
//             strokeDasharray="5,5"
//           />
//           {/* Arrowhead */}
//           <polygon 
//             points={`${points[3].x},${points[3].y} 
//                      ${points[3].x - 8},${points[3].y - 4}
//                      ${points[3].x - 8},${points[3].y + 4}`} 
//             fill="#94a3b8"
//           />
//         </svg>
//       );
//     });
//   };

//   // Render temporary connector during drag
//   const renderTempConnector = () => {
//     if (!tempConnector) return null;
    
//     const sourceTask = tasks.find(t => t.id === tempConnector.source);
//     if (!sourceTask) return null;
    
//     const startX = sourceTask.position.x + 192;
//     const startY = sourceTask.position.y + 40;
    
//     // Create SVG path with bezier curve
//     const midX = startX + (tempConnector.x - startX) * 0.5;
//     const curveIntensity = Math.min(100, Math.abs(tempConnector.y - startY) * 0.3);
    
//     const points = [
//       { x: startX, y: startY },
//       { x: midX - curveIntensity, y: startY },
//       { x: midX + curveIntensity, y: tempConnector.y },
//       { x: tempConnector.x, y: tempConnector.y }
//     ];
    
//     const path = `M ${points[0].x} ${points[0].y} 
//                   C ${points[1].x} ${points[1].y}, 
//                     ${points[2].x} ${points[2].y}, 
//                     ${points[3].x} ${points[3].y}`;
    
//     return (
//       <svg 
//         className="absolute top-0 left-0 w-full h-full pointer-events-none"
//         style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
//       >
//         <path
//           d={path}
//           fill="none"
//           stroke="#6366f1"
//           strokeWidth="2"
//           strokeDasharray="5,5"
//         />
//         {/* Arrowhead */}
//         <polygon 
//           points={`${points[3].x},${points[3].y} 
//                    ${points[3].x - 8},${points[3].y - 4}
//                    ${points[3].x - 8},${points[3].y + 4}`} 
//           fill="#6366f1"
//         />
//       </svg>
//     );
//   };

//   // Get selected task details
//   const currentTask = tasks.find(t => t.id === selectedTask) || tasks[0];

//   return (
//     <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 px-6 py-4">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-xl font-semibold dark:text-white">Workflows &gt; Jobs &gt;</h1>
//             <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">{jobName}</h2>
//           </div>
//           <div className="flex space-x-2">
//             <button 
//               onClick={() => setDarkMode(!darkMode)}
//               className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//               title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
//             >
//               {darkMode ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-gray-700" />}
//             </button>
//             <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white">
//               Cancel
//             </button>
//             <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
//               Create Job
//             </button>
//           </div>
//         </div>
//       </header>

//       <main className="p-6 max-w-7xl mx-auto">
//         <div className="flex gap-6">
//           {/* Left column - Job settings */}
//           {isPanelExpanded && (
//             <div className="w-80 flex-shrink-0 space-y-6">
//               {/* Job name */}
//               <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5">
//                 <h2 className="text-lg font-semibold mb-4 dark:text-white">Name</h2>
//                 <input
//                   type="text"
//                   value={jobName}
//                   onChange={(e) => setJobName(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                   placeholder="Enter job name"
//                 />
//               </div>

//               {/* Task list */}
//               <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-lg font-semibold dark:text-white">Tasks</h2>
//                   <button 
//                     onClick={() => addNewTask(300, 200)}
//                     className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
//                   >
//                     + Add Task
//                   </button>
//                 </div>
                
//                 <div className="space-y-2 max-h-60 overflow-y-auto">
//                   {tasks.map((task) => (
//                     <div 
//                       key={task.id}
//                       className={`p-3 rounded-md cursor-pointer ${
//                         selectedTask === task.id 
//                           ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900 dark:border-blue-700' 
//                           : 'hover:bg-gray-50 dark:hover:bg-gray-700'
//                       }`}
//                       onClick={() => setSelectedTask(task.id)}
//                     >
//                       <div className="font-medium dark:text-white">{task.name}</div>
//                       <div className="text-sm text-gray-500 truncate dark:text-gray-400">{task.path}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Parameters */}
//               <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-lg font-semibold dark:text-white">Parameters</h2>
//                   <button 
//                     onClick={() => setParameters([...parameters, { key: '', value: '' }])}
//                     className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
//                   >
//                     + Add
//                   </button>
//                 </div>
                
//                 <div className="space-y-3">
//                   {parameters.map((param, index) => (
//                     <div key={index} className="flex space-x-2">
//                       <input
//                         type="text"
//                         value={param.key}
//                         onChange={(e) => {
//                           const newParams = [...parameters];
//                           newParams[index].key = e.target.value;
//                           setParameters(newParams);
//                         }}
//                         placeholder="Key"
//                         className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                       />
//                       <input
//                         type="text"
//                         value={param.value}
//                         onChange={(e) => {
//                           const newParams = [...parameters];
//                           newParams[index].value = e.target.value;
//                           setParameters(newParams);
//                         }}
//                         placeholder="Value"
//                         className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Panel toggle button */}
//           <button
//             onClick={() => setIsPanelExpanded(!isPanelExpanded)}
//             className={`h-8 w-6 flex items-center justify-center self-center rounded ${
//               isPanelExpanded 
//                 ? 'bg-gray-200 dark:bg-gray-700' 
//                 : 'bg-gray-100 dark:bg-gray-800'
//             }`}
//           >
//             {isPanelExpanded ? (
//               <FiChevronLeft className="text-gray-600 dark:text-gray-300" />
//             ) : (
//               <FiChevronRight className="text-gray-600 dark:text-gray-300" />
//             )}
//           </button>

//           {/* Center column - Enhanced Workflow visualization */}
//           <div className="flex-1">
//             <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5 h-full">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-semibold dark:text-white">Workflow</h2>
//                 <div className="flex space-x-2">
//                   <div className="relative">
//                     <input
//                       type="text"
//                       placeholder="Find tasks"
//                       className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                     />
//                   </div>
//                   <button 
//                     onClick={fitToView}
//                     className="p-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700"
//                     title="Fit to viewport"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
//                     </svg>
//                   </button>
//                   <button 
//                     onClick={zoomIn}
//                     className="p-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700"
//                     title="Zoom in"
//                   >
//                     <FiPlus size={20} />
//                   </button>
//                   <button 
//                     onClick={zoomOut}
//                     className="p-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700"
//                     title="Zoom out"
//                   >
//                     <FiMinus size={20} />
//                   </button>
//                   <button 
//                     className="p-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-300 dark:hover:bg-gray-700"
//                     title="Settings"
//                   >
//                     <FiSettings size={20} />
//                   </button>
//                 </div>
//               </div>
              
//               <div 
//                 ref={workflowRef}
//                 className="relative h-[500px] border border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden dark:border-gray-600 dark:bg-gray-900"
//                 onMouseDown={startDragging}
//                 onMouseMove={(e) => {
//                   handleDragging(e);
//                   handleTaskDrag(e);
//                   handleConnectorDrag(e);
//                 }}
//                 onMouseUp={(e) => {
//                   stopDragging();
//                   stopTaskDrag();
//                   completeConnector(e);
//                 }}
//                 onMouseLeave={() => {
//                   stopDragging();
//                   stopTaskDrag();
//                   setDraggingConnector(null);
//                   setTempConnector(null);
//                 }}
//                 onClick={(e) => {
//                   if (!draggingConnector && e.target === e.currentTarget) {
//                     const rect = e.currentTarget.getBoundingClientRect();
//                     addNewTask(e.clientX - rect.left, e.clientY - rect.top);
//                   }
//                 }}
//                 style={{ cursor: isDragging ? 'grabbing' : draggedTask ? 'move' : draggingConnector ? 'crosshair' : 'grab' }}
//               >
//                 {/* Background grid - scales with zoom */}
//                 <div 
//                   className="absolute inset-0 bg-grid bg-repeat"
//                   style={{ 
//                     backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
//                     backgroundImage: darkMode 
//                       ? 'linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
//                       : 'linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
//                     transform: `translate(${offset.x}px, ${offset.y}px)`,
//                     transformOrigin: 'top left'
//                   }}
//                 />
                
//                 {/* Connectors */}
//                 {renderConnectors()}
                
//                 {/* Temporary connector during drag */}
//                 {renderTempConnector()}
                
//                 {/* Task nodes */}
//                 {renderTaskNodes()}
                
//                 {/* Zoom level indicator */}
//                 <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
//                   {Math.round(zoomLevel * 100)}%
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Task details section */}
//         {currentTask && (
//           <div className="mt-6 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5">
//             <h2 className="text-lg font-semibold mb-4 dark:text-white">Task Details</h2>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
//                     Task name*
//                   </label>
//                   <input
//                     type="text"
//                     value={currentTask.name}
//                     onChange={(e) => updateTask(currentTask.id, 'name', e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                   />
//                 </div>
                
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
//                     Type*
//                   </label>
//                   <select
//                     value={currentTask.type}
//                     onChange={(e) => updateTask(currentTask.id, 'type', e.target.value as TaskType)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                   >
//                     <option value="Pipeline">Pipeline</option>
//                     <option value="Notebook">Notebook</option>
//                     <option value="JAR">JAR</option>
//                     <option value="Python">Python</option>
//                     <option value="Spark">Spark</option>
//                     <option value="SQL">SQL</option>
//                   </select>
//                 </div>
                
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
//                     Dependencies
//                   </label>
//                   <div className="space-y-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded dark:border-gray-700">
//                     {tasks
//                       .filter(t => t.id !== currentTask.id)
//                       .map(task => (
//                         <div key={task.id} className="flex items-center">
//                           <input
//                             type="checkbox"
//                             checked={
//                               (currentTask.outputs?.includes(task.id) || 
//                               currentTask.dependsOn?.includes(task.id))
//                             }
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 if (task.id !== currentTask.id) {
//                                   addDependency(currentTask.id, task.id);
//                                 }
//                               } else {
//                                 removeDependency(currentTask.id, task.id);
//                               }
//                             }}
//                             className="mr-2 dark:bg-gray-700"
//                           />
//                           <span className="dark:text-gray-300">{task.name}</span>
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               </div>
              
//               <div>
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
//                     Path*
//                   </label>
//                   <div className="flex">
//                     <input
//                       type="text"
//                       value={currentTask.path}
//                       onChange={(e) => updateTask(currentTask.id, 'path', e.target.value)}
//                       className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                     />
//                     <button className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
//                       Browse
//                     </button>
//                   </div>
//                 </div>
                
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
//                     Compute
//                   </label>
//                   <div className="space-y-2">
//                     <label className="flex items-center dark:text-gray-300">
//                       <input
//                         type="radio"
//                         name="compute"
//                         checked={currentTask.compute === 'Serverless'}
//                         onChange={() => updateTask(currentTask.id, 'compute', 'Serverless')}
//                         className="mr-2 dark:bg-gray-700"
//                       />
//                       Serverless
//                     </label>
//                     <label className="flex items-center dark:text-gray-300">
//                       <input
//                         type="radio"
//                         name="compute"
//                         checked={currentTask.compute === 'Autoscaling'}
//                         onChange={() => updateTask(currentTask.id, 'compute', 'Autoscaling')}
//                         className="mr-2 dark:bg-gray-700"
//                       />
//                       Autoscaling
//                     </label>
//                     <label className="flex items-center dark:text-gray-300">
//                       <input
//                         type="radio"
//                         name="compute"
//                         checked={currentTask.compute === 'Fixed'}
//                         onChange={() => updateTask(currentTask.id, 'compute', 'Fixed')}
//                         className="mr-2 dark:bg-gray-700"
//                       />
//                       Fixed size
//                     </label>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Additional sections */}
//         <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Runs section */}
//           <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold dark:text-white">Runs</h2>
//               <div className="flex space-x-2">
//                 <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200">
//                   Right now
//                 </button>
//                 <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 dark:bg-blue-700">
//                   Run now
//                 </button>
//               </div>
//             </div>
            
//             <div className="space-y-3">
//               <div className="flex items-center p-2 bg-gray-50 rounded dark:bg-gray-700">
//                 <input type="checkbox" className="mr-3 dark:bg-gray-600" />
//                 <span className="dark:text-gray-300">Unnamed task</span>
//               </div>
//               <div className="flex items-center p-2 bg-gray-50 rounded dark:bg-gray-700">
//                 <input type="checkbox" className="mr-3 dark:bg-gray-600" />
//                 <span className="dark:text-gray-300">Unspecified path</span>
//               </div>
//             </div>
//           </div>

//           {/* Notifications section */}
//           <div className="bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-lg font-semibold dark:text-white">Notifications</h2>
//               <button className="text-blue-600 text-sm dark:text-blue-400">Edit notifications</button>
//             </div>
            
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
//                 Retry Policy
//               </label>
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={true}
//                   onChange={() => {}}
//                   className="mr-2 dark:bg-gray-700"
//                 />
//                 <span className="dark:text-gray-300">Immediately, at most 3x (4 total attempts)</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Advanced settings */}
//         <div className="mt-6 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-5">
//           <h2 className="text-lg font-semibold mb-4 dark:text-white">Advanced settings</h2>
//           <div className="text-gray-500 dark:text-gray-400">No advanced settings configured</div>
//         </div>
//       </main>
//     </div>
//   );
// };
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
  FiMinimize2,
  FiUser,
  FiClock,
  FiTrash,
  FiFileText,
  FiUsers,
  FiLayers,
  FiActivity,
  FiMail,
  FiEdit2
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
  // Dashboard-specific fields
  dashboardSubscribers?: string[]; // emails
  dashboardEmailInput?: string; // for input field
  dashboardEmailSubject?: string;
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

const TASK_TYPE_COLORS: Record<TaskType, string> = {
  Notebook: 'from-blue-400 to-blue-600',
  Python: 'from-green-400 to-green-600',
  SQL: 'from-purple-400 to-purple-600',
  Pipeline: 'from-pink-400 to-pink-600',
  'Run job': 'from-yellow-400 to-yellow-600',
  Dashboard: 'from-indigo-400 to-indigo-600'
};

// --- Notebook Explorer Data (Simulated) ---
type ExplorerSection = 'Workspace' | 'Recents' | 'Runs' | 'Tasks' | 'Users' | 'Trash';

type ExplorerItemType = 'folder' | 'notebook' | 'run' | 'task' | 'user' | 'trash';

interface ExplorerItem {
  id: string;
  name: string;
  type: ExplorerItemType;
  path: string;
  children?: ExplorerItem[];
  lastOpened?: string;
  owner?: string;
  status?: string;
  deletedAt?: string;
}

const explorerData: Record<ExplorerSection, ExplorerItem[]> = {
  Workspace: [
    {
      id: 'ws-root',
      name: 'Workspace',
      type: 'folder',
      path: '/Workspace',
      children: [
        {
          id: 'ws-ai',
          name: 'AI',
          type: 'folder',
          path: '/Workspace/AI',
          children: [
            {
              id: 'ws-ai-notebook1',
              name: 'Build your first AI agent',
              type: 'notebook',
              path: '/Workspace/AI/first_agent',
              lastOpened: '2024-06-10',
              owner: 'selfabdaoui8@gmail.com'
            },
            {
              id: 'ws-ai-notebook2',
              name: 'Explore data with AI-assisted note...',
              type: 'notebook',
              path: '/Workspace/AI/explore_data',
              lastOpened: '2024-06-09',
              owner: 'selfabdaoui8@gmail.com'
            }
          ]
        },
        {
          id: 'ws-pipelines',
          name: 'Pipelines',
          type: 'folder',
          path: '/Workspace/Pipelines',
          children: [
            {
              id: 'ws-pipelines-notebook1',
              name: 'New Pipeline 2025-06-09 16:55',
              type: 'notebook',
              path: '/Workspace/Pipelines/new_pipeline',
              lastOpened: '2024-06-08',
              owner: 'selfabdaoui8@gmail.com'
            }
          ]
        },
        {
          id: 'ws-notebooks',
          name: 'Notebooks',
          type: 'folder',
          path: '/Workspace/Notebooks',
          children: [
            {
              id: 'ws-notebooks-notebook1',
              name: 'Untitled Notebook 2025-06-02 14...',
              type: 'notebook',
              path: '/Workspace/Notebooks/untitled',
              lastOpened: '2024-06-07',
              owner: 'selfabdaoui8@gmail.com'
            }
          ]
        }
      ]
    }
  ],
  Recents: [
    {
      id: 'recent-1',
      name: 'Build your first AI agent',
      type: 'notebook',
      path: '/Workspace/AI/first_agent',
      lastOpened: '2024-06-10',
      owner: 'selfabdaoui8@gmail.com'
    },
    {
      id: 'recent-2',
      name: 'Explore data with AI-assisted note...',
      type: 'notebook',
      path: '/Workspace/AI/explore_data',
      lastOpened: '2024-06-09',
      owner: 'selfabdaoui8@gmail.com'
    }
  ],
  Runs: [
    {
      id: 'run-1',
      name: 'Run #123',
      type: 'run',
      path: '/Workspace/AI/first_agent',
      status: 'Success',
      lastOpened: '2024-06-10'
    },
    {
      id: 'run-2',
      name: 'Run #122',
      type: 'run',
      path: '/Workspace/AI/first_agent',
      status: 'Failed',
      lastOpened: '2024-06-09'
    }
  ],
  Tasks: [
    {
      id: 'task-1',
      name: 'Data Preparation',
      type: 'task',
      path: '/Workspace/AI/first_agent',
      status: 'Completed',
      lastOpened: '2024-06-10'
    },
    {
      id: 'task-2',
      name: 'Model Training',
      type: 'task',
      path: '/Workspace/AI/first_agent',
      status: 'Running',
      lastOpened: '2024-06-10'
    }
  ],
  Users: [
    {
      id: 'user-1',
      name: 'selfabdaoui8@gmail.com',
      type: 'user',
      path: '/Users/selfabdaoui8@gmail.com'
    },
    {
      id: 'user-2',
      name: 'adminis',
      type: 'user',
      path: '/Users/adminis'
    }
  ],
  Trash: [
    {
      id: 'trash-1',
      name: 'Old Notebook',
      type: 'trash',
      path: '/Workspace/Notebooks/old',
      deletedAt: '2024-06-01'
    }
  ]
};

const explorerSectionIcons: Record<ExplorerSection, React.ReactNode> = {
  Workspace: <FiFolder />,
  Recents: <FiClock />,
  Runs: <FiActivity />,
  Tasks: <FiLayers />,
  Users: <FiUsers />,
  Trash: <FiTrash />
};

const explorerItemIcons: Record<ExplorerItemType, React.ReactNode> = {
  folder: <FiFolder className="text-yellow-500" />,
  notebook: <FiBook className="text-blue-500" />,
  run: <FiPlayCircle className="text-green-500" />,
  task: <FiCode className="text-purple-500" />,
  user: <FiUser className="text-gray-500" />,
  trash: <FiTrash className="text-red-500" />
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

  // Notebook Explorer
  const [showNotebookExplorer, setShowNotebookExplorer] = useState(false);
  const [explorerSection, setExplorerSection] = useState<ExplorerSection>('Workspace');
  const [explorerPath, setExplorerPath] = useState<string[]>(['Workspace']);
  const [explorerCurrent, setExplorerCurrent] = useState<ExplorerItem[]>(explorerData.Workspace);
  const [explorerStack, setExplorerStack] = useState<ExplorerItem[]>([]);
  const [explorerSearch, setExplorerSearch] = useState('');
  const [explorerSelected, setExplorerSelected] = useState<ExplorerItem | null>(null);

  // Git modal
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

  function calculateConnectorPoints(source: Task, target: Task) {
    const width = 220;
    const height = 90;
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

  // --- Notebook Explorer (Databricks-like) ---
  function renderNotebookExplorer() {
    function handleSectionChange(section: ExplorerSection) {
      setExplorerSection(section);
      setExplorerPath([section]);
      setExplorerStack([]);
      setExplorerCurrent(explorerData[section]);
      setExplorerSearch('');
      setExplorerSelected(null);
    }

    function renderBreadcrumbs() {
      return (
        <nav className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
          {explorerPath.map((crumb, idx) => (
            <span key={crumb} className="flex items-center">
              <button
                className={`hover:underline ${idx === explorerPath.length - 1 ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}
                onClick={() => {
                  if (idx === 0) {
                    handleSectionChange(explorerSection);
                  } else {
                    let stack = [...explorerStack];
                    stack = stack.slice(0, idx);
                    setExplorerStack(stack);
                    setExplorerPath(explorerPath.slice(0, idx + 1));
                    let items = explorerData[explorerSection];
                    for (let i = 1; i <= idx; i++) {
                      const found = stack[i - 1];
                      if (found && found.children) items = found.children;
                    }
                    setExplorerCurrent(items);
                  }
                }}
              >
                {crumb}
              </button>
              {idx < explorerPath.length - 1 && <span className="mx-1">/</span>}
            </span>
          ))}
        </nav>
      );
    }

    let items = explorerCurrent;
    if (explorerSearch.trim()) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(explorerSearch.toLowerCase())
      );
    }

    function handleItemClick(item: ExplorerItem) {
      if (item.type === 'folder') {
        setExplorerStack([...explorerStack, item]);
        setExplorerPath([...explorerPath, item.name]);
        setExplorerCurrent(item.children || []);
        setExplorerSelected(null);
      } else {
        setExplorerSelected(item);
      }
    }

    function handleConfirm() {
      if (explorerSelected && selectedTask) {
        setTasks(tasks =>
          tasks.map(t =>
            t.id === selectedTask.id ? { ...t, path: explorerSelected.path } : t
          )
        );
        setShowNotebookExplorer(false);
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-[800px] h-[540px] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex h-full">
            <div className="w-48 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 py-4 px-2 flex flex-col">
              <div className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 pl-2">Browse</div>
              <ul className="flex-1 space-y-1">
                {(Object.keys(explorerData) as ExplorerSection[]).map(section => (
                  <li key={section}>
                    <button
                      className={`flex items-center gap-2 w-full px-3 py-2 rounded transition text-sm
                        ${explorerSection === section
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-semibold'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                        }`}
                      onClick={() => handleSectionChange(section)}
                    >
                      {explorerSectionIcons[section]}
                      {section}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 flex flex-col px-5 py-4">
              {renderBreadcrumbs()}
              <div className="flex items-center mb-3">
                <FiSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={explorerSearch}
                  onChange={e => setExplorerSearch(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <FiXCircle size={32} className="mb-2" />
                    <span>No items found.</span>
                  </div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left py-1 font-medium">Name</th>
                        <th className="text-left py-1 font-medium">Path</th>
                        <th className="text-left py-1 font-medium">Meta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr
                          key={item.id}
                          className={`cursor-pointer transition rounded
                            ${explorerSelected?.id === item.id
                              ? 'bg-blue-50 dark:bg-blue-900'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          onClick={() => handleItemClick(item)}
                        >
                          <td className="py-2 flex items-center gap-2">
                            {explorerItemIcons[item.type]}
                            <span className="truncate">{item.name}</span>
                          </td>
                          <td className="py-2 text-xs text-gray-500 dark:text-gray-400">
                            {item.path}
                          </td>
                          <td className="py-2 text-xs text-gray-500 dark:text-gray-400">
                            {item.type === 'notebook' && (
                              <>
                                <span>Last opened: {item.lastOpened}</span>
                                <span className="ml-2">Owner: {item.owner}</span>
                              </>
                            )}
                            {item.type === 'run' && (
                              <>
                                <span>Status: {item.status}</span>
                                <span className="ml-2">Last: {item.lastOpened}</span>
                              </>
                            )}
                            {item.type === 'task' && (
                              <>
                                <span>Status: {item.status}</span>
                                <span className="ml-2">Last: {item.lastOpened}</span>
                              </>
                            )}
                            {item.type === 'trash' && (
                              <span>Deleted: {item.deletedAt}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                  onClick={() => setShowNotebookExplorer(false)}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-white ${explorerSelected ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800' : 'bg-gray-300 cursor-not-allowed'}`}
                  disabled={!explorerSelected}
                  onClick={handleConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Unified Source Section for all types, including Dashboard ---
  function renderUnifiedSourceSection() {
    if (!selectedTask) return null;
    // Types that use workspace/git: Notebook, Python, SQL, Pipeline, Run job, Dashboard
    const typesWithSource = ['Notebook', 'Python', 'SQL', 'Pipeline', 'Run job', 'Dashboard'] as TaskType[];
    let showSourceSection = typesWithSource.includes(selectedTask.type);

    return (
      <>
        {showSourceSection && (
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 dark:text-gray-400">
              {selectedTask.type}
            </label>
            <div className="flex items-center space-x-2">
              <div className={`flex-1 flex items-center px-3 py-2 rounded border transition ${
                selectedTask.sourceType === 'Workspace' && !!selectedTask.path && selectedTask.path.startsWith('/Workspace')
                  ? 'border-green-400 bg-green-50 dark:bg-green-900'
                  : 'border-gray-300 bg-white dark:bg-gray-700'
              }`}>
                {TASK_TYPE_ICONS[selectedTask.type]}
                <span className="truncate">{selectedTask.path || <span className="italic text-gray-400">No file selected</span>}</span>
                {selectedTask.sourceType === 'Workspace' && !!selectedTask.path && selectedTask.path.startsWith('/Workspace') ? (
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
              {selectedTask.sourceType === 'Workspace' && !!selectedTask.path && selectedTask.path.startsWith('/Workspace') && (
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
              Select a {selectedTask.type.toLowerCase()} from your workspace.
            </div>
            {showNotebookExplorer && renderNotebookExplorer()}
          </div>
        )}
        {showSourceSection && selectedTask.sourceType === 'Git provider' && (
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
            {showGitForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                      <FiGitBranch className="text-blue-500" /> Add a git reference
                    </h3>
                    <button
                      onClick={() => setShowGitForm(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                  <div className="px-6 py-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                        Git repository URL<span className="text-red-500">*</span>
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
                        Git provider<span className="text-red-500">*</span>
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
                        Git reference (branch / tag / commit)<span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-2 mb-2">
                        <button
                          className={`px-3 py-1 rounded transition font-medium ${gitReferenceType === 'branch' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border border-blue-400' : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}
                          onClick={() => setGitReferenceType('branch')}
                          type="button"
                        >
                          Branch
                        </button>
                        <button
                          className={`px-3 py-1 rounded transition font-medium ${gitReferenceType === 'tag' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border border-blue-400' : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}
                          onClick={() => setGitReferenceType('tag')}
                          type="button"
                        >
                          Tag
                        </button>
                        <button
                          className={`px-3 py-1 rounded transition font-medium ${gitReferenceType === 'commit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border border-blue-400' : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}
                          onClick={() => setGitReferenceType('commit')}
                          type="button"
                        >
                          Commit
                        </button>
                      </div>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder={
                          gitReferenceType === 'branch'
                            ? 'main, release-1.1'
                            : gitReferenceType === 'tag'
                            ? 'v1.0.0, release-2023'
                            : 'a0b1c2d3...'
                        }
                        value={gitReferenceValue}
                        onChange={e => setGitReferenceValue(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                      onClick={() => setShowGitForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 font-semibold"
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
        )}
        {/* Always show Dashboard Subscription section if type is Dashboard */}
        {selectedTask.type === 'Dashboard' && (
          <div className="mt-4 space-y-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 dark:text-gray-400">
              Dashboard Subscription
            </label>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiMail className="text-blue-500" />
                <span className="font-medium text-sm dark:text-white">Subscribers (emails)</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {(selectedTask.dashboardSubscribers || []).map((email, idx) => (
                  <span
                    key={email}
                    className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs dark:bg-blue-900 dark:text-blue-200"
                  >
                    {email}
                    <button
                      className="ml-1 text-blue-400 hover:text-red-500"
                      title="Remove"
                      onClick={() => {
                        setTasks(tasks =>
                          tasks.map(t =>
                            t.id === selectedTask.id
                              ? {
                                  ...t,
                                  dashboardSubscribers: (t.dashboardSubscribers || []).filter(e => e !== email)
                                }
                              : t
                          )
                        );
                      }}
                    >
                      <FiXCircle size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={e => {
                  e.preventDefault();
                  const value = selectedTask.dashboardEmailInput?.trim();
                  if (value && /\S+@\S+\.\S+/.test(value)) {
                    setTasks(tasks =>
                      tasks.map(t =>
                        t.id === selectedTask.id
                          ? {
                              ...t,
                              dashboardSubscribers: [
                                ...(t.dashboardSubscribers || []),
                                value
                              ],
                              dashboardEmailInput: ''
                            }
                          : t
                      )
                    );
                  }
                }}
              >
                <input
                  type="email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Add email and press Enter"
                  value={selectedTask.dashboardEmailInput || ''}
                  onChange={e =>
                    setTasks(tasks =>
                      tasks.map(t =>
                        t.id === selectedTask.id
                          ? { ...t, dashboardEmailInput: e.target.value }
                          : t
                      )
                    )
                  }
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = selectedTask.dashboardEmailInput?.trim();
                      if (value && /\S+@\S+\.\S+/.test(value)) {
                        setTasks(tasks =>
                          tasks.map(t =>
                            t.id === selectedTask.id
                              ? {
                                  ...t,
                                  dashboardSubscribers: [
                                    ...(t.dashboardSubscribers || []),
                                    value
                                  ],
                                  dashboardEmailInput: ''
                                }
                              : t
                          )
                        );
                      }
                    }
                  }}
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  title="Add email"
                >
                  <FiPlus />
                </button>
              </form>
              <div className="text-xs text-gray-400 mt-1">
                Enter an email and press Enter to add. Subscribers will receive dashboard alerts after task run.
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiEdit2 className="text-indigo-500" />
                <span className="font-medium text-sm dark:text-white">Subscription email subject</span>
              </div>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Subject for dashboard alert email"
                value={selectedTask.dashboardEmailSubject || ''}
                onChange={e =>
                  setTasks(tasks =>
                    tasks.map(t =>
                      t.id === selectedTask.id
                        ? { ...t, dashboardEmailSubject: e.target.value }
                        : t
                    )
                  )
                }
              />
              <div className="text-xs text-gray-400 mt-1">
                This subject will be used for the alert email sent to all dashboard subscribers.
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  function renderTaskTypeSection() {
    // Use unified logic for Notebook, Python, SQL, Pipeline, Run job, Dashboard
    return renderUnifiedSourceSection();
  }

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

  function getTaskTypeColor(type: TaskType, dark: boolean) {
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

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
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
          <button
            onClick={() => setJobDetailsPanelExpanded(!jobDetailsPanelExpanded)}
            className={`h-8 w-6 flex items-center justify-center self-center rounded ${jobDetailsPanelExpanded ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            {jobDetailsPanelExpanded ? <FiChevronLeft className="text-gray-600 dark:text-gray-300" /> : <FiChevronRight className="text-gray-600 dark:text-gray-300" />}
          </button>
          <div className={`flex-1 flex flex-col transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-gray-900' : ''}`}>
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
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'top left'
                }}
              >
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
                {renderConnectors()}
                {renderTempConnector()}
                {renderTaskNodes()}
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
              <div className="absolute bottom-2 right-2 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300 shadow">
                {Math.round(zoomLevel * 100)}%
              </div>
            </div>
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
                    <div className="mt-4">
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
                    {renderTaskTypeSection()}
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
