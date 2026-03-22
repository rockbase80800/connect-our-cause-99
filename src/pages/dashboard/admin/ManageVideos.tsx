import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const VIDEO_CATEGORIES = [
  "General", "Education", "Health", "Environment", "Community",
  "Agriculture", "Women Empowerment", "Youth", "Events", "Success Stories"
];

interface Video {
  id: string;
  youtube_url: string;
  youtube_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  category: string | null;
  created_at: string;
}

export default function ManageVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState<{ youtube_id: string; title: string; thumbnail_url: string; description: string } | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");

  const fetchVideos = async () => {
    const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
    setVideos((data as Video[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleFetchMeta = async () => {
    if (!youtubeUrl.trim()) return;
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-metadata", {
        body: { youtube_url: youtubeUrl.trim() },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setMeta(data);
      setEditDesc(data.description || "");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!meta) return;
    setSaving(true);
    const { error } = await supabase.from("videos").insert({
      youtube_url: youtubeUrl.trim(),
      youtube_id: meta.youtube_id,
      title: meta.title,
      description: editDesc || meta.description,
      thumbnail_url: meta.thumbnail_url,
      category: selectedCategory,
    } as any);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Video added!" });
      setOpen(false);
      setYoutubeUrl("");
      setMeta(null);
      setEditDesc("");
      setSelectedCategory("General");
      fetchVideos();
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("videos").update({ is_active: !current } as any).eq("id", id);
    fetchVideos();
  };

  const deleteVideo = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    await supabase.from("videos").delete().eq("id", id);
    fetchVideos();
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Videos</h1>
            <p className="text-sm text-muted-foreground">Add YouTube videos with AI-generated descriptions</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setMeta(null); setYoutubeUrl(""); setEditDesc(""); } }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Video</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add YouTube Video</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Paste YouTube URL..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
                  <Button onClick={handleFetchMeta} disabled={fetching || !youtubeUrl.trim()}>
                    {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                  </Button>
                </div>

                {meta && (
                  <div className="space-y-3 animate-in fade-in">
                    {meta.thumbnail_url && (
                      <img src={meta.thumbnail_url} alt="" className="w-full rounded-lg" />
                    )}
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <p className="text-sm text-foreground mt-1">{meta.title || "No title found"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">AI Description (editable)</label>
                      <Textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={4}
                        className="mt-1"
                        placeholder="AI is generating description..."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {VIDEO_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <Button className="w-full" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Save Video
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : videos.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No videos yet. Add your first YouTube video.</p>
        ) : (
          <div className="grid gap-4">
            {videos.map((v) => (
              <div key={v.id} className="flex gap-4 p-4 rounded-xl bg-card border border-border/60 shadow-sm">
                <img
                  src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`}
                  alt={v.title}
                  className="w-32 h-20 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{v.title}</p>
                    <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{v.category || "General"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{v.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Switch checked={v.is_active} onCheckedChange={() => toggleActive(v.id, v.is_active)} />
                  <div className="flex gap-1">
                    <a href={v.youtube_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                    </a>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteVideo(v.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
