// import { useState } from "react";
// import { XIcon, ChevronDownIcon, DatabaseIcon, NotebookIcon, DashboardIcon, JobIcon, ModelIcon, FileIcon, SearchIcon } from "../../icons/icon";

// type NewItemOption = {
//   id: string;
//   title: string;
//   description: string;
//   icon: React.ReactNode;
//   category: string;
// };

// export default function NewItemModal({ onClose }: { onClose: () => void }) {
//   const [selectedCategory, setSelectedCategory] = useState<string>("All");
//   const [searchQuery, setSearchQuery] = useState<string>("");

//   const options: NewItemOption[] = [
//     {
//       id: "notebook",
//       title: "Notebook",
//       description: "Create an interactive notebook with code, visualizations, and narrative text",
//       icon: <NotebookIcon className="h-5 w-5 text-blue-500" />,
//       category: "Workspace"
//     },
//     {
//       id: "dashboard",
//       title: "Dashboard",
//       description: "Visualize and share your data insights",
//       icon: <DashboardIcon className="h-5 w-5 text-purple-500" />,
//       category: "Workspace"
//     },
//     {
//       id: "job",
//       title: "Job",
//       description: "Run automated tasks on a schedule or trigger",
//       icon: <JobIcon className="h-5 w-5 text-green-500" />,
//       category: "Workflows"
//     },
//     {
//       id: "ml-model",
//       title: "ML Model",
//       description: "Create and manage machine learning models",
//       icon: <ModelIcon className="h-5 w-5 text-orange-500" />,
//       category: "Machine Learning"
//     },
//     {
//       id: "query",
//       title: "Query",
//       description: "Write and run SQL queries",
//       icon: <DatabaseIcon className="h-5 w-5 text-teal-500" />,
//       category: "SQL"
//     },
//     {
//       id: "file",
//       title: "File",
//       description: "Upload a file to your workspace",
//       icon: <FileIcon className="w-6 h-6 text-gray-500" />,
//       category: "Workspace"
//     }
//   ];

//   const categories = ["All", ...new Set(options.map(option => option.category))];

//   const filteredOptions = options.filter(option => {
//     const matchesCategory = selectedCategory === "All" || option.category === selectedCategory;
//     const matchesSearch = option.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
//                          option.description.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesCategory && matchesSearch;
//   });

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
//         {/* Modal Header */}
//         <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New</h2>
//           <button 
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
//           >
//             <XIcon className="w-5 h-5 text-red-500 hover:text-red-700" />
//           </button>
//         </div>

//         {/* Modal Body */}
//         <div className="p-4 overflow-y-auto flex-1">
//           {/* Search Bar */}
//           <div className="relative mb-4">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <SearchIcon className="h-5 w-5 text-gray-400" />
//             </div>
//             <input
//               type="text"
//               className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="Search data, notebooks, recents, and more..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//               <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
//                 CTRL + P
//               </span>
//             </div>
//           </div>

//           {/* Category Filter */}
//           <div className="mb-4">
//             <div className="flex space-x-2 overflow-x-auto pb-2">
//               {categories.map(category => (
//                 <button
//                   key={category}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
//                     selectedCategory === category
//                       ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
//                       : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
//                   }`}
//                 >
//                   {category}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Options List */}
//           <div className="space-y-3">
//             {filteredOptions.length > 0 ? (
//               filteredOptions.map(option => (
//                 <div 
//                   key={option.id}
//                   className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
//                   onClick={() => {
//                     // Handle creation based on option.id
//                     console.log("Creating:", option.id);
//                     onClose();
//                   }}
//                 >
//                   <div className="flex items-start">
//                     <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 mr-4">
//                       {option.icon}
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="font-medium text-gray-900 dark:text-white">{option.title}</h3>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
//                     </div>
//                     <ChevronDownIcon className="h-5 w-5 text-gray-400 transform rotate-90" />
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                 No matching options found
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Modal Footer */}
//         <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }













// import { XIcon, SearchIcon, NotebookIcon, DashboardIcon, JobIcon, ModelIcon, DatabaseIcon, ExperimentIcon, AlertIcon } from "../../icons/icon";

