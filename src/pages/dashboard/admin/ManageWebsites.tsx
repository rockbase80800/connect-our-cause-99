import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Website {
  id: string;
  name: string;
  image_url: string | null;
  url: string;
}

export default function ManageWebsites() {
  const [sites, setSites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);

  const fetch = async () => {
    const { data } = await supabase.from("websites").select("*").order("created_at", { ascending: false });
    setSites((data as Website[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    setAdding(true);

    let image_url: string | null = null;
    if (imageFile) {
      const path = `websites/${Date.now()}_${imageFile.name}`;
      const { error } = await supabase.storage.from("website-assets").upload(path, imageFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from("website-assets").getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("websites").insert({ name: name.trim(), url: url.trim(), image_url });
    if (error) toast.error(error.message);
    else {
      toast.success("Website added");
      setName(""); setUrl(""); setImageFile(null);
      fetch();
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this website?")) return;
    await supabase.from("websites").delete().eq("id", id);
    toast.success("Deleted");
    fetch();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-display text-2xl text-foreground">Manage Websites</h1>

      <Card>
        <CardHeader><CardTitle className="text-lg">Add Website</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Website name" required />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" required />
            </div>
            <div>
              <Label>Image (optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </div>
            <Button type="submit" disabled={adding} className="active:scale-[0.97]">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Add</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {sites.map((site) => (
          <div key={site.id} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/60">
            <div className="flex items-center gap-3 min-w-0">
              {site.image_url && <img src={site.image_url} alt="" className="h-10 w-10 rounded object-cover" />}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{site.name}</p>
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  {site.url} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(site.id)} className="text-destructive shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
