import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface HomepageAdmin {
  id: string;
  user_id: string;
  name: string;
  photo_url: string | null;
  designation: string | null;
}

export default function ManageHomepageAdmins() {
  const [admins, setAdmins] = useState<HomepageAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from("homepage_admins" as any)
      .select("*")
      .order("created_at");
    setAdmins((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `homepage-admin-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("website-assets").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("website-assets").getPublicUrl(path);
    setPhotoUrl(data.publicUrl);
    setUploading(false);
  };

  const handleAdd = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (admins.length >= 5) { toast.error("Maximum 5 admins allowed"); return; }
    setSaving(true);
    const { error } = await supabase.from("homepage_admins" as any).insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      name: name.trim(),
      designation: designation.trim() || null,
      photo_url: photoUrl || null,
    } as any);
    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success("Admin added");
    setName(""); setDesignation(""); setPhotoUrl(""); setOpen(false);
    setSaving(false);
    fetchAdmins();
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from("homepage_admins" as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Removed");
    fetchAdmins();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-display text-2xl text-foreground">Homepage Admins</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={admins.length >= 5} className="active:scale-[0.97]">
              <Plus className="h-4 w-4 mr-1" /> Add Admin ({admins.length}/5)
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Homepage Admin</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <Label>Designation</Label>
                <Input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. President" />
              </div>
              <div>
                <Label>Photo</Label>
                {photoUrl && <img src={photoUrl} alt="" className="h-20 w-20 rounded-full object-cover mb-2" />}
                <Button variant="outline" size="sm" className="relative" disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                  {uploading ? "Uploading..." : "Upload Photo"}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </Button>
              </div>
              <Button onClick={handleAdd} disabled={saving} className="w-full active:scale-[0.97]">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Admin"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {admins.map(a => (
          <Card key={a.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarImage src={a.photo_url ?? undefined} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {a.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{a.name}</p>
                {a.designation && <p className="text-sm text-muted-foreground">{a.designation}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleRemove(a.id)} className="text-destructive hover:text-destructive shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {admins.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">No admins added yet. Add up to 5.</p>
        )}
      </div>
    </div>
  );
}
