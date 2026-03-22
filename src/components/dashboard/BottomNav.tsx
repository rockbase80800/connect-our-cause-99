import { Home, FolderOpen, Users, MoreHorizontal } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const tabs = [
  { label: "Home", path: "/dashboard", icon: Home, end: true },
  { label: "Projects", path: "/dashboard/projects", icon: FolderOpen },
  { label: "Team", path: "/dashboard/referrals", icon: Users },
  { label: "Profile", path: "/dashboard/profile", icon: null },
  { label: "More", path: "/dashboard/more", icon: MoreHorizontal },
];

export function BottomNav() {
  const location = useLocation();
  const { profile } = useAuth();

  const initials = (profile?.name || profile?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-[hsl(160,20%,7%)]/90 backdrop-blur-xl border-t border-border/30 h-[60px]">
      <div className="flex items-center justify-around h-full px-1">
        {tabs.map(({ label, path, icon: Icon, end }) => {
          const active = end
            ? location.pathname === path
            : location.pathname.startsWith(path);

          const isProfile = label === "Profile";

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
              {isProfile ? (
                <Avatar className={cn("h-[22px] w-[22px] ring-1", active ? "ring-primary" : "ring-muted-foreground/40")}>
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.name ?? ""} className="object-cover" />
                  <AvatarFallback className="text-[8px] font-semibold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              ) : Icon ? (
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 1.8} />
              ) : null}
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