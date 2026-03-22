import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye, Download, Search, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface AppRow {
  id: string;
  user_id: string;
  project_id: string;
  form_data: Record<string, any>;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  profiles: { name: string | null; email: string | null; phone: string | null; state: string | null; district: string | null; block: string | null } | null;
  projects: { title: string } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/30",
  under_review: "bg-info/10 text-info border-info/30",
  approved: "bg-success/10 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return digits.slice(0, 2) + "X".repeat(digits.length - 4) + digits.slice(-2);
}

function isFileUrl(val: any): boolean {
  if (typeof val !== "string") return false;
  return val.includes("supabase.co/storage") || val.match(/\.(jpg|jpeg|png|gif|webp|pdf)(\?|$)/i) !== null;
}

function isImageUrl(val: any): boolean {
  if (typeof val !== "string") return false;
  return val.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) !== null || (val.includes("supabase.co/storage") && !val.match(/\.pdf(\?|$)/i));
}

export default function ManageApplications() {
  const { user, primaryRole, profile: myProfile } = useAuth();
  const isSuperAdmin = primaryRole === "super_admin";
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AppRow | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [blockFilter, setBlockFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchApps = async () => {
    const { data } = await supabase
      .from("applications")
      .select("*, profiles!applications_user_id_fkey(name, email, phone, state, district, block), projects(title)")
      .order("created_at", { ascending: false });
    setApps((data as unknown as AppRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, []);

  const handleUpdate = async () => {
    if (!selected || !newStatus || !user) return;
    setUpdating(true);
    const updateData: any = {
      status: newStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    };
    if (newStatus === "rejected") updateData.rejection_reason = reason;
    const { error } = await supabase.from("applications").update(updateData).eq("id", selected.id);
    if (error) {
      toast.error(error.message);
    } else {
      if (newStatus === "approved") {
        await supabase.from("project_members").insert({ user_id: selected.user_id, project_id: selected.project_id });
      }
      toast.success("Application updated");
      setSelected(null);
      fetchApps();
    }
    setUpdating(false);
  };

  // Unique values for filters
  const districts = useMemo(() => [...new Set(apps.map(a => a.form_data?.district || a.profiles?.district).filter(Boolean))].sort(), [apps]);
  const blocks = useMemo(() => {
    const base = districtFilter === "all" ? apps : apps.filter(a => (a.form_data?.district || a.profiles?.district) === districtFilter);
    return [...new Set(base.map(a => a.form_data?.block || a.profiles?.block).filter(Boolean))].sort();
  }, [apps, districtFilter]);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      const d = a.form_data?.district || a.profiles?.district || "";
      const b = a.form_data?.block || a.profiles?.block || "";
      if (districtFilter !== "all" && d !== districtFilter) return false;
      if (blockFilter !== "all" && b !== blockFilter) return false;
      if (dateFrom && new Date(a.created_at) < new Date(dateFrom)) return false;
      if (dateTo && new Date(a.created_at) > new Date(dateTo + "T23:59:59")) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = (a.profiles?.name || "").toLowerCase();
        const email = (a.profiles?.email || "").toLowerCase();
        const proj = (a.projects?.title || "").toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !proj.includes(q)) return false;
      }
      return true;
    });
  }, [apps, statusFilter, districtFilter, blockFilter, dateFrom, dateTo, search]);

  const handleExportExcel = () => {
    if (!isSuperAdmin) return;
    const rows = filtered.map((a) => ({
      Name: a.profiles?.name || a.form_data?.full_name || "—",
      Email: a.profiles?.email || a.form_data?.email || "—",
      Mobile: a.profiles?.phone || a.form_data?.mobile || "—",
      WhatsApp: a.form_data?.whatsapp || "—",
      State: a.form_data?.state || a.profiles?.state || "—",
      District: a.form_data?.district || a.profiles?.district || "—",
      Block: a.form_data?.block || a.profiles?.block || "—",
      Panchayat: a.form_data?.panchayat || "—",
      Position: a.form_data?.position || "—",
      Qualification: a.form_data?.qualification || "—",
      Project: a.projects?.title || "—",
      Status: a.status,
      Date: new Date(a.created_at).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    XLSX.writeFile(wb, `applications_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Excel downloaded");
  };

  const getDisplayPhone = (app: AppRow, field: string = "mobile") => {
    const phone = app.form_data?.[field] || (field === "mobile" ? app.profiles?.phone : null);
    if (!phone) return "—";
    return isSuperAdmin ? phone : maskPhone(phone);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-display text-2xl text-foreground">Manage Applications</h1>
        {isSuperAdmin && (
          <Button onClick={handleExportExcel} size="sm" className="active:scale-[0.97]">
            <Download className="h-4 w-4 mr-2" /> Download Excel
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Search className="h-4 w-4" /> Filters
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Input placeholder="Search name/email..." value={search} onChange={(e) => setSearch(e.target.value)} className="col-span-2 md:col-span-1" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={districtFilter} onValueChange={(v) => { setDistrictFilter(v); setBlockFilter("all"); }}>
            <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={blockFilter} onValueChange={setBlockFilter}>
            <SelectTrigger><SelectValue placeholder="Block" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blocks</SelectItem>
              {blocks.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} application{filtered.length !== 1 ? "s" : ""} found</p>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No applications found</TableCell></TableRow>
              )}
              {filtered.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{app.form_data?.full_name || app.profiles?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{app.profiles?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{getDisplayPhone(app)}</TableCell>
                  <TableCell className="text-sm">{app.form_data?.district || app.profiles?.district || "—"}</TableCell>
                  <TableCell className="text-sm">{app.form_data?.position || "—"}</TableCell>
                  <TableCell className="text-sm">{app.projects?.title ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[app.status] || ""}>{app.status.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => { setSelected(app); setNewStatus(app.status); setReason(app.rejection_reason || ""); }}>
                      <Eye className="h-4 w-4 mr-1" /> Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Applicant:</span> <span className="font-medium">{selected.form_data?.full_name || selected.profiles?.name}</span></div>
                <div><span className="text-muted-foreground">Project:</span> <span className="font-medium">{selected.projects?.title}</span></div>
                <div><span className="text-muted-foreground">Mobile:</span> <span className="font-medium font-mono">{getDisplayPhone(selected)}</span></div>
                <div><span className="text-muted-foreground">WhatsApp:</span> <span className="font-medium font-mono">{getDisplayPhone(selected, "whatsapp")}</span></div>
              </div>

              {/* Form data */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Form Responses</p>
                {Object.entries(selected.form_data).map(([key, val]) => {
                  const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  // Phone masking for non-super_admin
                  if (!isSuperAdmin && (key === "mobile" || key === "whatsapp" || key === "whatsapp_number" || key === "mobile_number")) {
                    return (
                      <div key={key} className="flex justify-between py-1.5 text-sm border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium font-mono text-foreground">{maskPhone(String(val))}</span>
                      </div>
                    );
                  }
                  // File/image display
                  if (isFileUrl(val)) {
                    return (
                      <div key={key} className="flex items-center justify-between py-1.5 text-sm border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{label}</span>
                        <div className="flex items-center gap-2">
                          {isImageUrl(val) ? (
                            <img src={String(val)} alt={label} className="h-12 w-12 rounded object-cover border" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                          <a href={String(val)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 text-xs">
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="flex justify-between py-1.5 text-sm border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium text-foreground text-right max-w-[60%]">{String(val)}</span>
                    </div>
                  );
                })}
              </div>

              {(isSuperAdmin || primaryRole === "admin" || primaryRole === "state_admin") && (
                <>
                  <div>
                    <label className="text-sm font-medium">Update Status</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newStatus === "rejected" && (
                    <div>
                      <label className="text-sm font-medium">Rejection Reason</label>
                      <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide a reason..." />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            {(isSuperAdmin || primaryRole === "admin" || primaryRole === "state_admin") && (
              <Button onClick={handleUpdate} disabled={updating} className="active:scale-[0.97]">
                {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
