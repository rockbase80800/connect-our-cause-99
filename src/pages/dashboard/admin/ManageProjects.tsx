import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  about: string | null;
  status: string;
  created_at: string;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export default function ManageProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [about, setAbout] = useState("");
  const [status, setStatus] = useState("active");
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects((data as Project[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setAbout("");
    setStatus("active");
    setFormFields([{ name: "full_name", label: "Full Name", type: "text", required: true }]);
    setDialogOpen(true);
  };

  const openEdit = async (proj: Project) => {
    setEditing(proj);
    setTitle(proj.title);
    setDescription(proj.description ?? "");
    setImageUrl(proj.image_url ?? "");
    setAbout(proj.about ?? "");
    setStatus(proj.status);

    const { data } = await supabase
      .from("form_schemas")
      .select("fields")
      .eq("project_id", proj.id)
      .single();
    setFormFields((data?.fields as unknown as FormField[]) ?? []);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);

    if (editing) {
      const { error } = await supabase
        .from("projects")
        .update({ title, description, image_url: imageUrl || null, about, status: status as any })
        .eq("id", editing.id);
      if (error) { toast.error(error.message); setSaving(false); return; }

      // Update form schema
      await supabase.from("form_schemas").delete().eq("project_id", editing.id);
      await supabase.from("form_schemas").insert({ project_id: editing.id, fields: formFields as any });

      toast.success("Project updated");
    } else {
      const { data: newProj, error } = await supabase
        .from("projects")
        .insert({ title, description, image_url: imageUrl || null, about, status: status as any })
        .select()
        .single();
      if (error) { toast.error(error.message); setSaving(false); return; }

      // Create form schema
      if (newProj) {
        await supabase.from("form_schemas").insert({
          project_id: newProj.id,
          fields: formFields as any,
        });
      }
      toast.success("Project created");
    }

    setSaving(false);
    setDialogOpen(false);
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Project deleted");
      fetchProjects();
    }
  };

  const addField = () => {
    setFormFields([
      ...formFields,
      { name: `field_${Date.now()}`, label: "", type: "text", required: false },
    ]);
  };

  const updateFormField = (idx: number, key: keyof FormField, value: any) => {
    const updated = [...formFields];
    (updated[idx] as any)[key] = value;
    if (key === "label") {
      updated[idx].name = value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    }
    setFormFields(updated);
  };

  const removeField = (idx: number) => {
    setFormFields(formFields.filter((_, i) => i !== idx));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display text-2xl text-foreground">Manage Projects</h1>
        <Button onClick={openCreate} className="active:scale-[0.97]">
          <Plus className="h-4 w-4 mr-1" /> New Project
        </Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={p.status === "active" ? "bg-success/10 text-success border-success/30" : ""}>
                    {p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Project" : "Create Project"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>About (detailed)</Label>
              <Textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Form Builder */}
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base">Application Form Fields</Label>
                <Button type="button" variant="outline" size="sm" onClick={addField}>
                  <Plus className="h-3 w-3 mr-1" /> Add Field
                </Button>
              </div>
              {formFields.map((f, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 mb-2 items-end">
                  <div>
                    <Input
                      placeholder="Field label"
                      value={f.label}
                      onChange={(e) => updateFormField(i, "label", e.target.value)}
                    />
                  </div>
                  <Select value={f.type} onValueChange={(v) => updateFormField(i, "type", v)}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant={f.required ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFormField(i, "required", !f.required)}
                    className="text-xs"
                  >
                    Req
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeField(i)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="active:scale-[0.97]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save Changes" : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
