import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Loader2, ArrowLeft, ExternalLink, Pencil, Trash2, Eye, Search,
  Users, CheckCircle, Clock, XCircle, CreditCard, Upload, Plus, X,
  FileText, Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/30",
  under_review: "bg-info/10 text-info border-info/30",
  approved: "bg-success/10 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

function isFileUrl(val: any): boolean {
  if (typeof val !== "string") return false;
  return val.includes("supabase.co/storage") || val.match(/\.(jpg|jpeg|png|gif|webp|pdf)(\?|$)/i) !== null;
}

function isImageUrl(val: any): boolean {
  if (typeof val !== "string") return false;
  return val.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) !== null;
}

interface AppRow {
  id: string;
  user_id: string;
  form_data: Record<string, any>;
  status: string;
  payment_status?: string;
  transaction_id?: string;
  rejection_reason: string | null;
  created_at: string;
  profiles: { name: string | null; email: string | null; phone: string | null } | null;
}

interface GalleryImage {
  id: string;
  image_url: string;
}

export default function ProjectDashboard() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, primaryRole } = useAuth();
  const isSuperAdmin = primaryRole === "super_admin";

  const [project, setProject] = useState<any>(null);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Review dialog
  const [selected, setSelected] = useState<AppRow | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);

  // Gallery upload
  const [uploadingGallery, setUploadingGallery] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    const fetchAll = async () => {
      const [{ data: proj }, { data: appData }, { data: imgs }] = await Promise.all([
        supabase.from("projects").select("*").eq("id", projectId).single(),
        supabase.from("applications").select("*, profiles!applications_user_id_fkey(name, email, phone)").eq("project_id", projectId).order("created_at", { ascending: false }),
        supabase.from("project_images").select("*").eq("project_id", projectId).order("created_at"),
      ]);
      setProject(proj);
      setApps((appData as unknown as AppRow[]) ?? []);
      setGallery((imgs as unknown as GalleryImage[]) ?? []);
      setLoading(false);
    };
    fetchAll();
  }, [projectId]);

  // Stats
  const stats = useMemo(() => {
    const total = apps.length;
    const pending = apps.filter(a => a.status === "pending").length;
    const approved = apps.filter(a => a.status === "approved").length;
    const rejected = apps.filter(a => a.status === "rejected").length;
    const paid = apps.filter(a => (a as any).payment_status === "paid").length;
    const unpaid = total - paid;
    return { total, pending, approved, rejected, paid, unpaid };
  }, [apps]);

  // Filtered
  const filtered = useMemo(() => {
    return apps.filter(a => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (paymentFilter !== "all" && (a as any).payment_status !== paymentFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = (a.profiles?.name || a.form_data?.full_name || "").toLowerCase();
        const email = (a.profiles?.email || a.form_data?.email || "").toLowerCase();
        if (!name.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [apps, statusFilter, paymentFilter, search]);

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
        await supabase.from("project_members").insert({ user_id: selected.user_id, project_id: projectId! });
      }
      toast.success("Application updated");
      setSelected(null);
      // Refresh
      const { data } = await supabase.from("applications").select("*, profiles!applications_user_id_fkey(name, email, phone)").eq("project_id", projectId!).order("created_at", { ascending: false });
      setApps((data as unknown as AppRow[]) ?? []);
    }
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (!projectId || !confirm("Are you sure you want to delete this project? All applications will be lost.")) return;
    await supabase.from("applications").delete().eq("project_id", projectId);
    await supabase.from("form_schemas").delete().eq("project_id", projectId);
    await supabase.from("project_images").delete().eq("project_id", projectId);
    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (error) { toast.error(error.message); return; }
    toast.success("Project deleted");
    navigate("/dashboard/admin/projects");
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !projectId) return;
    setUploadingGallery(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const path = `gallery/${projectId}/${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error } = await supabase.storage.from("project-images").upload(path, file);
      if (error) { toast.error(error.message); continue; }
      const { data: urlData } = supabase.storage.from("project-images").getPublicUrl(path);
      await supabase.from("project_images").insert({ project_id: projectId, image_url: urlData.publicUrl });
    }
    const { data: imgs } = await supabase.from("project_images").select("*").eq("project_id", projectId).order("created_at");
    setGallery((imgs as unknown as GalleryImage[]) ?? []);
    setUploadingGallery(false);
    toast.success("Images uploaded");
    e.target.value = "";
  };

  const deleteGalleryImage = async (img: GalleryImage) => {
    await supabase.from("project_images").delete().eq("id", img.id);
    setGallery(prev => prev.filter(g => g.id !== img.id));
    toast.success("Image removed");
  };

  const handleExport = () => {
    const rows = filtered.map(a => ({
      Name: a.form_data?.full_name || a.profiles?.name || "—",
      Email: a.profiles?.email || a.form_data?.email || "—",
      Mobile: a.form_data?.mobile_number || a.profiles?.phone || "—",
      Status: a.status,
      Payment: (a as any).payment_status || "unpaid",
      "Transaction ID": (a as any).transaction_id || "—",
      Date: new Date(a.created_at).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    XLSX.writeFile(wb, `${project?.title || "project"}_applications.xlsx`);
    toast.success("Excel downloaded");
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Access denied. Super Admin only.</p>
        <Link to="/dashboard/admin/projects"><Button variant="outline" className="mt-4">Go Back</Button></Link>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Project not found</p>
        <Link to="/dashboard/admin/projects"><Button variant="outline" className="mt-4">Go Back</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/admin/projects">
            <Button variant="ghost" size="icon" className="shrink-0"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-display text-2xl text-foreground">{project.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={project.status === "active" ? "bg-success/10 text-success border-success/30" : "bg-muted text-muted-foreground"}>
                {project.status}
              </Badge>
              <span className="text-xs text-muted-foreground">Created {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to={`/project/${projectId}`} target="_blank">
            <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4 mr-1" /> View Public</Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleExport}><FileText className="h-4 w-4 mr-1" /> Export Excel</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
        </div>
      </div>

      {/* Project Info Card */}
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-[1fr_200px] gap-6">
            <div className="space-y-3">
              {project.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-foreground">{project.description}</p>
                </div>
              )}
              {project.about && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">About</p>
                  <p className="text-sm text-foreground whitespace-pre-line">{project.about}</p>
                </div>
              )}
            </div>
            {project.image_url && (
              <img src={project.image_url} alt={project.title} className="rounded-xl w-full h-36 object-cover border" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Users, color: "text-primary" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-warning" },
          { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-success" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-destructive" },
          { label: "Paid", value: stats.paid, icon: CreditCard, color: "text-success" },
          { label: "Unpaid", value: stats.unpaid, icon: CreditCard, color: "text-warning" },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
              <div>
                <p className="text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gallery */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Gallery ({gallery.length})</CardTitle>
            <Button variant="outline" size="sm" className="relative" disabled={uploadingGallery}>
              {uploadingGallery ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              {uploadingGallery ? "Uploading..." : "Add Images"}
              <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {gallery.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No gallery images yet</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {gallery.map(img => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border">
                  <img src={img.image_url} alt="" className="h-20 w-full object-cover" />
                  <button onClick={() => deleteGalleryImage(img)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3.5 w-3.5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
          <Search className="h-4 w-4" /> Filter Applications
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input placeholder="Search name/email..." value={search} onChange={e => setSearch(e.target.value)} />
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
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger><SelectValue placeholder="Payment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Applications Table */}
      <p className="text-sm text-muted-foreground">{filtered.length} application{filtered.length !== 1 ? "s" : ""}</p>
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No applications found</TableCell></TableRow>
              )}
              {filtered.map(app => (
                <TableRow key={app.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{app.form_data?.full_name || app.profiles?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{app.profiles?.email}</p>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{app.form_data?.mobile_number || app.profiles?.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[app.status] || ""}>{app.status.replace("_", " ")}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={(app as any).payment_status === "paid" ? "bg-success/10 text-success border-success/30" : "bg-warning/10 text-warning border-warning/30"}>
                      {(app as any).payment_status === "paid" ? "✅ Paid" : "❌ Unpaid"}
                    </Badge>
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
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selected.form_data?.full_name || selected.profiles?.name}</span></div>
                <div><span className="text-muted-foreground">Mobile:</span> <span className="font-medium font-mono">{selected.form_data?.mobile_number || selected.profiles?.phone}</span></div>
                <div><span className="text-muted-foreground">Payment:</span> <span className="font-medium">{(selected as any).payment_status === "paid" ? "✅ Paid" : "❌ Unpaid"}</span></div>
                {(selected as any).transaction_id && (
                  <div><span className="text-muted-foreground">Txn ID:</span> <span className="font-medium font-mono">{(selected as any).transaction_id}</span></div>
                )}
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Form Responses</p>
                {Object.entries(selected.form_data).map(([key, val]) => {
                  const label = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
                  if (isFileUrl(val)) {
                    return (
                      <div key={key} className="flex items-center justify-between py-1.5 text-sm border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{label}</span>
                        <div className="flex items-center gap-2">
                          {isImageUrl(val) ? <img src={String(val)} alt={label} className="h-12 w-12 rounded object-cover border" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                          <a href={String(val)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs inline-flex items-center gap-1">
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
                  <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Provide a reason..." />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updating} className="active:scale-[0.97]">
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
