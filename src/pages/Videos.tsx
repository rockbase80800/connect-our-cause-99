import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Loader2, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Video {
  id: string;
  youtube_url: string;
  youtube_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

export default function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<Video | null>(null);

  useEffect(() => {
    supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setVideos((data as Video[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <h1 className="text-display text-3xl md:text-4xl text-foreground mb-2">Videos</h1>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Watch our latest videos, updates, and stories from the field.
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : videos.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No videos yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((v) => (
              <div
                key={v.id}
                className="group rounded-xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Thumbnail with play overlay */}
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
                  <h3 className="font-semibold text-sm line-clamp-2 text-foreground">{v.title}</h3>
                  {v.description && (
                    <p className="text-xs text-muted-foreground line-clamp-3">{v.description}</p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => setPlaying(v)}
                    >
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
      </main>
      <Footer />

      {/* Video Player Modal */}
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
