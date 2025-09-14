import { useRef, useState } from "react";
import {
  SearchIcon,
  NotebookIcon,
  RobotIcon,
  PlusIcon,
  ModelIcon,
  DashboardIcon,
  JobIcon,
} from "../../icons/icon";
import NewItemModal from "../../pages/fenetresModales/NewItemModal"; // Chemin vers votre composant modal

// Define types for your data
type SectionItem = {
  id: string;
  title: string;
  path?: string;
  time?: string;
  type?: string;
  icon?: React.ReactNode;
};

type Section = {
  id: string;
  title: string;
  items: SectionItem[];
};

type QuickLinkItem = {
  title: string;
  items: string[];
};

type FeatureItem = {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
};

export default function   HomePursight() {
  // State to track whether there are recent items
  const hasRecentItems = false; // Will be replaced with backend data
  // État pour gérer l'ouverture/fermeture de la modale
  const [showNewItemModal, setShowNewItemModal] = useState(false);

  // Empty state content with proper typing
  const emptyStateContent: {
    features: FeatureItem[];
    quickLinks: QuickLinkItem[];
  } = {
    features: [
      {
        title: "Explore data with AI-assisted notebooks",
        description:
          "Learn how to analyze sample data and use artificial intelligence (AI) to generate queries and visualize results.",
        icon: (
          <NotebookIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
        ),
        bgColor: "bg-blue-100 dark:bg-blue-900",
      },
      {
        title: "Build your first AI agent",
        description:
          "Create and register functions in Unity Catalog for governed insights, then build a chat-based AI to generate actionable insights.",
        icon: (
          <RobotIcon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
        ),
        bgColor: "bg-purple-100 dark:bg-purple-900",
      },
    ],
    quickLinks: [
      {
        title: "Data Engineering",
        items: ["Job Runs", "Data Ingestion", "Pipelines"],
      },
      {
        title: "Machine Learning",
        items: [],
      },
    ],
  };

  // Properly typed sections for when data exists
  const sections: Section[] = [
    { id: "recents", title: "Recents", items: [] },
    { id: "favorites", title: "Favorites", items: [] },
    { id: "popular", title: "Popular", items: [] },
    { id: "mosaic-ai", title: "Mosaic AI", items: [] },
    { id: "whats-new", title: "What's new", items: [] },
  ];

  // Example data for demonstration
  const exampleRecentItems: SectionItem[] = [
    {
      id: "1",
      title: "Explore data with AI-assisted notebooks",
      path: "/Users/selfabdaoui5@gmail.com",
      time: "16 seconds ago",
      type: "Notebook",
      icon: <NotebookIcon className="h-5 w-5 text-blue-500" />,
    },
    {
      id: "2",
      title: "Build your first AI agent",
      path: "/Users/selfabdaoui5@gmail.com",
      time: "5 minutes ago",
      type: "Notebook",
      icon: <RobotIcon className="h-5 w-5 text-purple-500" />,
    },
  ];
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleNewClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setModalPosition({
        top: rect.bottom + 10,
        left: rect.left + rect.width, // Ajuster selon la position de la sidebar
      });
    }
    setShowNewItemModal(true);
  };

  // When you have real data, you would populate sections like this:
  // sections[0].items = exampleRecentItems;

  return (
    <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to NXCI_Datawave
        </h1>
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search data, notebooks, recents, and more..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              CTRL + P
            </span>
          </div>
        </div>
      </div>

      {/* Conditional rendering based on data */}
      {hasRecentItems ? (
        /* Data exists - show sections with content */
        <div className="space-y-8">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h2>

              {section.items.length > 0 ? (
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                    >
                      {section.id === "recents" && (
                        <span className="text-gray-500 dark:text-gray-400 font-medium mr-4">
                          {section.items.indexOf(item) + 1}.
                        </span>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="mr-3">{item.icon}</div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {item.title}
                            </h3>
                            {item.path && item.time && item.type && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {item.path} • {item.time} • {item.type}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty section state */
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No {section.title.toLowerCase()} items yet
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty state - getting started content */
        <>
          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {emptyStateContent.features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-2 rounded-lg ${feature.bgColor} mr-4`}>
                    {feature.icon}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {feature.description}
                </p>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                  Start{" "}
                  {feature.title.includes("Explore") ? "exploring" : "building"}{" "}
                  →
                </button>
              </div>
            ))}
          </div>

          {/* New Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Start your journey
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create your first notebook, dashboard, or job to get started.
            </p>
            <button
              ref={buttonRef}
              onClick={handleNewClick}
              className="flex items-center text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New
            </button>
            {showNewItemModal && (
              <NewItemModal
                onClose={() => setShowNewItemModal(false)}
                triggerPosition={modalPosition}
              />
            )}
          </div>

          {/* Quick Links Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {emptyStateContent.quickLinks.map((link, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {link.title}
                </h2>
                {link.items.length > 0 ? (
                  <ul className="space-y-2">
                    {link.items.map((item, i) => (
                      <li key={i} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                        <span className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">
                    {link.title === "Machine Learning"
                      ? "Coming soon..."
                      : "No items yet"}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
