import { useAuth } from "@/contexts/AuthContext";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderOpen, Users, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function DashboardHome() {
  const { profile, primaryRole } = useAuth();
  const [stats, setStats] = useState({ projects: 0, applications: 0, referrals: 0 });

  useEffect(() => {
    const fetch = async () => {
      if (!profile) return;

      const [{ count: projCount }, { count: appCount }, { count: refCount }] =
        await Promise.all([
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("referred_by", profile.id),
        ]);

      setStats({
        projects: projCount ?? 0,
        applications: appCount ?? 0,
        referrals: refCount ?? 0,
      });
    };
    fetch();
  }, [profile]);

  const roleBadge = primaryRole.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <PageWrapper><div className="space-y-8">
      <div>
        <h1 className="text-display text-2xl md:text-3xl text-foreground mb-1">
          Welcome back, {profile?.name || "User"}
        </h1>
        <p className="text-muted-foreground">
          Role: <span className="font-medium text-primary">{roleBadge}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/dashboard/projects">
          <Card className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.projects}</div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/applications">
          <Card className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.applications}</div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/dashboard/referrals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Referrals</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.referrals}</div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
