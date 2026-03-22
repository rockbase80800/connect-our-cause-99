import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { WebsiteSettingsProvider } from "@/contexts/WebsiteSettingsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ProjectDetail from "./pages/ProjectDetail";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProjectsList from "./pages/dashboard/ProjectsList";
import MyApplications from "./pages/dashboard/MyApplications";
import Notifications from "./pages/dashboard/Notifications";
import Profile from "./pages/dashboard/Profile";
import Referrals from "./pages/dashboard/Referrals";
import MoreMenu from "./pages/dashboard/MoreMenu";
import ManageUsers from "./pages/dashboard/admin/ManageUsers";
import ManageApplications from "./pages/dashboard/admin/ManageApplications";
import ManageProjects from "./pages/dashboard/admin/ManageProjects";
import AssignRoles from "./pages/dashboard/admin/AssignRoles";
import Analytics from "./pages/dashboard/admin/Analytics";
import WebsiteSettings from "./pages/dashboard/admin/WebsiteSettings";
import ManageBanners from "./pages/dashboard/admin/ManageBanners";
import ManageHomepage from "./pages/dashboard/admin/ManageHomepage";
import ManageGallery from "./pages/dashboard/admin/ManageGallery";
import ManageLeads from "./pages/dashboard/admin/ManageLeads";
import ManageVideos from "./pages/dashboard/admin/ManageVideos";
import CoordinatorUsers from "./pages/dashboard/coordinator/CoordinatorUsers";
import CoordinatorMembers from "./pages/dashboard/coordinator/CoordinatorMembers";
import Gallery from "./pages/Gallery";
import Videos from "./pages/Videos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WebsiteSettingsProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/videos" element={<Videos />} />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="projects" element={<ProjectsList />} />
                <Route path="applications" element={<MyApplications />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<Profile />} />
                <Route path="referrals" element={<Referrals />} />
                <Route path="more" element={<MoreMenu />} />
                <Route path="admin/users" element={<ManageUsers />} />
                <Route path="admin/applications" element={<ManageApplications />} />
                <Route path="admin/projects" element={<ManageProjects />} />
                <Route path="admin/roles" element={<AssignRoles />} />
                <Route path="admin/analytics" element={<Analytics />} />
                <Route path="admin/settings" element={<WebsiteSettings />} />
                <Route path="admin/banners" element={<ManageBanners />} />
                <Route path="admin/homepage" element={<ManageHomepage />} />
                <Route path="admin/gallery" element={<ManageGallery />} />
                <Route path="admin/leads" element={<ManageLeads />} />
                <Route path="coordinator/users" element={<CoordinatorUsers />} />
                <Route path="coordinator/members" element={<CoordinatorMembers />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </WebsiteSettingsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
