import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Download, CheckCircle, XCircle } from "lucide-react";
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
  payment_status: string;
  user_status: string;
  registration_transaction_id: string | null;
  user_roles: { role: string }[];
}

export default function ManageUsers() {
  const { primaryRole, profile } = useAuth();
  const isSuperAdmin = primaryRole === "super_admin";
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  useEffect(() => { fetchUsers(); }, [primaryRole, profile]);

  const handleApprove = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ payment_status: "paid", user_status: "approved" } as any)
      .eq("id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success("User approved");
    fetchUsers();
  };

  const handleReject = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ payment_status: "rejected", user_status: "rejected" } as any)
      .eq("id", userId);
    if (error) { toast.error(error.message); return; }
    toast.success("User rejected");
    fetchUsers();
  };

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
      csv = "Name,Email,Phone,State,District,Block,Panchayat,Payment,Status,Joined\n" +
        filtered.map((u) =>
          [u.name, u.email, u.phone, u.state, u.district, u.block, u.panchayat, u.payment_status, u.user_status, new Date(u.created_at).toLocaleDateString()]
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
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Joined</TableHead>
                {isSuperAdmin && <TableHead>Actions</TableHead>}
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
                  <TableCell>
                    <Badge variant={u.payment_status === "paid" ? "default" : u.payment_status === "pending" ? "secondary" : "outline"} className="text-xs">
                      {u.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.user_status === "approved" ? "default" : u.user_status === "pending" ? "secondary" : "destructive"} className="text-xs">
                      {u.user_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{u.registration_transaction_id || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[u.state, u.district, u.block, u.panchayat].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      {u.user_status !== "approved" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleApprove(u.id)} className="text-emerald-600 hover:text-emerald-700 active:scale-[0.97]">
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(u.id)} className="text-destructive hover:text-destructive active:scale-[0.97]">
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                      {u.user_status === "approved" && (
                        <span className="text-xs text-emerald-600">✓ Approved</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
