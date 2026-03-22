import { useAuth } from "@/contexts/AuthContext";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { DashboardBanner } from "@/components/dashboard/DashboardBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderOpen, Users, Share2, Clock, CheckCircle, XCircle, Eye, Wallet, FilePlus, UserCheck, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const cardVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function DashboardHome() {
  const { profile, primaryRole, isAtLeast, hasRole } = useAuth();
  const isAdmin = isAtLeast("admin");
  const isSuperAdmin = primaryRole === "super_admin";
  const hasOwnPage = hasRole("own_page");
  const [stats, setStats] = useState({ projects: 0, applications: 0, referrals: 0 });
  const [adminStats, setAdminStats] = useState({ total: 0, pending: 0, under_review: 0, approved: 0, rejected: 0, users: 0 });
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);
  const [myPageStatus, setMyPageStatus] = useState<string | null>(null);
  const [pendingPages, setPendingPages] = useState(0);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;

    const fetchAll = async () => {
      // User stats - always fetch
      const [{ count: projCount }, { count: appCount }, { count: refCount }] =
        await Promise.all([
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("applications").select("*", { count: "exact", head: true }).eq("user_id", profile.id),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("referred_by", profile.id),
        ]);
      if (cancelled) return;
      setStats({ projects: projCount ?? 0, applications: appCount ?? 0, referrals: refCount ?? 0 });

      // Admin stats
      if (isAdmin) {
        const [{ count: total }, { count: pending }, { count: underReview }, { count: approved }, { count: rejected }, { count: users }] =
          await Promise.all([
            supabase.from("applications").select("*", { count: "exact", head: true }),
            supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
            supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "under_review"),
            supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
            supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "rejected"),
            supabase.from("profiles").select("*", { count: "exact", head: true }),
          ]);
        if (cancelled) return;
        setAdminStats({
          total: total ?? 0, pending: pending ?? 0, under_review: underReview ?? 0,
          approved: approved ?? 0, rejected: rejected ?? 0, users: users ?? 0,
        });
      }

      // Super admin wallet & pending pages
      if (isSuperAdmin) {
        const [{ data: walletData }, { count: pagesCount }] = await Promise.all([
          supabase.from("wallet").select("balance, total_earned"),
          supabase.from("user_profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
        ]);
        if (cancelled) return;
        if (walletData && walletData.length > 0) {
          setWalletBalance(walletData.reduce((s, w) => s + Number((w as any).balance), 0));
          setTotalEarnings(walletData.reduce((s, w) => s + Number((w as any).total_earned), 0));
        }
        setPendingPages(pagesCount ?? 0);
      }

      // Own page status
      if (hasOwnPage) {
        const { data } = await supabase.from("user_profiles").select("status").eq("user_id", profile.id).maybeSingle();
        if (!cancelled && data) setMyPageStatus((data as any).status);
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, [profile?.id]);

  const roleBadge = primaryRole.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <PageWrapper><div className="space-y-8">
      <DashboardBanner />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-display text-2xl md:text-3xl text-foreground mb-1">
          Welcome back, {profile?.name || "User"}
        </h1>
        <p className="text-muted-foreground">
          Role: <span className="font-medium text-primary">{roleBadge}</span>
        </p>
      </motion.div>

      {/* Wallet for super admin */}
      {isSuperAdmin && walletBalance !== null && (
        <div className="grid grid-cols-2 gap-4">
          <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">Wallet Balance</CardTitle>
                <Wallet className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="text-2xl font-bold text-primary">₹{walletBalance}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Earnings</CardTitle>
                <Wallet className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="text-2xl font-bold text-accent">₹{totalEarnings}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Pending User Pages for Super Admin */}
      {isSuperAdmin && pendingPages > 0 && (
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <Link to="/dashboard/admin/user-profiles">
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">Pending User Pages</CardTitle>
                <UserCheck className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="text-2xl font-bold text-yellow-600">{pendingPages}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting approval →</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      )}

      {/* Own Page Status for users with own_page role */}
      {hasOwnPage && (
        <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
          <Link to="/dashboard/my-page">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
              <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">My Profile Page</CardTitle>
                <FilePlus className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent className="px-4 pb-3">
                {myPageStatus ? (
                  <div className={`text-lg font-bold ${myPageStatus === "approved" ? "text-green-600" : myPageStatus === "rejected" ? "text-destructive" : "text-yellow-600"}`}>
                    {myPageStatus.charAt(0).toUpperCase() + myPageStatus.slice(1)}
                  </div>
                ) : (
                  <div className="text-lg font-bold text-primary">Create Now →</div>
                )}
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      )}

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
            ].map((s, i) => (
              <motion.div key={s.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
                    <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
                    <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: "/dashboard/projects", label: "Active Projects", value: stats.projects, icon: FolderOpen },
          { to: "/dashboard/applications", label: "My Applications", value: stats.applications, icon: FileText },
          { to: "/dashboard/referrals", label: "My Referrals", value: stats.referrals, icon: Share2 },
        ].map((item, i) => (
          <motion.div key={item.to} custom={i + 6} variants={cardVariants} initial="hidden" animate="visible">
            <Link to={item.to}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98]">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{item.value}</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div></PageWrapper>
  );
}
