import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Upload, ImageIcon, X, ChevronUp, ChevronDown, RotateCcw, Eye, Download, FileText } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_HINDI_FIELDS: FormField[] = [
  { name: "full_name", label: "पूरा नाम (Full Name)", type: "text", required: true, placeholder: "अपना पूरा नाम लिखें" },
  { name: "father_mother_name", label: "पिता/माता का नाम (Father/Mother Name)", type: "text", required: true, placeholder: "पिता या माता का नाम लिखें" },
  { name: "age", label: "उम्र (Age)", type: "number", required: true, placeholder: "आपकी उम्र" },
  { name: "gender", label: "लिंग (Gender)", type: "select", required: true, options: ["पुरुष (Male)", "महिला (Female)", "अन्य (Other)"] },
  { name: "mobile_number", label: "मोबाइल नंबर (Mobile Number)", type: "text", required: true, placeholder: "10 अंकों का मोबाइल नंबर" },
  { name: "whatsapp_number", label: "व्हाट्सएप नंबर (WhatsApp Number)", type: "text", required: false, placeholder: "व्हाट्सएप नंबर (वैकल्पिक)" },
  { name: "email", label: "ईमेल आईडी (Email ID)", type: "email", required: false, placeholder: "example@email.com" },
  { name: "full_address", label: "पूरा पता (Full Address)", type: "textarea", required: true, placeholder: "अपना पूरा पता लिखें" },
  { name: "state", label: "राज्य (State)", type: "text", required: true, placeholder: "राज्य का नाम" },
  { name: "district", label: "जिला (District)", type: "text", required: true, placeholder: "जिले का नाम" },
  { name: "block", label: "ब्लॉक (Block)", type: "text", required: true, placeholder: "ब्लॉक का नाम" },
  { name: "panchayat_village", label: "पंचायत/गाँव (Panchayat/Village)", type: "text", required: true, placeholder: "पंचायत या गाँव का नाम" },
  { name: "qualification", label: "शैक्षिक योग्यता (Qualification)", type: "select", required: true, options: ["10वीं (10th)", "12वीं (12th)", "स्नातक (Graduate)", "स्नातकोत्तर (Post Graduate)", "अन्य (Other)"] },
  { name: "position_applied", label: "आवेदित पद (Position Applied For)", type: "select", required: true, options: ["स्वयंसेवक (Volunteer)", "समन्वयक (Coordinator)", "पर्यवेक्षक (Supervisor)", "अन्य (Other)"] },
  { name: "photo", label: "फोटो अपलोड करें (Upload Photo)", type: "file", required: true },
  { name: "aadhar_card", label: "आधार कार्ड अपलोड करें (Upload Aadhar Card)", type: "file", required: true },
  { name: "bank_passbook", label: "बैंक पासबुक अपलोड करें (Upload Bank Passbook)", type: "file", required: true },
  { name: "declaration", label: "मैं पुष्टि करता/करती हूँ कि सभी जानकारी सही है और मैं दिशानिर्देशों का पालन करने के लिए सहमत हूँ।", type: "checkbox", required: true },
];

interface Project {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  about: string | null;
  status: string;
  created_at: string;
  form_link: string | null;
  download_file_url: string | null;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
}

