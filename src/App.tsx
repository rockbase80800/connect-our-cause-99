import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { WebsiteSettingsProvider } from "@/contexts/WebsiteSettingsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ProjectDetail from "./pages/ProjectDetail";
import Payment from "./pages/Payment";
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
import PaymentSettings from "./pages/dashboard/admin/PaymentSettings";
import ProjectDashboard from "./pages/dashboard/admin/ProjectDashboard";
import CoordinatorUsers from "./pages/dashboard/coordinator/CoordinatorUsers";
import CoordinatorMembers from "./pages/dashboard/coordinator/CoordinatorMembers";
import Gallery from "./pages/Gallery";
import Videos from "./pages/Videos";
import MSMEAuditorHiring from "./pages/MSMEAuditorHiring";
import LegalDocuments from "./pages/LegalDocuments";
import ManageLegalDocuments from "./pages/dashboard/admin/ManageLegalDocuments";
import OurWebsites from "./pages/OurWebsites";
import ManageWebsites from "./pages/dashboard/admin/ManageWebsites";
import Team from "./pages/Team";
import PublicProfile from "./pages/PublicProfile";
import CreateMyPage from "./pages/dashboard/CreateMyPage";
import ManageUserProfiles from "./pages/dashboard/admin/ManageUserProfiles";
import ManageHomepageAdmins from "./pages/dashboard/admin/ManageHomepageAdmins";
import RegistrationPayment from "./pages/RegistrationPayment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <LanguageProvider>
          <WebsiteSettingsProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/payment/:applicationId" element={<Payment />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/msme-auditor-hiring" element={<MSMEAuditorHiring />} />
              <Route path="/legal-documents" element={<LegalDocuments />} />
              <Route path="/our-websites" element={<OurWebsites />} />
              <Route path="/team" element={<Team />} />
              <Route path="/profile/:id" element={<PublicProfile />} />
              <Route path="/registration-payment" element={<RegistrationPayment />} />
              
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
                <Route path="admin/videos" element={<ManageVideos />} />
                <Route path="admin/payment" element={<PaymentSettings />} />
                <Route path="admin/project/:projectId" element={<ProjectDashboard />} />
                <Route path="coordinator/users" element={<CoordinatorUsers />} />
                <Route path="coordinator/members" element={<CoordinatorMembers />} />
                <Route path="admin/legal-documents" element={<ManageLegalDocuments />} />
                <Route path="admin/websites" element={<ManageWebsites />} />
                <Route path="admin/user-profiles" element={<ManageUserProfiles />} />
                <Route path="my-page" element={<CreateMyPage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </WebsiteSettingsProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
