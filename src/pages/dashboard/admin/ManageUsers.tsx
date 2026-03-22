import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Download, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  state: string | null;
  district: string | null;
  block: string | null;
  panchayat: string | null;
  designation: string | null;
  payment_status: string;
  user_status: string;
  registration_transaction_id: string | null;
  payment_screenshot_url: string | null;
  created_at: string;
  user_roles: { role: string }[];
}

export default function ManageUsers() {
  const { primaryRole, profile } = useAuth();
  const isSuperAdmin = primaryRole === "super_admin";
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const filtered = users.filter((u) => {
    const matchesSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search);
    const matchesFilter = filter === "all" || u.user_status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ payment_status: "paid", user_status: "approved" })
      .eq("id", userId);
    if (error) toast.error(error.message);
    else {
      toast.success("User approved!");
      // Send notification
      await supabase.from("notifications").insert({
        user_id: userId,
        message: "आपका Registration Approve हो गया है! अब आप सभी features use कर सकते हैं।",
      });
      await fetchUsers();
    }
    setActionLoading(null);
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ user_status: "rejected" })
      .eq("id", userId);
    if (error) toast.error(error.message);
    else {
      toast.success("User rejected");
      await supabase.from("notifications").insert({
        user_id: userId,
        message: "आपका Registration Reject कर दिया गया है। कृपया Admin से संपर्क करें।",
      });
      await fetchUsers();
    }
    setActionLoading(null);
  };

  const exportCSV = (type: "phone" | "full") => {
    let csv = "";
    if (type === "phone") {
      csv = "Phone\n" + filtered.map((u) => u.phone || "").filter(Boolean).join("\n");
    } else {
      csv = "Name,Email,Phone,Designation,State,District,Payment Status,User Status,Joined\n" +
        filtered.map((u) =>
          [u.name, u.email, u.phone, u.designation, u.state, u.district, u.payment_status, u.user_status, new Date(u.created_at).toLocaleDateString()]
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

  const paymentBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "outline" | "secondary" | "destructive"; label: string }> = {
      unpaid: { variant: "destructive", label: "Unpaid" },
      pending: { variant: "outline", label: "Pending" },
      paid: { variant: "default", label: "Paid" },
    };
    const s = map[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={s.variant} className="text-xs">{s.label}</Badge>;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "outline" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "outline", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
    };
    const s = map[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={s.variant} className="text-xs">{s.label}</Badge>;
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

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name, email, phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="active:scale-[0.97] text-xs capitalize">
              {f}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</p>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Joined</TableHead>
                {isSuperAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{u.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{u.phone || "—"}</TableCell>
                  <TableCell className="text-sm">{u.designation || "—"}</TableCell>
                  <TableCell>{paymentBadge(u.payment_status)}</TableCell>
                  <TableCell>{statusBadge(u.user_status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[u.state, u.district].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell>
                      <div className="flex gap-1 items-center">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setSelectedUser(u)} title="View Details">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {u.user_status !== "approved" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                            onClick={() => handleApprove(u.id)}
                            disabled={actionLoading === u.id}
                            title="Approve"
                          >
                            {actionLoading === u.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                        {u.user_status !== "rejected" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive/80"
                            onClick={() => handleReject(u.id)}
                            disabled={actionLoading === u.id}
                            title="Reject"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedUser.name || "—"}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-mono">{selectedUser.phone || "—"}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span>{selectedUser.email || "—"}</span></div>
                <div><span className="text-muted-foreground">Designation:</span> <span>{selectedUser.designation || "—"}</span></div>
                <div><span className="text-muted-foreground">State:</span> <span>{selectedUser.state || "—"}</span></div>
                <div><span className="text-muted-foreground">District:</span> <span>{selectedUser.district || "—"}</span></div>
                <div><span className="text-muted-foreground">Block:</span> <span>{selectedUser.block || "—"}</span></div>
                <div><span className="text-muted-foreground">Payment:</span> {paymentBadge(selectedUser.payment_status)}</div>
                <div><span className="text-muted-foreground">Status:</span> {statusBadge(selectedUser.user_status)}</div>
                <div><span className="text-muted-foreground">Txn ID:</span> <span className="font-mono text-xs">{selectedUser.registration_transaction_id || "—"}</span></div>
              </div>
              {selectedUser.payment_screenshot_url && (
                <div>
                  <p className="text-muted-foreground mb-1">Payment Screenshot:</p>
                  <img src={selectedUser.payment_screenshot_url} alt="Payment Screenshot" className="rounded-lg border max-h-48 object-contain" />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {selectedUser.user_status !== "approved" && (
                  <Button size="sm" className="flex-1 active:scale-[0.97]" onClick={() => { handleApprove(selectedUser.id); setSelectedUser(null); }}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve
                  </Button>
                )}
                {selectedUser.user_status !== "rejected" && (
                  <Button size="sm" variant="destructive" className="flex-1 active:scale-[0.97]" onClick={() => { handleReject(selectedUser.id); setSelectedUser(null); }}>
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
