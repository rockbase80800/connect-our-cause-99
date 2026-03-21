import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle, XCircle, FolderOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ["hsl(158, 35%, 25%)", "hsl(36, 85%, 55%)", "hsl(0, 72%, 51%)", "hsl(200, 70%, 50%)"];

export default function Analytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApps: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    projects: 0,
  });
  const [projectStats, setProjectStats] = useState<{ name: string; applications: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: userCount },
        { count: appCount },
        { count: approvedCount },
        { count: rejectedCount },
        { count: pendingCount },
        { count: projCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("applications").select("*", { count: "exact", head: true }),
        supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "rejected"),
        supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("projects").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: userCount ?? 0,
        totalApps: appCount ?? 0,
        approved: approvedCount ?? 0,
        rejected: rejectedCount ?? 0,
        pending: pendingCount ?? 0,
        projects: projCount ?? 0,
      });

      // Project-wise stats
      const { data: apps } = await supabase
        .from("applications")
        .select("project_id, projects(title)");

      if (apps) {
        const map = new Map<string, number>();
        apps.forEach((a: any) => {
          const name = a.projects?.title || "Unknown";
          map.set(name, (map.get(name) || 0) + 1);
        });
        setProjectStats(Array.from(map.entries()).map(([name, applications]) => ({ name, applications })));
      }

      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const pieData = [
    { name: "Approved", value: stats.approved },
    { name: "Pending", value: stats.pending },
    { name: "Rejected", value: stats.rejected },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8">
      <h1 className="text-display text-2xl text-foreground">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users },
          { label: "Applications", value: stats.totalApps, icon: FileText },
          { label: "Approved", value: stats.approved, icon: CheckCircle },
          { label: "Rejected", value: stats.rejected, icon: XCircle },
          { label: "Projects", value: stats.projects, icon: FolderOpen },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {projectStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Applications by Project</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis fontSize={12} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="hsl(158, 35%, 25%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
