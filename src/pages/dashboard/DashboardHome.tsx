import { useAuth } from "@/contexts/AuthContext";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { DashboardBanner } from "@/components/dashboard/DashboardBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderOpen, Users, Share2, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function DashboardHome() {
  const { profile, primaryRole, isAtLeast } = useAuth();
  const isAdmin = isAtLeast("admin");
  const [stats, setStats] = useState({ projects: 0, applications: 0, referrals: 0 });
  const [adminStats, setAdminStats] = useState({ total: 0, pending: 0, under_review: 0, approved: 0, rejected: 0, users: 0 });

  useEffect(() => {
    if (!profile) return;

    const fetchUser = async () => {
      const [{ count: projCount }, { count: appCount }, { count: refCount }] =
        await Promise.all([
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("referred_by", profile.id),
        ]);
      setStats({ projects: projCount ?? 0, applications: appCount ?? 0, referrals: refCount ?? 0 });
    };

    const fetchAdmin = async () => {
      if (!isAdmin) return;
      const [{ count: total }, { count: pending }, { count: underReview }, { count: approved }, { count: rejected }, { count: users }] =
        await Promise.all([
          supabase.from("applications").select("*", { count: "exact", head: true }),
          supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "under_review"),
          supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "rejected"),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
        ]);
      setAdminStats({
        total: total ?? 0,
        pending: pending ?? 0,
        under_review: underReview ?? 0,
        approved: approved ?? 0,
        rejected: rejected ?? 0,
        users: users ?? 0,
      });
    };

    fetchUser();
    fetchAdmin();
  }, [profile, isAdmin]);

  const roleBadge = primaryRole.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <PageWrapper><div className="space-y-8">
      <DashboardBanner />
      <div>
        <h1 className="text-display text-2xl md:text-3xl text-foreground mb-1">
          Welcome back, {profile?.name || "User"}
        </h1>
        <p className="text-muted-foreground">
          Role: <span className="font-medium text-primary">{roleBadge}</span>
        </p>
      </div>

      {/* Admin Application Stats */}
      {isAdmin && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Application Overview</h2>
            <Link to="/dashboard/admin/applications">
              <span className="text-sm text-primary hover:underline">View all →</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total", value: adminStats.total, icon: FileText, color: "text-foreground" },
              { label: "Pending", value: adminStats.pending, icon: Clock, color: "text-warning" },
              { label: "Under Review", value: adminStats.under_review, icon: Eye, color: "text-blue-500" },
              { label: "Approved", value: adminStats.approved, icon: CheckCircle, color: "text-success" },
              { label: "Rejected", value: adminStats.rejected, icon: XCircle, color: "text-destructive" },
              { label: "Total Users", value: adminStats.users, icon: Users, color: "text-foreground" },
            ].map((s) => (
              <Card key={s.label} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
                  <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                </CardHeader>
                <CardContent className="px-4 pb-3">
                  <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

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
    </div></PageWrapper>
  );
}
