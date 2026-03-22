import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Video {
  id: string;
  youtube_url: string;
  youtube_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string | null;
  is_featured: boolean;
  created_at: string;
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<Video | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const vids = (data as Video[]) ?? [];
        setVideos(vids);
        const cats = Array.from(new Set(vids.map((v) => v.category || "General")));
        setCategories(cats);
        setLoading(false);
      });
  }, []);

  const featured = videos.find((v) => v.is_featured);
  const rest = videos.filter((v) => v.id !== featured?.id);
  const filtered = activeCategory === "All"
    ? rest
    : rest.filter((v) => (v.category || "General") === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <h1 className="text-display text-3xl md:text-4xl text-foreground mb-2">Videos</h1>
        <p className="text-muted-foreground mb-6 max-w-xl">
          Watch our latest videos, updates, and stories from the field.
        </p>

        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {featured && (
              <div className="mb-10">
                <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Featured Video
                </h2>
                <div className="grid md:grid-cols-2 gap-6 rounded-2xl border border-border bg-card shadow-md overflow-hidden">
                  <button
                    onClick={() => setPlaying(featured)}
                    className="relative aspect-video overflow-hidden group"
                  >
                    <img
                      src={featured.thumbnail_url || `https://img.youtube.com/vi/${featured.youtube_id}/hqdefault.jpg`}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                        <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </button>
                  <div className="p-6 flex flex-col justify-center space-y-3">
                    <Badge variant="secondary" className="w-fit text-xs">{featured.category || "General"}</Badge>
                    <h3 className="text-xl font-bold text-foreground">{featured.title}</h3>
                    {featured.description && (
                      <p className="text-sm text-muted-foreground line-clamp-4">{featured.description}</p>
                    )}
                    <div className="flex items-center gap-3 pt-2">
                      <Button onClick={() => setPlaying(featured)}>
                        <Play className="h-4 w-4 mr-2" /> Watch Now
                      </Button>
                      <a href={featured.youtube_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                          <ExternalLink className="h-4 w-4 mr-2" /> YouTube
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-20">No videos in this category.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((v) => (
                  <div
                    key={v.id}
                    className="group rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => setPlaying(v)}
                      className="relative w-full aspect-video overflow-hidden"
                    >
                      <img
                        src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                          <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </button>

                    <div className="p-4 space-y-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {v.category || "General"}
                      </Badge>
                      <h3 className="font-semibold text-sm line-clamp-2 text-foreground">{v.title}</h3>
                      {v.description && (
                        <p className="text-xs text-muted-foreground line-clamp-3">{v.description}</p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => setPlaying(v)}>
                          <Play className="h-3 w-3 mr-1" /> Play
                        </Button>
                        <a href={v.youtube_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="ghost" className="text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" /> YouTube
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />

      <Dialog open={!!playing} onOpenChange={() => setPlaying(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          {playing && (
            <div className="w-full aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${playing.youtube_id}?autoplay=1&rel=0`}
                title={playing.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
