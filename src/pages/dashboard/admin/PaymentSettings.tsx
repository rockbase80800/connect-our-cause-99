import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, QrCode, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSettings() {
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("payment_settings" as any)
        .select("*")
        .eq("id", "global-payment")
        .maybeSingle();
      if (data) {
        setQrImageUrl((data as any).qr_image_url || "");
        setInstructions((data as any).instructions || "");
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `qr_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("payment-assets").upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("payment-assets").getPublicUrl(path);
    setQrImageUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("QR image uploaded");
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("payment_settings" as any)
      .upsert({
        id: "global-payment",
        qr_image_url: qrImageUrl || null,
        instructions: instructions || null,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: "id" });
    if (error) {
      toast.error(error.message);
      console.error(error);
    } else {
      toast.success("Payment settings saved!");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-display text-2xl text-foreground">Payment Settings</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" /> QR Code & Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Preview */}
          <div className="flex flex-col items-center gap-4">
            {qrImageUrl ? (
              <div className="rounded-xl overflow-hidden border-2 border-primary/20 shadow-md">
                <img src={qrImageUrl} alt="QR Code" className="w-48 h-48 object-contain bg-white" />
              </div>
            ) : (
              <div className="w-48 h-48 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                <QrCode className="h-10 w-10 mb-2 opacity-40" />
                <p className="text-xs">No QR uploaded</p>
              </div>
            )}

            <Button variant="outline" size="sm" className="relative" disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploading ? "Uploading..." : "Upload QR Image"}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
              />
            </Button>
          </div>

          {/* QR URL manual */}
          <div>
            <label className="text-sm font-medium">QR Image URL (or uploaded above)</label>
            <Input value={qrImageUrl} onChange={(e) => setQrImageUrl(e.target.value)} placeholder="https://..." />
          </div>

          {/* Instructions */}
          <div>
            <label className="text-sm font-medium">Payment Instructions (Hindi)</label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="कृपया QR कोड स्कैन करें..."
              rows={3}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full active:scale-[0.97]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-2" /> Save Settings</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
