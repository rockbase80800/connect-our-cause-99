import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleReferral = async () => {
      const refCode = searchParams.get("ref");
      if (!refCode) {
        navigate("/dashboard", { replace: true });
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth", { replace: true });
        return;
      }

      // Find referrer and prevent self-referral
      const { data: referrer } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", refCode)
        .single();

      if (referrer && referrer.id !== user.id) {
        // Only set if not already referred
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("referred_by")
          .eq("id", user.id)
          .single();

        if (currentProfile && !currentProfile.referred_by) {
          await supabase
            .from("profiles")
            .update({ referred_by: referrer.id })
            .eq("id", user.id);
        }
      }

      navigate("/dashboard", { replace: true });
    };

    handleReferral();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
