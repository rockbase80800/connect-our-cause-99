import { Home, FolderOpen, Users, UserCircle, MoreHorizontal } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", path: "/dashboard", icon: Home, end: true },
  { label: "Projects", path: "/dashboard/projects", icon: FolderOpen },
  { label: "Team", path: "/dashboard/referrals", icon: Users },
  { label: "Profile", path: "/dashboard/profile", icon: UserCircle },
  { label: "More", path: "/dashboard/more", icon: MoreHorizontal },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[hsl(160,20%,7%)]/90 backdrop-blur-xl border-t border-border/30 h-[60px]">
      <div className="flex items-center justify-around h-full px-1">
        {tabs.map(({ label, path, icon: Icon, end }) => {
          const active = end
            ? location.pathname === path
            : location.pathname.startsWith(path);

          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 active:scale-[0.92]",
                active
                  ? "text-primary drop-shadow-[0_0_6px_hsl(158,35%,25%/0.5)]"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.8} />
              <span className="text-[10px] font-medium leading-none">
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
