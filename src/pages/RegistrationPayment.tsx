import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, QrCode, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function RegistrationPayment() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("कृपया नीचे दिए गए QR कोड को स्कैन करके रजिस्ट्रेशन शुल्क का भुगतान करें और Transaction ID दर्ज करें।");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: settings } = await supabase
        .from("payment_settings")
        .select("*")
        .eq("id", "global-payment")
        .maybeSingle();
      if (settings) {
        setQrImageUrl(settings.qr_image_url);
        if (settings.instructions) setInstructions(settings.instructions);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // If already paid/approved, redirect
  useEffect(() => {
    if (profile && (profile as any).payment_status === "paid") {
      navigate("/dashboard", { replace: true });
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) { toast.error("कृपया Transaction ID दर्ज करें"); return; }
    if (!user) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        payment_status: "pending",
        registration_transaction_id: transactionId.trim(),
      } as any)
      .eq("id", user.id);

    if (error) { toast.error(error.message); setSubmitting(false); return; }
    await refreshProfile();
    toast.success("भुगतान सफलतापूर्वक सबमिट हुआ! Approval का इंतजार करें।");
    navigate("/dashboard", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Already submitted
  if (profile && (profile as any).payment_status === "pending") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 section-padding">
          <div className="max-w-lg mx-auto">
            <Card className="shadow-lg border-amber-500/30">
              <CardContent className="py-10 text-center">
                <AlertCircle className="h-14 w-14 text-amber-500 mx-auto mb-4" />
                <h3 className="font-semibold text-xl text-foreground mb-2">भुगतान सबमिट हो चुका है</h3>
                <p className="text-muted-foreground">आपका भुगतान review में है। Admin approval के बाद आपको सूचित किया जाएगा।</p>
                <Button onClick={() => navigate("/dashboard")} className="mt-6">Dashboard पर जाएं</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 section-padding">
        <div className="max-w-lg mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">रजिस्ट्रेशन शुल्क भुगतान</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{instructions}</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center">
                  {qrImageUrl ? (
                    <div className="rounded-xl overflow-hidden border-2 border-primary/20 shadow-md">
                      <img src={qrImageUrl} alt="Payment QR Code" className="w-64 h-64 object-contain bg-white" />
                    </div>
                  ) : (
                    <div className="w-64 h-64 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                      <QrCode className="h-12 w-12 mb-2 opacity-40" />
                      <p className="text-sm">QR Code उपलब्ध नहीं है</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Transaction ID <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="जैसे: TXN123456789"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required
                    className="text-center text-lg font-mono tracking-wider"
                  />
                </div>
                <Button type="submit" disabled={submitting || !transactionId.trim()} size="lg" className="w-full active:scale-[0.97]">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "भुगतान सबमिट करें"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
