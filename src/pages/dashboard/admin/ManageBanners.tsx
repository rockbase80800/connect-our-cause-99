import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Pencil, Trash2, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export default function ManageBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(false);

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("created_at", { ascending: false });
    setBanners((data as Banner[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const openCreate = () => {
    setEditing(null); setTitle(""); setDescription(""); setImageUrl(""); setIsActive(true);
    setDialogOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditing(b); setTitle(b.title); setDescription(b.description ?? "");
    setImageUrl(b.image_url ?? ""); setIsActive(b.is_active);
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    const path = `${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("banner-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("banner-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    if (editing) {
      const { error } = await supabase.from("banners").update({ title, description, image_url: imageUrl || null, is_active: isActive }).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Banner updated");
    } else {
      const { error } = await supabase.from("banners").insert({ title, description, image_url: imageUrl || null, is_active: isActive });
      if (error) toast.error(error.message); else toast.success("Banner created");
    }
    setSaving(false); setDialogOpen(false); fetchBanners();
  };

  const confirmDelete = (id: string) => { setDeletingId(id); setDeleteOpen(true); };

  const handleDelete = async () => {
    if (!deletingId) return;
    const { error } = await supabase.from("banners").delete().eq("id", deletingId);
    if (error) toast.error(error.message); else { toast.success("Banner deleted"); fetchBanners(); }
    setDeleteOpen(false);
  };

  const toggleActive = async (b: Banner) => {
    const { error } = await supabase.from("banners").update({ is_active: !b.is_active }).eq("id", b.id);
    if (error) toast.error(error.message); else fetchBanners();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display text-2xl text-foreground">Manage Banners</h1>
        <Button onClick={openCreate} className="active:scale-[0.97]"><Plus className="h-4 w-4 mr-1" /> New Banner</Button>
      </div>

      <div className="grid gap-4">
        {banners.length === 0 && <p className="text-muted-foreground text-sm">No banners yet.</p>}
        {banners.map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {b.image_url ? (
                  <img src={b.image_url} alt="" className="h-32 sm:w-48 object-cover" />
                ) : (
                  <div className="h-32 sm:w-48 bg-muted flex items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
                )}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{b.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{b.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Switch checked={b.is_active} onCheckedChange={() => toggleActive(b)} />
                      <span className="text-xs text-muted-foreground">{b.is_active ? "Active" : "Inactive"}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => confirmDelete(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Banner" : "Create Banner"}</DialogTitle>
            <DialogDescription>Configure the dashboard banner content and image.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div>
              <Label>Image</Label>
              <div className="mt-1 space-y-2">
                {imageUrl && <img src={imageUrl} alt="Preview" className="h-28 w-full object-cover rounded-lg border" />}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="relative" disabled={uploading}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                    {uploading ? "Uploading..." : "Upload"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </Button>
                  {imageUrl && <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl("")}>Remove</Button>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>Are you sure you want to delete this banner? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
