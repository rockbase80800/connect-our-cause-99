import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

export default function ManageHomepage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtext, setHeroSubtext] = useState("");
  const [heroEyebrow, setHeroEyebrow] = useState("");
  const [heroBg, setHeroBg] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [button2Text, setButton2Text] = useState("");
  const [button2Link, setButton2Link] = useState("");

  // About
  const [aboutId, setAboutId] = useState<string | null>(null);
  const [aboutTitle, setAboutTitle] = useState("");
  const [aboutEyebrow, setAboutEyebrow] = useState("");
  const [aboutDesc, setAboutDesc] = useState("");
  const [aboutDesc2, setAboutDesc2] = useState("");

  // About Card
  const [cardId, setCardId] = useState<string | null>(null);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDesc, setCardDesc] = useState("");
  const [cardAboutText, setCardAboutText] = useState("");
  const [cardImages, setCardImages] = useState<string[]>([]);
  const [cardUploading, setCardUploading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: hero }, { data: about }, { data: card }] = await Promise.all([
        supabase.from("homepage_settings").select("*").limit(1).maybeSingle(),
        supabase.from("about_settings").select("*").limit(1).maybeSingle(),
        supabase.from("homepage_about_card").select("*").limit(1).maybeSingle(),
      ]);
      if (hero) {
        setSettingsId(hero.id);
        setHeroTitle(hero.hero_title ?? "");
        setHeroSubtext(hero.hero_subtext ?? "");
        setHeroEyebrow(hero.hero_eyebrow ?? "");
        setHeroBg(hero.hero_bg ?? "");
        setButtonText(hero.button_text ?? "");
        setButtonLink(hero.button_link ?? "");
        setButton2Text(hero.button2_text ?? "");
        setButton2Link(hero.button2_link ?? "");
      }
      if (about) {
        setAboutId(about.id);
        setAboutTitle(about.title ?? "");
        setAboutEyebrow(about.eyebrow ?? "");
        setAboutDesc(about.description ?? "");
        setAboutDesc2(about.description2 ?? "");
      }
      if (card) {
        setCardId(card.id);
        setCardTitle(card.title ?? "");
        setCardDesc(card.description ?? "");
        setCardAboutText(card.about_text ?? "");
        setCardImages(Array.isArray(card.images) ? (card.images as string[]) : []);
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `hero-bg-${Date.now()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("website-assets").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("website-assets").getPublicUrl(path);
    setHeroBg(data.publicUrl);
    setUploading(false);
    toast.success("Background uploaded");
  };

  const handleCardImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setCardUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `about-card-${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("website-assets").upload(path, file);
      if (error) { toast.error(error.message); continue; }
      const { data } = supabase.storage.from("website-assets").getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }
    setCardImages(prev => [...prev, ...newUrls]);
    setCardUploading(false);
    if (newUrls.length > 0) toast.success(`${newUrls.length} image(s) uploaded`);
  };

  const removeCardImage = (index: number) => {
    setCardImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const heroPayload = {
      id: settingsId || "00000000-0000-0000-0000-000000000002",
      hero_title: heroTitle, hero_subtext: heroSubtext, hero_eyebrow: heroEyebrow,
      hero_bg: heroBg || null, button_text: buttonText, button_link: buttonLink,
      button2_text: button2Text, button2_link: button2Link,
      updated_at: new Date().toISOString(),
    };
    const aboutPayload = {
      id: aboutId || "00000000-0000-0000-0000-000000000003",
      title: aboutTitle, eyebrow: aboutEyebrow, description: aboutDesc, description2: aboutDesc2,
      updated_at: new Date().toISOString(),
    };
    const cardPayload = {
      id: cardId || "00000000-0000-0000-0000-000000000004",
      title: cardTitle, description: cardDesc, about_text: cardAboutText,
      images: cardImages,
      updated_at: new Date().toISOString(),
    };

    const [{ error: e1 }, { error: e2 }, { error: e3 }] = await Promise.all([
      supabase.from("homepage_settings").upsert(heroPayload, { onConflict: "id" }),
      supabase.from("about_settings").upsert(aboutPayload, { onConflict: "id" }),
      supabase.from("homepage_about_card").upsert(cardPayload, { onConflict: "id" }),
    ]);

    const err = e1 || e2 || e3;
    if (err) {
      console.error("Save errors:", e1, e2, e3);
      toast.error("Error saving: " + err.message);
    } else {
      toast.success("Homepage settings saved!");
      if (!cardId) setCardId("00000000-0000-0000-0000-000000000004");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <PageWrapper>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-display text-2xl text-foreground">Homepage Settings</h1>

        <Card>
          <CardHeader><CardTitle>Hero Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Eyebrow Text</Label><Input value={heroEyebrow} onChange={e => setHeroEyebrow(e.target.value)} /></div>
            <div><Label>Title</Label><Input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} /></div>
            <div><Label>Subtext</Label><Textarea value={heroSubtext} onChange={e => setHeroSubtext(e.target.value)} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Button 1 Text</Label><Input value={buttonText} onChange={e => setButtonText(e.target.value)} /></div>
              <div><Label>Button 1 Link</Label><Input value={buttonLink} onChange={e => setButtonLink(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Button 2 Text</Label><Input value={button2Text} onChange={e => setButton2Text(e.target.value)} /></div>
              <div><Label>Button 2 Link</Label><Input value={button2Link} onChange={e => setButton2Link(e.target.value)} /></div>
            </div>
            <div>
              <Label>Background Image</Label>
              {heroBg && <img src={heroBg} alt="" className="h-32 w-full object-cover rounded-lg mt-1 mb-2" />}
              <Button variant="outline" size="sm" className="relative" disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                {uploading ? "Uploading..." : "Upload Background"}
                <input type="file" accept="image/*" onChange={handleBgUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>About Card Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Title</Label><Input value={cardTitle} onChange={e => setCardTitle(e.target.value)} /></div>
            <div><Label>Short Description</Label><Textarea value={cardDesc} onChange={e => setCardDesc(e.target.value)} rows={2} /></div>
            <div><Label>About Text (Detailed)</Label><Textarea value={cardAboutText} onChange={e => setCardAboutText(e.target.value)} rows={4} /></div>
            <div>
              <Label>Images</Label>
              {cardImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2 mb-3">
                  {cardImages.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="h-24 w-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeCardImage(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" className="relative" disabled={cardUploading}>
                {cardUploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
                {cardUploading ? "Uploading..." : "Upload Images"}
                <input type="file" accept="image/*" multiple onChange={handleCardImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>About Section</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Eyebrow</Label><Input value={aboutEyebrow} onChange={e => setAboutEyebrow(e.target.value)} /></div>
            <div><Label>Title</Label><Input value={aboutTitle} onChange={e => setAboutTitle(e.target.value)} /></div>
            <div><Label>Paragraph 1</Label><Textarea value={aboutDesc} onChange={e => setAboutDesc(e.target.value)} rows={3} /></div>
            <div><Label>Paragraph 2</Label><Textarea value={aboutDesc2} onChange={e => setAboutDesc2(e.target.value)} rows={3} /></div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="active:scale-[0.97]">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Settings"}
        </Button>
      </div>
    </PageWrapper>
  );
}
