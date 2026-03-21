import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface GalleryItem {
  id: string;
  image_url: string;
}

export default function ManageGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchGallery = async () => {
    const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
    setItems((data as GalleryItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchGallery(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const path = `gallery-${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("gallery-images").upload(path, file);
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("gallery-images").getPublicUrl(path);
      await supabase.from("gallery").insert({ image_url: data.publicUrl });
    }
    toast.success("Images uploaded");
    setUploading(false);
    fetchGallery();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("gallery").delete().eq("id", id);
    toast.success("Image removed");
    fetchGallery();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-display text-2xl text-foreground">Photo Gallery</h1>
          <Button variant="outline" className="relative" disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
            {uploading ? "Uploading..." : "Upload Images"}
            <input type="file" accept="image/*" multiple onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No images yet. Upload some to get started.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden aspect-square">
                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
