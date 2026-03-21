import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function CoordinatorMembers() {
  const { profile, primaryRole } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const fetchMembers = async () => {
      // Get project members who are in coordinator's area
      const { data: areaUsers } = await supabase
        .from("profiles")
        .select("id")
        .eq(
          primaryRole === "district_coordinator" ? "district" :
          primaryRole === "block_coordinator" ? "block" : "panchayat",
          primaryRole === "district_coordinator" ? profile.district! :
          primaryRole === "block_coordinator" ? profile.block! : profile.panchayat!
        );

      if (!areaUsers?.length) { setLoading(false); return; }

      const userIds = areaUsers.map((u) => u.id);
      const { data } = await supabase
        .from("project_members")
        .select("*, profiles(name, email), projects(title)")
        .in("user_id", userIds)
        .order("joined_at", { ascending: false });

      setMembers(data ?? []);
      setLoading(false);
    };

    fetchMembers();
  }, [profile, primaryRole]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-display text-2xl text-foreground">Project Members</h1>
      {members.length === 0 ? (
        <p className="text-muted-foreground">No project members in your area yet.</p>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{m.profiles?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{m.profiles?.email}</p>
                  </TableCell>
                  <TableCell className="text-sm">{m.projects?.title ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(m.joined_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
