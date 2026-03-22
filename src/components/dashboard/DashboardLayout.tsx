import { Outlet, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { NotificationBell } from "./NotificationBell";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function DashboardLayout() {
  const { profile } = useAuth();

  const initials = (profile?.name || profile?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
            <SidebarTrigger className="hidden md:inline-flex text-muted-foreground" />
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link to="/dashboard/profile" className="hidden md:block">
                <Avatar className="h-8 w-8 ring-1 ring-border hover:ring-primary transition-[box-shadow] cursor-pointer">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.name ?? ""} className="object-cover" />
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-auto">
            <Outlet />
          </main>
        </div>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
}
