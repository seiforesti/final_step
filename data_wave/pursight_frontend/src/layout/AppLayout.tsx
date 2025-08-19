import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const HEADER_HEIGHT = 56; // Doit être identique à AppHeader

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen flex bg-[#181c24]">
      {/* Sidebar */}
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      {/* Content area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out relative ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
        style={{ minHeight: "100vh", background: "#181c24" }}
      >
        {/* Fixed Header */}
        <AppHeader />
        {/* Main content below header, never under header */}
        <main
          className="flex-1 flex flex-col p-0 md:p-0"
          style={{
            paddingTop: HEADER_HEIGHT,
            minHeight: 0,
            minWidth: 0,
            width: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* Wrapper qui garantit que chaque page occupe tout l'espace disponible */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
