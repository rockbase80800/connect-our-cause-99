import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface HeroSettings {
  hero_title: string;
  hero_subtext: string;
  hero_eyebrow: string;
  hero_bg: string | null;
  button_text: string;
  button_link: string;
  button2_text: string;
  button2_link: string;
}

export function HeroSection() {
  const [s, setS] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("homepage_settings").select("*").limit(1).maybeSingle().then(({ data, error }) => {
      if (error) console.error("Hero fetch error:", error);
      if (data) setS(data as HeroSettings);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="relative min-h-[92vh] flex items-center bg-muted">
        <div className="max-w-7xl mx-auto px-6 py-32 md:py-40 w-full">
          <div className="max-w-2xl space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-40 rounded-md" />
              <Skeleton className="h-12 w-40 rounded-md" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!s) return null;

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        {s.hero_bg && (
          <img
            src={s.hero_bg}
            alt="Community gathering in rural India"
            className="w-full h-full object-cover"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-[hsl(var(--hero-overlay))]/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 md:py-40">
        <div className="max-w-2xl">
          {s.hero_eyebrow && (
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
              {s.hero_eyebrow}
            </p>
          )}
          <h1 className="text-display text-4xl md:text-6xl lg:text-7xl mb-6 animate-reveal-up whitespace-pre-line" style={{ animationDelay: "350ms", color: "hsl(40 33% 98%)" }}>
            {s.hero_title}
          </h1>
          {s.hero_subtext && (
            <p className="text-lg md:text-xl leading-relaxed mb-10 animate-reveal-up" style={{ animationDelay: "500ms", color: "hsl(40 20% 82%)" }}>
              {s.hero_subtext}
            </p>
          )}
          <div className="flex flex-wrap gap-4 animate-reveal-up" style={{ animationDelay: "650ms" }}>
            {s.button_text && (
              <Link to={s.button_link || "/auth"}>
                <Button size="lg" className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90 active:scale-[0.97] transition-all shadow-lg shadow-accent/25 text-base px-8 py-6">
                  {s.button_text}
                </Button>
              </Link>
            )}
            {s.button2_text && (
              <a href={s.button2_link || "#projects"}>
                <Button size="lg" variant="outline" className="border-2 font-semibold text-base px-8 py-6 active:scale-[0.97] transition-all" style={{ borderColor: "hsl(40 20% 82% / 0.3)", color: "hsl(40 33% 98%)", backgroundColor: "transparent" }}>
                  {s.button2_text}
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}