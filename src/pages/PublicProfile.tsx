import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  description: string | null;
  contact: string | null;
  designation: string | null;
}

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", id)
      .eq("status", "approved")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error("Profile fetch error:", error);
        if (data) setProfile(data as UserProfile);
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 section-padding">
        <div className="max-w-3xl mx-auto">
          <Link to="/team">
            <Button variant="ghost" size="sm" className="mb-6 active:scale-95">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Team
            </Button>
          </Link>

          {loading ? (
            <div className="bg-card rounded-2xl p-12 animate-pulse border border-border/50">
              <div className="h-32 w-32 rounded-full bg-muted mx-auto mb-6" />
              <div className="h-6 bg-muted rounded mx-auto w-48 mb-3" />
              <div className="h-4 bg-muted rounded mx-auto w-32" />
            </div>
          ) : !profile ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Profile not found or not yet approved.</p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-sm border border-border/50 animate-reveal-up">
              <div className="text-center mb-8">
                <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-primary/10">
                  <AvatarImage src={profile.photo_url ?? undefined} alt={profile.name} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{profile.name}</h1>
                {profile.designation && (
                  <p className="text-primary font-medium mt-1">{profile.designation}</p>
                )}
              </div>

              {profile.bio && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Bio</h2>
                  <p className="text-foreground leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {profile.description && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</h2>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">{profile.description}</p>
                </div>
              )}

              {profile.contact && (
                <div className="pt-4 border-t border-border">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contact</h2>
                  <p className="text-foreground">{profile.contact}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
