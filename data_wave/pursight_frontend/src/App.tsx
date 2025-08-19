import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import HomePursight from "./pages/Dashboard/HomePursight";
import { ModalProvider } from "./pages/fenetresModales/ModalContext";
import JobCreationPage from "./pages/job/JobCreationPage";
import NotebookPage from "./pages/notebook/NotebookPage";
import DataCatalog from "./pages/catalog/DataCatalog";
import SignIn from "./pages/catalog/SignIn";
import { AppProviders } from "./AppProviders";
import RBACAdminDashboard from "./pages/rbac_system/RBACAdminDashboard";
import { RBACProvider } from "./providers/RBACProvider";
import { RBACContext } from "./hooks/useRBAC";
// Import new pages
import DataSourceConnectPage from "./pages/datasource/DataSourceConnectPage";
import DataMapDesignerPage from "./pages/datamap/DataMapDesignerPage";
import MainPage from "./pages/NXCI_DataGovernance/MainPage";

// AuthRoute component for protected routes (fixes React hook rules)
type AuthRouteProps = Readonly<{
  element: React.ReactElement;
  children?: React.ReactNode;
}>;
function AuthRoute({ element }: AuthRouteProps) {
  const { user, isLoading, flatLoading } = useContext(RBACContext);
  if (isLoading || flatLoading) return <div>Loading RBAC context...</div>;
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  return element;
}

export default function App() {
  return (
    <AppProviders>
      <ModalProvider>
        <Router>
          <RBACProvider>
            <ScrollToTop />
            <Routes>
              {/* Dashboard Layout and Protected Routes */}
              <Route element={<AppLayout />}>
                {/* New Data Governance Routes */}
                <Route
                  path="/data-governance/*"
                  element={<AuthRoute element={<MainPage />} />}
                />
                {/* Home and other dashboard routes */}
                <Route index path="/" element={<HomePursight />} />
                <Route index path="/home_pursight" element={<HomePursight />} />
                <Route path="/profile" element={<UserProfiles />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/blank" element={<Blank />} />
                <Route path="/job-creation" element={<JobCreationPage />} />
                <Route path="/notebook-creation" element={<NotebookPage />} />
                <Route path="/schema-information" element={<DataCatalog />} />
                {/* RBAC Admin (new unified dashboard) */}
                <Route path="/rbac-admin/*" element={<RBACAdminDashboard />} />
                <Route path="/form-elements" element={<FormElements />} />
                <Route path="/basic-tables" element={<BasicTables />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/avatars" element={<Avatars />} />
                <Route path="/badge" element={<Badges />} />
                <Route path="/buttons" element={<Buttons />} />
                <Route path="/images" element={<Images />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/line-chart" element={<LineChart />} />
                <Route path="/bar-chart" element={<BarChart />} />
              </Route>

              {/* Auth Layout */}
              <Route path="/signin" element={<SignIn />} />
    
              {/* Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RBACProvider>
        </Router>
      </ModalProvider>
    </AppProviders>
  );
}
