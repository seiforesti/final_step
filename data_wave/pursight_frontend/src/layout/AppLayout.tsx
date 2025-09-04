import React, { useState } from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import { AppNavbar as AppHeader } from "../racine-main-manager/components/navigation/AppNavbar";
import Backdrop from "./Backdrop";
import { AdvancedNavigationSidebar as AppSidebar } from "../racine-main-manager/components/navigation/AdvancedNavigationSidebar";
import { AdvancedQuickActionsSidebar } from "../racine-main-manager/components/quick-actions-sidebar/AdvancedQuickActionsSidebar";
import { RacineRouter } from "../racine-main-manager/components/routing/RacineRouter";
import { ViewMode } from "../racine-main-manager/types/racine-core.types";

const HEADER_HEIGHT = 56; // Doit être identique à AppHeader

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [quickActionsSidebarOpen, setQuickActionsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState(ViewMode.DASHBOARD);

  return (
    <RacineRouter
      currentView={currentView}
      onViewChange={setCurrentView}
      userPermissions={[]}
    >
      <div className="min-h-screen flex w-full overflow-hidden bg-[#181c24]">
      {/* Sidebar */}
      <div className="flex-none">
        <AppSidebar />
        <Backdrop />
      </div>
      {/* Content area */}
      <div
        className={"flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out relative"}
        style={{ minHeight: "100vh", background: "#181c24" }}
      >
        {/* Fixed Header */}
        <AppHeader 
          onQuickActionsTrigger={() => setQuickActionsSidebarOpen(true)}
          isQuickActionsSidebarOpen={quickActionsSidebarOpen}
        />
        {/* Main content below header, never under header */}
        <main
          className="flex-1 min-w-0 flex flex-col p-0 md:p-0"
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
      
      {/* Advanced Quick Actions Sidebar */}
      <AdvancedQuickActionsSidebar
        isOpen={quickActionsSidebarOpen}
        onToggle={() => setQuickActionsSidebarOpen(!quickActionsSidebarOpen)}
        currentContext="global"
        onActionExecute={(actionId, categoryId) => {
          console.log('Quick action executed:', actionId, categoryId);
        }}
      />
      </div>
    </RacineRouter>
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
