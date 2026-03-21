import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWebsiteSettings } from "@/contexts/WebsiteSettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Save, Image as ImageIcon, Globe, FileText, Layout } from "lucide-react";
import { toast } from "sonner";

export default function WebsiteSettings() {
  const { settings, refresh } = useWebsiteSettings();
  const { primaryRole } = useAuth();
  const [saving, setSaving] = useState(false);

  const [siteName, setSiteName] = useState("");
  const [description, setDescription] = useState("");
  const [headerContent, setHeaderContent] = useState("");
  const [footerCopyright, setFooterCopyright] = useState("");
  const [footerContact, setFooterContact] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.site_name || "");
      setDescription(settings.description || "");
      setHeaderContent(settings.header_content?.tagline || "");
      setFooterCopyright(settings.footer_content?.copyright || "");
      setFooterContact(settings.footer_content?.contact || "");
      setLogoPreview(settings.logo_url);
      setFaviconPreview(settings.favicon_url);
    }
  }, [settings]);

  if (primaryRole !== "super_admin") {
    return (
      <PageWrapper>
        <p className="text-destructive font-medium">Access denied. Super Admin only.</p>
      </PageWrapper>
    );
  }

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const filePath = `${path}.${ext}`;
    const { error } = await supabase.storage
      .from("website-assets")
      .upload(filePath, file, { upsert: true });
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }
    const { data } = supabase.storage.from("website-assets").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const preview = URL.createObjectURL(file);
    if (type === "logo") setLogoPreview(preview);
    else setFaviconPreview(preview);

    const url = await uploadFile(file, type);
    if (url) {
      if (type === "logo") setLogoPreview(url);
      else setFaviconPreview(url);
      toast.success(`${type === "logo" ? "Logo" : "Favicon"} uploaded`);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("website_settings")
      .update({
        site_name: siteName,
        description,
        logo_url: logoPreview,
        favicon_url: faviconPreview,
        header_content: { tagline: headerContent },
        footer_content: { copyright: footerCopyright, contact: footerContact },
      })
      .eq("id", settings.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Settings saved successfully!");
      await refresh();
    }
    setSaving(false);
  };

  return (
    <PageWrapper>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Website Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control global branding, logo, favicon, and content
          </p>
        </div>

        {/* Branding */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Website Name</Label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="JanSeva" />
            </div>
            <div>
              <Label>Description (SEO)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description for search engines" rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" /> Logo & Favicon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Logo</Label>
                <div className="mt-2 flex flex-col items-center gap-3 p-4 border border-dashed border-border rounded-xl bg-muted/30">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-16 w-auto object-contain rounded" />
                  ) : (
                    <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      <Upload className="h-3 w-3" /> Upload Logo
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "logo")} />
                  </label>
                </div>
              </div>
              <div>
                <Label>Favicon</Label>
                <div className="mt-2 flex flex-col items-center gap-3 p-4 border border-dashed border-border rounded-xl bg-muted/30">
                  {faviconPreview ? (
                    <img src={faviconPreview} alt="Favicon" className="h-10 w-10 object-contain rounded" />
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline">
                      <Upload className="h-3 w-3" /> Upload Favicon
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "favicon")} />
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Layout className="h-4 w-4 text-primary" /> Header
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Tagline</Label>
              <Input value={headerContent} onChange={(e) => setHeaderContent(e.target.value)} placeholder="A short tagline shown in the header" />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Footer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Copyright Text</Label>
              <Input value={footerCopyright} onChange={(e) => setFooterCopyright(e.target.value)} placeholder="© 2026 JanSeva. All rights reserved." />
            </div>
            <div>
              <Label>Contact Info</Label>
              <Textarea value={footerContact} onChange={(e) => setFooterContact(e.target.value)} placeholder="Email, phone, address..." rows={2} />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto active:scale-[0.97] transition-all">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </div>
    </PageWrapper>
  );
}
