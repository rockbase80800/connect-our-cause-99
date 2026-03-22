import {
  Home,
  FolderOpen,
  FileText,
  Users,
  Shield,
  BarChart3,
  Bell,
  UserCircle,
  Share2,
  LogOut,
  Heart,
  Settings,
  Image,
  Video,
  CreditCard,
  Globe,
  Scale,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { NavLink } from "@/components/NavLink";
import { useWebsiteSettings } from "@/contexts/WebsiteSettingsContext";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { primaryRole, profile, signOut } = useAuth();
  const { settings } = useWebsiteSettings();
  const siteName = settings?.site_name || "JanSeva";
  const logoUrl = settings?.logo_url;

  const mainItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Projects", url: "/dashboard/projects", icon: FolderOpen },
    { title: "My Applications", url: "/dashboard/applications", icon: FileText },
    { title: "My Referrals", url: "/dashboard/referrals", icon: Share2 },
    { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
    { title: "Profile", url: "/dashboard/profile", icon: UserCircle },
  ];

  const adminItems = [
    ...(["super_admin", "state_admin", "admin"].includes(primaryRole)
      ? [{ title: "Manage Users", url: "/dashboard/admin/users", icon: Users }]
      : []),
    ...(["super_admin", "admin"].includes(primaryRole)
      ? [{ title: "Manage Applications", url: "/dashboard/admin/applications", icon: FileText }]
      : []),
    ...(primaryRole === "super_admin"
      ? [
           { title: "Manage Projects", url: "/dashboard/admin/projects", icon: FolderOpen },
          { title: "Manage Banners", url: "/dashboard/admin/banners", icon: Image },
          { title: "Homepage Settings", url: "/dashboard/admin/homepage", icon: Home },
          { title: "Photo Gallery", url: "/dashboard/admin/gallery", icon: Image },
          { title: "Videos", url: "/dashboard/admin/videos", icon: Video },
          { title: "Legal Documents", url: "/dashboard/admin/legal-documents", icon: Scale },
          { title: "Our Websites", url: "/dashboard/admin/websites", icon: Globe },
          { title: "Payment Settings", url: "/dashboard/admin/payment", icon: CreditCard },
          { title: "Leads", url: "/dashboard/admin/leads", icon: FileText },
          { title: "Assign Roles", url: "/dashboard/admin/roles", icon: Shield },
          { title: "Website Settings", url: "/dashboard/admin/settings", icon: Settings },
        ]
      : []),
    ...(primaryRole === "state_admin"
      ? [{ title: "Assign Coordinators", url: "/dashboard/admin/roles", icon: Shield }]
      : []),
    ...(["super_admin", "state_admin", "admin"].includes(primaryRole)
      ? [{ title: "Analytics", url: "/dashboard/admin/analytics", icon: BarChart3 }]
      : []),
  ];

  const coordinatorItems =
    ["district_coordinator", "block_coordinator", "panchayat_coordinator"].includes(primaryRole)
      ? [
          { title: "Area Users", url: "/dashboard/coordinator/users", icon: Users },
          { title: "Team Members", url: "/dashboard/coordinator/members", icon: Users },
        ]
      : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Brand */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-6 w-auto object-contain shrink-0" />
          ) : (
            <Heart className="h-6 w-6 text-sidebar-primary shrink-0" />
          )}
          {!collapsed && (
            <span className="font-display text-lg font-semibold text-sidebar-foreground">
              {siteName}
            </span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {coordinatorItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Coordinator</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {coordinatorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="hover:bg-sidebar-accent/50"
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="mr-2 h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-3 py-3 border-t border-sidebar-border">
          {!collapsed && profile && (
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.name ?? ""} className="object-cover" />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {(profile.name || profile.email || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {profile.name || profile.email}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2 shrink-0" />
            {!collapsed && "Sign Out"}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
