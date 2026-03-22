import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Loader2, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface GalleryItem {
  id: string;
  image_url: string;
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as GalleryItem[]) ?? []);
        setLoading(false);
      });
  }, []);

  const handleDownload = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `photo_${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, "_blank");
    }
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      await navigator.share({ title: "Photo", url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <h1 className="text-display text-3xl md:text-4xl text-foreground mb-2">Photo Gallery</h1>
        <p className="text-muted-foreground mb-8 max-w-xl">Moments from our initiatives, events, and the communities we serve.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No photos yet.</p>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="break-inside-avoid rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-[border-color] group relative">
                <button
                  onClick={() => setSelected(item.image_url)}
                  className="block w-full active:scale-[0.98]"
                >
                  <img src={item.image_url} alt="" className="w-full h-auto object-cover" loading="lazy" />
                </button>
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="secondary" className="h-8 w-8 bg-background/80 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); handleDownload(item.image_url); }}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 bg-background/80 backdrop-blur-sm" onClick={(e) => { e.stopPropagation(); handleShare(item.image_url); }}>
                    <Share2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelected(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img src={selected} alt="" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button size="sm" variant="secondary" className="bg-background/80 backdrop-blur-sm" onClick={() => handleDownload(selected)}>
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
              <Button size="sm" variant="secondary" className="bg-background/80 backdrop-blur-sm" onClick={() => handleShare(selected)}>
                <Share2 className="h-4 w-4 mr-1" /> Share
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