// type MenuItem = {
//   id: string;
//   title: string;
//   icon?: React.ReactNode;
//   path?: string;
//   time?: string;
//   type?: string;
// };

// export default function NewItemModal({ onClose, triggerPosition }: { 
//   onClose: () => void;
//   triggerPosition: { top: number; left: number };
// }) {
//   const categories = [
//     {
//       name: "Add or upload data",
//       items: [
//         { id: "notebook", title: "Notebook", icon: <NotebookIcon className="w-5 h-5" /> },
//         { id: "query", title: "Query", icon: <DatabaseIcon className="w-5 h-5" /> },
//         { id: "dashboard", title: "Dashboard", icon: <DashboardIcon className="w-5 h-5" /> }
//       ]
//     },
//     {
//       name: "Workflows",
//       items: [
//         { id: "job", title: "Job", icon: <JobIcon className="w-5 h-5" /> },
//         { id: "pipeline", title: "DLT Pipeline" },
//         { id: "alert", title: "Alert", icon: <AlertIcon className="w-5 h-5" /> }
//       ]
//     }
//   ];

//   const recentItems = [
//     { title: "Explore data with AI-assisted notebooks", path: "/Users/you", time: "28 mins ago", type: "Notebook" },
//     { title: "Build your first AI agent", path: "/Users/you", time: "1 day ago", type: "Notebook" }
//   ];

//   return (
//     <div className="fixed inset-0 z-50">
//       {/* Overlay */}
//       <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />
      
//       {/* Modal positioned near trigger */}
//       <div 
//         className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 overflow-hidden"
//         style={{
//           top: `${triggerPosition.top}px`,
//           left: `${triggerPosition.left}px`,
//           maxHeight: "calc(100vh - 100px)"
//         }}
//       >
//         {/* Header */}
//         <div className="sticky top-0 bg-white dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
//           <h2 className="font-semibold">Create New</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <XIcon className="h-5 w-5" />
//           </button>
//         </div>

