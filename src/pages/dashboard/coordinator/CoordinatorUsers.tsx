import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function CoordinatorUsers() {
  const { profile, primaryRole } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    let query = supabase.from("profiles").select("*").order("name");

    if (primaryRole === "district_coordinator" && profile.district) {
      query = query.eq("district", profile.district);
    } else if (primaryRole === "block_coordinator" && profile.block) {
      query = query.eq("block", profile.block);
    } else if (primaryRole === "panchayat_coordinator" && profile.panchayat) {
      query = query.eq("panchayat", profile.panchayat);
    }

    query.then(({ data }) => {
      setUsers(data ?? []);
      setLoading(false);
    });
  }, [profile, primaryRole]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-display text-2xl text-foreground">Area Users</h1>
      <p className="text-muted-foreground text-sm">
        Showing users in your assigned {primaryRole.replace("_coordinator", "").replace("_", " ")}
      </p>
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell className="text-sm">{u.phone ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {[u.state, u.district, u.block, u.panchayat].filter(Boolean).join(", ") || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
