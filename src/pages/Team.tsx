import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  designation: string | null;
}

export default function Team() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollReveal(0.1);

  useEffect(() => {
    supabase
      .from("user_profiles")
      .select("id, user_id, name, photo_url, bio, designation")
      .eq("status", "approved")
      .then(({ data, error }) => {
        if (error) console.error("Team fetch error:", error);
        if (data) setProfiles(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 section-padding">
        <div ref={ref} className="max-w-6xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
            <h1 className="text-display text-3xl md:text-5xl text-foreground mb-3">Our Team</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Meet the dedicated individuals driving our mission forward.
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card rounded-2xl p-8 animate-pulse border border-border/50">
                  <div className="h-24 w-24 rounded-full bg-muted mx-auto mb-4" />
                  <div className="h-5 bg-muted rounded mx-auto w-32 mb-2" />
                  <div className="h-4 bg-muted rounded mx-auto w-24" />
                </div>
              ))}
            </div>
          ) : profiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No team members to display yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((p, i) => (
                <div
                  key={p.id}
                  className={`bg-card rounded-2xl p-8 text-center shadow-sm border border-border/50 hover:shadow-lg transition-all duration-500 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
                  style={{ animationDelay: `${150 + i * 100}ms` }}
                >
                  <Avatar className="h-28 w-28 mx-auto mb-4 ring-2 ring-primary/10">
                    <AvatarImage src={p.photo_url ?? undefined} alt={p.name} className="object-cover" />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {p.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-foreground text-lg">{p.name}</h3>
                  {p.designation && <p className="text-sm text-primary font-medium mt-1">{p.designation}</p>}
                  {p.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.bio}</p>}
                  <Link to={`/profile/${p.user_id}`}>
                    <Button variant="outline" size="sm" className="mt-4 active:scale-95 transition-transform">
                      View More
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