export default function ManageProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [about, setAbout] = useState("");
  const [status, setStatus] = useState("active");
  const [formLink, setFormLink] = useState("");
  const [downloadFileUrl, setDownloadFileUrl] = useState("");
  const [uploadingDownloadFile, setUploadingDownloadFile] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    setProjects((data as Project[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const fetchGalleryImages = async (projectId: string) => {
    const { data } = await supabase
      .from("project_images")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });
    setGalleryImages((data as GalleryImage[]) ?? []);
  };

  const openCreate = () => {
    setEditing(null);
    setTitle(""); setDescription(""); setImageUrl(""); setAbout(""); setStatus("active"); setFormLink(""); setDownloadFileUrl("");
    setFormFields(DEFAULT_HINDI_FIELDS.map(f => ({ ...f })));
    setGalleryImages([]);
    setDialogOpen(true);
  };

  const openEdit = async (proj: Project) => {
    setEditing(proj);
    setTitle(proj.title); setDescription(proj.description ?? ""); setImageUrl(proj.image_url ?? "");
    setAbout(proj.about ?? ""); setStatus(proj.status); setFormLink(proj.form_link ?? ""); setDownloadFileUrl(proj.download_file_url ?? "");
    const { data } = await supabase.from("form_schemas").select("fields").eq("project_id", proj.id).single();
    setFormFields((data?.fields as unknown as FormField[]) ?? []);
    await fetchGalleryImages(proj.id);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("project-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from("project-images").getPublicUrl(path);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editing) return;

    setUploadingGallery(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const path = `gallery/${editing.id}/${Date.now()}_${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error } = await supabase.storage.from("project-images").upload(path, file);
      if (error) { toast.error(error.message); continue; }

      const { data: urlData } = supabase.storage.from("project-images").getPublicUrl(path);
      await supabase.from("project_images").insert({
        project_id: editing.id,
        image_url: urlData.publicUrl,
      });
    }
    await fetchGalleryImages(editing.id);
    setUploadingGallery(false);
    toast.success("Gallery images uploaded");
    e.target.value = "";
  };

  const deleteGalleryImage = async (img: GalleryImage) => {
    await supabase.from("project_images").delete().eq("id", img.id);
    setGalleryImages((prev) => prev.filter((g) => g.id !== img.id));
    toast.success("Image removed");
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);

    if (editing) {
      const { error } = await supabase
        .from("projects")
        .update({ title, description, image_url: imageUrl || null, about, status: status as any, form_link: formLink || null, download_file_url: downloadFileUrl || null } as any)
        .eq("id", editing.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      await supabase.from("form_schemas").delete().eq("project_id", editing.id);
      await supabase.from("form_schemas").insert({ project_id: editing.id, fields: formFields as any });
      toast.success("Project updated");
    } else {
      const { data: newProj, error } = await supabase
        .from("projects")
        .insert({ title, description, image_url: imageUrl || null, about, status: status as any, form_link: formLink || null, download_file_url: downloadFileUrl || null } as any)
        .select().single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      if (newProj) {
        await supabase.from("form_schemas").insert({ project_id: newProj.id, fields: formFields as any });
      }
      toast.success("Project created");
    }
    setSaving(false); setDialogOpen(false); fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Project deleted"); fetchProjects(); }
  };

  const addField = () => {
    setFormFields([...formFields, { name: `field_${Date.now()}`, label: "", type: "text", required: false }]);
  };

  const updateFormField = (idx: number, key: keyof FormField, value: any) => {
    const updated = [...formFields];
    (updated[idx] as any)[key] = value;
    if (key === "label") updated[idx].name = value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    setFormFields(updated);
  };

  const removeField = (idx: number) => setFormFields(formFields.filter((_, i) => i !== idx));

  const moveField = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= formFields.length) return;
    const updated = [...formFields];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    setFormFields(updated);
  };

  const loadDefaultFields = () => {
    if (formFields.length > 0 && !confirm("यह मौजूदा फील्ड्स को बदल देगा। क्या आप जारी रखना चाहते हैं?")) return;
    setFormFields(DEFAULT_HINDI_FIELDS.map(f => ({ ...f })));
    toast.success("डिफ़ॉल्ट हिंदी फील्ड्स लोड हो गई");
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display text-2xl text-foreground">Manage Projects</h1>
        <Button onClick={openCreate} className="active:scale-[0.97]"><Plus className="h-4 w-4 mr-1" /> New Project</Button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="h-10 w-14 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-14 rounded bg-muted flex items-center justify-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{p.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={p.status === "active" ? "bg-success/10 text-success border-success/30" : ""}>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Link to={`/dashboard/admin/project/${p.id}`}>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Project" : "Create Project"}</DialogTitle>
            <DialogDescription>Fill in the project details and configure the application form fields.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>

            {/* Cover Image Upload */}
            <div>
              <Label>Cover Image</Label>
              <div className="mt-1 space-y-2">
                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="h-32 w-full object-cover rounded-lg border border-border" />
                )}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="relative" disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                  {imageUrl && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl("")}>Remove</Button>
                  )}
                </div>
              </div>
            </div>

            {/* Gallery Images — only for existing projects */}
            {editing && (
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base">Gallery Images</Label>
                  <Button type="button" variant="outline" size="sm" className="relative" disabled={uploadingGallery}>
                    {uploadingGallery ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                    {uploadingGallery ? "Uploading..." : "Add Images"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </Button>
                </div>
                {galleryImages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No gallery images yet. Add images to show on the project page.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {galleryImages.map((img) => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border">
                        <img src={img.image_url} alt="" className="h-20 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => deleteGalleryImage(img)}
                          className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div><Label>About (detailed)</Label><Textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={4} /></div>
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

            {/* Form Link */}
            <div className="border-t border-border pt-4">
              <Label className="text-base font-semibold">Form Link (External)</Label>
              <p className="text-xs text-muted-foreground mb-2">अगर आप बाहरी फॉर्म लिंक देना चाहते हैं तो यहाँ URL डालें। अगर यह भरा है और नीचे कोई form field नहीं है, तो यूज़र को यह लिंक दिखेगा।</p>
              <Input placeholder="https://forms.google.com/..." value={formLink} onChange={(e) => setFormLink(e.target.value)} />
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <Label className="text-base font-semibold">Application Form Fields ({formFields.length})</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={loadDefaultFields}>
                    <RotateCcw className="h-3 w-3 mr-1" /> डिफ़ॉल्ट फील्ड्स लोड करें
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={addField}>
                    <Plus className="h-3 w-3 mr-1" /> Add Field
                  </Button>
                </div>
              </div>
              {formFields.length === 0 && !formLink && (
                <div className="text-center py-6 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground text-sm mb-2">कोई फील्ड नहीं है</p>
                  <Button type="button" variant="outline" size="sm" onClick={loadDefaultFields}>
                    <RotateCcw className="h-3 w-3 mr-1" /> डिफ़ॉल्ट हिंदी फॉर्म लोड करें
                  </Button>
                </div>
              )}
              {formFields.length === 0 && formLink && (
                <div className="text-center py-4 border border-dashed border-primary/30 rounded-lg bg-primary/5">
                  <p className="text-sm text-primary font-medium">✓ External form link set — users will see "Form Link" button</p>
                </div>
              )}
              {formFields.map((f, i) => (
                <div key={i} className="mb-3 p-3 border border-border rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs text-muted-foreground font-mono w-6 shrink-0">{i + 1}.</span>
                    <Input placeholder="Field label" value={f.label} onChange={(e) => updateFormField(i, "label", e.target.value)} className="text-sm" />
                    <Select value={f.type} onValueChange={(v) => updateFormField(i, "type", v)}>
                      <SelectTrigger className="w-28 shrink-0"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="textarea">Textarea</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="file">File Upload</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" variant={f.required ? "default" : "outline"} size="icon" className="h-8 w-8 shrink-0 text-xs" onClick={() => updateFormField(i, "required", !f.required)} title={f.required ? "Required" : "Optional"}>
                      {f.required ? "R" : "O"}
                    </Button>
                    <div className="flex flex-col shrink-0">
                      <Button type="button" variant="ghost" size="icon" className="h-4 w-8" onClick={() => moveField(i, -1)} disabled={i === 0}><ChevronUp className="h-3 w-3" /></Button>
                      <Button type="button" variant="ghost" size="icon" className="h-4 w-8" onClick={() => moveField(i, 1)} disabled={i === formFields.length - 1}><ChevronDown className="h-3 w-3" /></Button>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeField(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                  {f.type === "select" && (
                    <Input
                      placeholder="Options (comma separated)"
                      value={(f.options || []).join(", ")}
                      onChange={(e) => updateFormField(i, "options", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                      className="text-xs mt-1"
                    />
                  )}
                  {f.type !== "select" && f.type !== "checkbox" && f.type !== "file" && (
                    <Input
                      placeholder="Placeholder text"
                      value={f.placeholder || ""}
                      onChange={(e) => updateFormField(i, "placeholder", e.target.value)}
                      className="text-xs mt-1"
                    />
                  )}
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