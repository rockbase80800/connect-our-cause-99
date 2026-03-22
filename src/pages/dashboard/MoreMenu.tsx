import {
  Users,
  FileText,
  FolderKanban,
  ShieldCheck,
  BarChart3,
  MapPin,
  UserCheck,
  Settings,
  Image,
  Home,
  ImageIcon,
  Contact,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageWrapper } from "@/components/dashboard/PageWrapper";

interface MenuItem {
  label: string;
  description: string;
  icon: React.ElementType;
  path: string;
  minRole: string[];
}

const menuItems: MenuItem[] = [
  {
    label: "Manage Users",
    description: "View and manage all registered users",
    icon: Users,
    path: "/dashboard/admin/users",
    minRole: ["super_admin", "state_admin", "admin"],
  },
  {
    label: "Applications",
    description: "Review and manage project applications",
    icon: FileText,
    path: "/dashboard/admin/applications",
    minRole: ["super_admin", "state_admin", "admin"],
  },
  {
    label: "Manage Projects",
    description: "Create, edit, and manage projects",
    icon: FolderKanban,
    path: "/dashboard/admin/projects",
    minRole: ["super_admin"],
  },
  {
    label: "Website Settings",
    description: "Manage branding, logo, and site content",
    icon: Settings,
    path: "/dashboard/admin/settings",
    minRole: ["super_admin"],
  },
  {
    label: "Manage Banners",
    description: "Create and manage dashboard banners",
    icon: Image,
    path: "/dashboard/admin/banners",
    minRole: ["super_admin"],
  },
  {
    label: "Homepage Settings",
    description: "Edit hero, about, and homepage content",
    icon: Home,
    path: "/dashboard/admin/homepage",
    minRole: ["super_admin"],
  },
  {
    label: "Photo Gallery",
    description: "Manage the public photo gallery",
    icon: ImageIcon,
    path: "/dashboard/admin/gallery",
    minRole: ["super_admin"],
  },
  {
    label: "Videos",
    description: "Manage YouTube videos",
    icon: Video,
    path: "/dashboard/admin/videos",
    minRole: ["super_admin"],
  },
  {
    label: "Leads",
    description: "View all form submissions",
    icon: Contact,
    path: "/dashboard/admin/leads",
    minRole: ["super_admin"],
  },
  {
    label: "Assign Roles",
    description: "Assign roles to users across the hierarchy",
    icon: ShieldCheck,
    path: "/dashboard/admin/roles",
    minRole: ["super_admin", "state_admin"],
  },
  {
    label: "Analytics",
    description: "View platform statistics and reports",
    icon: BarChart3,
    path: "/dashboard/admin/analytics",
    minRole: ["super_admin", "state_admin", "admin"],
  },
  {
    label: "Area Users",
    description: "View users in your assigned area",
    icon: MapPin,
    path: "/dashboard/coordinator/users",
    minRole: ["district_coordinator", "block_coordinator", "panchayat_coordinator"],
  },
  {
    label: "Area Members",
    description: "View project members in your area",
    icon: UserCheck,
    path: "/dashboard/coordinator/members",
    minRole: ["district_coordinator", "block_coordinator", "panchayat_coordinator"],
  },
  {
    label: "My Applications",
    description: "Track your submitted applications",
    icon: FileText,
    path: "/dashboard/applications",
    minRole: ["user", "super_admin", "state_admin", "admin", "district_coordinator", "block_coordinator", "panchayat_coordinator"],
  },
  {
    label: "Notifications",
    description: "View all your notifications",
    icon: FileText,
    path: "/dashboard/notifications",
    minRole: ["user", "super_admin", "state_admin", "admin", "district_coordinator", "block_coordinator", "panchayat_coordinator"],
  },
];

export default function MoreMenu() {
  const navigate = useNavigate();
  const { roles, primaryRole } = useAuth();

  const visibleItems = menuItems.filter((item) =>
    item.minRole.some((r) => roles.includes(r as any) || primaryRole === r)
  );

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">More</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access advanced features & settings
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visibleItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60 shadow-sm
                         text-left transition-all duration-200
                         hover:shadow-md hover:border-primary/30
                         active:scale-[0.97]"
            >
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary shrink-0">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
