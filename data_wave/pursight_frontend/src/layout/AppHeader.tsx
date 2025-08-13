import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";

const HEADER_HEIGHT = 56; // px

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-800 shadow-sm"
      style={{ height: HEADER_HEIGHT, width: "100%" }}
    >
      <div className="flex items-center justify-between h-14 w-full">
        <div className="flex items-center min-w-0 flex-shrink-0 space-x-3 pl-2">
          <button
            onClick={handleToggle}
            className="p-2 text-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            )}
          </button>
          <Link to="/" className="flex items-center space-x-2 min-w-0">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-800 text-white shadow">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <ellipse cx="12" cy="6" rx="8" ry="3" fill="#fff" fillOpacity="0.8"/>
                <ellipse cx="12" cy="6" rx="8" ry="3" stroke="#fff" strokeWidth="1.5"/>
                <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke="#fff" strokeWidth="1.5" fill="none"/>
                <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" stroke="#fff" strokeWidth="1.5" fill="none"/>
              </svg>
            </span>
            <span className="truncate text-lg font-extrabold tracking-tight text-gray-800 dark:text-white">
              NXCI <span className="text-blue-600">DataWave</span>
            </span>
          </Link>
        </div>
        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              className="block w-full py-2 pl-8 pr-10 text-sm bg-gray-100 border border-transparent rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              placeholder="Search data, notebooks, and more..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <kbd className="px-1 py-0.5 text-xs text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400">⌘K</kbd>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 pr-2">
          <ThemeToggleButton />
          <NotificationDropdown />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

// Pour que le header soit totalement séparé du layout content :
// 1. Dans votre composant de layout principal (ex: AppLayout), ajoutez un padding-top égal à HEADER_HEIGHT (56px) sur le conteneur du content.
// Exemple :
// <div style={{ paddingTop: 56 }}> {/* votre content ici */} </div>
// ou en Tailwind : className="pt-14"
// Cela garantit que le content ne passe jamais sous le header fixe.
