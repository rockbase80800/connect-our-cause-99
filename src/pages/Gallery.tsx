import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2 } from "lucide-react";

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
              <button
                key={item.id}
                onClick={() => setSelected(item.image_url)}
                className="block w-full rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-[border-color] break-inside-avoid active:scale-[0.98]"
              >
                <img
                  src={item.image_url}
                  alt=""
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelected(null)}
        >
          <img
            src={selected}
            alt=""
            className="max-w-full max-h-[90vh] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
