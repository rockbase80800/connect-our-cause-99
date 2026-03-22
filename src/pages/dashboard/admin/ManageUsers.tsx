import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Download } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  state: string | null;
  district: string | null;
  block: string | null;
  panchayat: string | null;
  created_at: string;
  user_roles: { role: string }[];
}

export default function ManageUsers() {
  const { primaryRole, profile } = useAuth();
  const isSuperAdmin = primaryRole === "super_admin";
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      let query = supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });

      if (primaryRole === "state_admin" && profile?.state) {
        query = query.eq("state", profile.state);
      }

      const { data } = await query;
      setUsers((data as unknown as UserRow[]) ?? []);
      setLoading(false);
    };
    fetchUsers();
  }, [primaryRole, profile]);

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
  );

  const exportCSV = (type: "phone" | "full") => {
    let csv = "";
    if (type === "phone") {
      csv = "Phone\n" + filtered.map((u) => u.phone || "").filter(Boolean).join("\n");
    } else {
      csv = "Name,Email,Phone,State,District,Block,Panchayat,Joined\n" +
        filtered.map((u) =>
          [u.name, u.email, u.phone, u.state, u.district, u.block, u.panchayat, new Date(u.created_at).toLocaleDateString()]
            .map((v) => `"${v || ""}"`)
            .join(",")
        ).join("\n");
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `users_${type}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("CSV downloaded");
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-display text-2xl text-foreground">Manage Users</h1>
        {isSuperAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => exportCSV("phone")} size="sm" variant="outline" className="active:scale-[0.97]">
              <Download className="h-4 w-4 mr-1" /> Phones CSV
            </Button>
            <Button onClick={() => exportCSV("full")} size="sm" className="active:scale-[0.97]">
              <Download className="h-4 w-4 mr-1" /> Full CSV
            </Button>
          </div>
        )}
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <p className="text-sm text-muted-foreground">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</p>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name ?? "—"}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="text-sm font-mono">{u.phone || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {u.user_roles?.map((r) => (
                        <Badge key={r.role} variant="outline" className="text-xs">
                          {r.role.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[u.state, u.district, u.block, u.panchayat].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