//         {/* Search */}
//         <div className="p-3 border-b border-gray-200 dark:border-gray-700">
//           <div className="relative">
//             <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//             <input
//               type="text"
//               className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm focus:outline-none"
//               placeholder="Search..."
//             />
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
//           {/* Recent Items */}
//           <div className="p-3">
//             <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">RECENT</h3>
//             <div className="space-y-1">
//               {recentItems.map((item, i) => (
//                 <div key={i} className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
//                   <span className="text-gray-500 text-sm mr-2">{i + 1}.</span>
//                   <div>
//                     <div className="text-sm font-medium">{item.title}</div>
//                     <div className="text-xs text-gray-500">{item.time}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Categories */}
//           {categories.map((category) => (
//             <div key={category.name} className="p-3 border-t border-gray-200 dark:border-gray-700">
//               <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{category.name.toUpperCase()}</h3>
//               <div className="grid grid-cols-2 gap-2">
//                 {category.items.map((item) => (
//                   <button
//                     key={item.id}
//                     className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-left"
//                   >
//                     {item.icon && <span className="mr-2">{item.icon}</span>}
//                     <span className="text-sm">{item.title}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }






  // import { useState } from "react";
  // import { XIcon, NotebookIcon, DashboardIcon, JobIcon, ModelIcon, DatabaseIcon, ExperimentIcon, AlertIcon, GenieIcon, PipelineIcon, AppIcon, UploadIcon, UploadCloudIcon, ChevronDownIcon } from "../../icons/icon";

  // type MenuItem = {
  //   id: string;
  //   title: string;
  //   icon?: React.ReactNode;
  // };

  // export default function NewItemModal({ onClose, triggerPosition }: { 
  //   onClose: () => void;
  //   triggerPosition: { top: number; left: number };

  // }) {
  //       const [isHeaderOpen, setIsHeaderOpen] = useState(false);

  //   const category = {
      
  //     items: [
  //       { id: "notebook", title: "Notebook", icon: <NotebookIcon className="w-5 h-5" /> },
  //       { id: "query", title: "Query", icon: <DatabaseIcon className="w-5 h-5" /> },
  //       { id: "dashboard", title: "Dashboard", icon: <DashboardIcon className="w-5 h-5" /> },
  //       { id: "geniespace", title: "Genie space", icon: <GenieIcon className="w-5 h-5" /> },      { id: "job", title: "Job", icon: <JobIcon className="w-5 h-5" /> },
  //       { id: "pipeline", title: "DLT pipeline", icon: <PipelineIcon className="w-5 h-5" /> },
  //       { id: "legacyalert", title: "Legacy Alert", icon: <AlertIcon className="w-5 h-5" /> },
  //       { id: "alertbeta", title: "Alert Beta", icon: <AlertIcon className="w-5 h-5" /> },
  //       { id: "experiment", title: "Experiment", icon: <ExperimentIcon className="w-5 h-5" /> },
  //       { id: "model", title: "Model", icon: <ModelIcon className="w-5 h-5" /> },
  //       { id: "app", title: "App", icon: <AppIcon className="w-5 h-5" /> },
  //       { id: "more", title: "More" }
  //     ]
  //   };


    

  //   return (
  //     <div className="fixed inset-0 z-50">
          
  //       {/* Overlay transparent - permet de garder la sidebar visible */}
  //       <div 
  //         className="fixed inset-0 z-40" 
  //         onClick={onClose}
  //         style={{ backgroundColor: 'transparent' }} 
  //       />
        
  //       {/* Modal positionné au-dessus du header */}
  //       <div 
  //         className="absolute z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg w-64 overflow-hidden border border-gray-200 dark:border-gray-700"
  //         style={{
  //           top: `calc(${triggerPosition.top}px - 10px)`, // Ajustement pour apparaître au-dessus
  //           left: `${triggerPosition.left}px`,
  //         }}
  //       >
  //         {/* Header cliquable style Databricks */}
  //         <button 
  //           className={`w-full p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700
  //             flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}
  //           onClick={() => setIsHeaderOpen(!isHeaderOpen)}
  //         >
  //           <div className="flex items-center">
  //             <UploadCloudIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
  //             <span className="font-medium text-gray-800 dark:text-gray-200">Add or upload data</span>
  //           </div>
  //           <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${
  //             isHeaderOpen ? 'transform rotate-180' : ''
  //           }`} />
  //         </button>

  //         {/* Main Content */}
  //         <div className="overflow-y-auto">
  //           {/* Items List */}
  //           <div className="p-2">
  //             {category.items.slice(0, 4).map((item) => (
  //               <button
  //                 key={item.id}
  //                 className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-left"
  //               >
  //                 {item.icon && <span className="mr-3 text-gray-500">{item.icon}</span>}
  //               <span className="text-gray-800 dark:text-gray-300">{item.title}</span>
  //               </button>
  //             ))}
  //             {/* Double séparateur après Genie space */}
  //           <div className="border-t border-gray-200 dark:border-gray-700"></div>
  //           <div className="border-t border-gray-100 dark:border-gray-600"></div>

  //           {category.items.slice(4, 11).map((item) => (
  //             <button
  //                 key={item.id}
  //                 className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-left"
  //               >
  //                 {item.icon && <span className="mr-3 text-gray-500">{item.icon}</span>}
  //               <span className="text-gray-800 dark:text-gray-300">{item.title}</span>
  //               </button>
  //               ))}
  //               {/* Double séparateur après Genie space */}
  //           <div className="border-t border-gray-200 dark:border-gray-700"></div>
  //           <div className="border-t border-gray-100 dark:border-gray-600"></div>

  //           {category.items.slice(11).map((item) => (
  //             <button
  //                 key={item.id}
  //                 className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-left"
  //               >
  //                 {item.icon && <span className="mr-3 text-gray-500">{item.icon}</span>}
  //               <span className="text-gray-800 dark:text-gray-300">{item.title}</span>
  //               </button>
  //               ))}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { 
    NotebookIcon, DashboardIcon, JobIcon, ModelIcon, 
    DatabaseIcon, ExperimentIcon, AlertIcon, GenieIcon, 
    PipelineIcon, AppIcon, UploadCloudIcon, ChevronDownIcon
  } from "../../icons/icon";

  type MenuItem = {
    id: string;
    title: string;
    icon?: React.ReactNode;
  };

  export default function NewItemModal({ onClose, triggerPosition }: { 
    onClose: () => void;
    triggerPosition: { top: number; left: number };
  }) {
    const [isHeaderOpen, setIsHeaderOpen] = useState(false);
    const navigate = useNavigate();

    const handleJobClick = () => {
      navigate("/job-creation");
      onClose();
    };
    const handleNotebookClick = () => {
      navigate("/notebook-creation");
      onClose();
    };

    const items = [
      { id: "notebook", title: "Notebook", icon: <NotebookIcon className="w-5 h-5" /> },
      { id: "query", title: "Query", icon: <DatabaseIcon className="w-5 h-5" /> },
      { id: "dashboard", title: "Dashboard", icon: <DashboardIcon className="w-5 h-5" /> },
      { id: "geniespace", title: "Genie space", icon: <GenieIcon className="w-5 h-5" /> },
      { id: "job", title: "Job", icon: <JobIcon className="w-5 h-5" /> },
      { id: "pipeline", title: "DLT pipeline", icon: <PipelineIcon className="w-5 h-5" /> },
      { id: "legacyalert", title: "Legacy Alert", icon: <AlertIcon className="w-5 h-5" /> },
      { id: "alertbeta", title: "Alert Beta", icon: <AlertIcon className="w-5 h-5" /> },
      { id: "experiment", title: "Experiment", icon: <ExperimentIcon className="w-5 h-5" /> },
      { id: "model", title: "Model", icon: <ModelIcon className="w-5 h-5" /> },
      { id: "app", title: "App", icon: <AppIcon className="w-5 h-5" /> },
      { id: "more", title: "More" }
    ];

    return (
      <div className="fixed inset-0 z-50">
        {/* Overlay transparent - permet de garder la sidebar visible */}
        <div 
          className="fixed inset-0 z-40" 
          onClick={onClose}
          style={{ backgroundColor: 'transparent' }} 
        />
        
        {/* Modal positionné au-dessus du header */}
        <div 
          className="absolute z-50 bg-white dark:bg-gray-800 rounded-md shadow-lg w-64 overflow-hidden border border-gray-200 dark:border-gray-700"
          style={{
            top: `calc(${triggerPosition.top}px - 10px)`,
            left: `${triggerPosition.left}px`,
          }}
        >
          {/* Header cliquable style Databricks */}
          <button 
            className={`w-full p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700
              flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}
            onClick={() => setIsHeaderOpen(!isHeaderOpen)}
          >
            <div className="flex items-center">
              <UploadCloudIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-800 dark:text-gray-200">Add or upload data</span>
            </div>
            <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform ${
              isHeaderOpen ? 'transform rotate-180' : ''
            }`} />
          </button>

          {/* Main Content */}
          <div className="overflow-y-auto">
            {/* Items List */}
            <div className="p-2">
              {items.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  className={`flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-left ${
                    item.id === "job" || item.id === "notebook" ? "cursor-pointer" : ""
                  }`}
                  onClick={
                    item.id === "job"
                      ? handleJobClick
                      : item.id === "notebook"
                      ? handleNotebookClick
                      : undefined
                  }
                >
                  {item.icon && <span className="mr-3 text-gray-500">{item.icon}</span>}
                  <span className="text-gray-800 dark:text-gray-300">{item.title}</span>
                </button>
              ))}
              {/* Double séparateur après Genie space */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              <div className="border-t border-gray-100 dark:border-gray-600"></div>

              {items.slice(4, 11).map((item) => (
                <button
                  key={item.id}
                  className={`flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-left ${
                    item.id === "job" ? "cursor-pointer" : ""
                  }`}
                  onClick={item.id === "job" ? handleJobClick : undefined}
                >
                  {item.icon && <span className="mr-3 text-gray-500">{item.icon}</span>}
                  <span className="text-gray-800 dark:text-gray-300">{item.title}</span>
                </button>
              ))}
              {/* Double séparateur après Genie space */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
              <div className="border-t border-gray-100 dark:border-gray-600"></div>

              {items.slice(11).map((item) => (
                <button
                  key={item.id}
                  className="flex items-center w-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-left"
                >
                  {item.icon && <span className="mr-3 text-gray-500">{item.icon}</span>}
                  <span className="text-gray-800 dark:text-gray-300">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }