import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

interface AppRow {
  id: string;
  user_id: string;
  project_id: string;
  form_data: Record<string, any>;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  profiles: { name: string | null; email: string | null } | null;
  projects: { title: string } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/30",
  under_review: "bg-info/10 text-info border-info/30",
  approved: "bg-success/10 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function ManageApplications() {
  const { user, primaryRole } = useAuth();
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AppRow | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchApps = async () => {
    const { data } = await supabase
      .from("applications")
      .select("*, profiles!applications_user_id_fkey(name, email), projects(title)")
      .order("created_at", { ascending: false });
    setApps((data as unknown as AppRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleUpdate = async () => {
    if (!selected || !newStatus || !user) return;
    setUpdating(true);

    const updateData: any = {
      status: newStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    };
    if (newStatus === "rejected") updateData.rejection_reason = reason;

    const { error } = await supabase
      .from("applications")
      .update(updateData)
      .eq("id", selected.id);

    if (error) {
      toast.error(error.message);
    } else {
      // If approved, add to project members
      if (newStatus === "approved") {
        await supabase.from("project_members").insert({
          user_id: selected.user_id,
          project_id: selected.project_id,
        });
      }
      toast.success("Application updated");
      setSelected(null);
      fetchApps();
    }
    setUpdating(false);
  };

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-display text-2xl text-foreground">Manage Applications</h1>

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "under_review", "approved", "rejected"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(s)}
            className="active:scale-[0.97]"
          >
            {s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </Button>
        ))}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{app.profiles?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{app.profiles?.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{app.projects?.title ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[app.status] || ""}>
                    {app.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(app.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelected(app);
                      setNewStatus(app.status);
                      setReason(app.rejection_reason || "");
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Applicant:</span>{" "}
                <span className="font-medium">{selected.profiles?.name}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Project:</span>{" "}
                <span className="font-medium">{selected.projects?.title}</span>
              </div>

              {/* Form data */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Form Responses</p>
                {Object.entries(selected.form_data).map(([key, val]) => (
                  <div key={key} className="flex justify-between py-1 text-sm border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-medium text-foreground">{String(val)}</span>
                  </div>
                ))}
              </div>

              {primaryRole === "super_admin" && (
                <>
                  <div>
                    <label className="text-sm font-medium">Update Status</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
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
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            {primaryRole === "super_admin" && (
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
