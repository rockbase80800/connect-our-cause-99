import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, QrCode, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Payment() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("कृपया नीचे दिए गए QR कोड को स्कैन करके भुगतान करें और Transaction ID दर्ज करें।");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // Fetch payment settings
      const { data: settings } = await supabase
        .from("payment_settings" as any)
        .select("*")
        .eq("id", "global-payment")
        .maybeSingle();

      if (settings) {
        setQrImageUrl((settings as any).qr_image_url);
        if ((settings as any).instructions) setInstructions((settings as any).instructions);
      }

      // Verify application belongs to user
      if (user && applicationId) {
        const { data: app } = await supabase
          .from("applications")
          .select("id, payment_status")
          .eq("id", applicationId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!app) {
          setError("Application not found");
        } else if ((app as any).payment_status === "paid") {
          setSubmitted(true);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [applicationId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toast.error("कृपया Transaction ID दर्ज करें");
      return;
    }
    if (!applicationId || !user) return;

    setSubmitting(true);
    const { error: err } = await supabase
      .from("applications")
      .update({
        payment_status: "pending",
        transaction_id: transactionId.trim(),
      } as any)
      .eq("id", applicationId)
      .eq("user_id", user.id);

    if (err) {
      toast.error(err.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    toast.success("भुगतान सफलतापूर्वक सबमिट हुआ!");
    setTimeout(() => navigate("/dashboard"), 2500);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 section-padding">
        <div className="max-w-lg mx-auto">
          {error ? (
            <Card className="shadow-lg border-destructive/30">
              <CardContent className="py-10 text-center">
                <AlertCircle className="h-14 w-14 text-destructive mx-auto mb-4" />
                <h3 className="font-semibold text-xl text-foreground mb-2">Error</h3>
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          ) : submitted ? (
            <Card className="shadow-lg border-success/30 animate-reveal-up">
              <CardContent className="py-10 text-center">
                <CheckCircle className="h-14 w-14 text-success mx-auto mb-4" />
                <h3 className="font-semibold text-xl text-foreground mb-2">
                  आवेदन सफलतापूर्वक सबमिट हुआ!
                </h3>
                <p className="text-muted-foreground">
                  आपका भुगतान प्राप्त हुआ। आपको जल्द सूचित किया जाएगा।
                </p>
                <p className="text-xs text-muted-foreground mt-3">Dashboard पर redirect हो रहा है...</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">भुगतान करें</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{instructions}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    {qrImageUrl ? (
                      <div className="rounded-xl overflow-hidden border-2 border-primary/20 shadow-md">
                        <img
                          src={qrImageUrl}
                          alt="Payment QR Code"
                          className="w-64 h-64 object-contain bg-white"
                        />
                      </div>
                    ) : (
                      <div className="w-64 h-64 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                        <QrCode className="h-12 w-12 mb-2 opacity-40" />
                        <p className="text-sm">QR Code उपलब्ध नहीं है</p>
                        <p className="text-xs mt-1">Admin से संपर्क करें</p>
                      </div>
                    )}
                  </div>

                  {/* Transaction ID */}
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
                    <p className="text-xs text-muted-foreground text-center">
                      भुगतान के बाद प्राप्त Transaction ID यहाँ दर्ज करें
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting || !transactionId.trim()}
                    size="lg"
                    className="w-full active:scale-[0.97] transition-all text-base"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "भुगतान सबमिट करें"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
