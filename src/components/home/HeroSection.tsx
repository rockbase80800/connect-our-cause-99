import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

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

  useEffect(() => {
    supabase.from("homepage_settings").select("*").limit(1).maybeSingle().then(({ data, error }) => {
      if (error) console.error("Hero fetch error:", error);
      if (data) setS(data as HeroSettings);
    });
  }, []);

  const title = s?.hero_title || "Building Stronger\nCommunities Together";
  const subtext = s?.hero_subtext || "We work at the grassroots level — from panchayats to districts — to bring sustainable change through education, healthcare, and clean water initiatives.";
  const eyebrow = s?.hero_eyebrow || "Empowering Communities Since 2018";
  const bg = s?.hero_bg || heroBg;
  const btn1Text = s?.button_text || "Join Our Mission";
  const btn1Link = s?.button_link || "/auth";
  const btn2Text = s?.button2_text || "View Projects";
  const btn2Link = s?.button2_link || "#projects";

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={bg}
          alt="Community gathering in rural India"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[hsl(var(--hero-overlay))]/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 md:py-40">
        <div className="max-w-2xl">
          <p
            className="text-accent font-semibold text-sm uppercase tracking-widest mb-4 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            {eyebrow}
          </p>
          <h1
            className="text-display text-4xl md:text-6xl lg:text-7xl mb-6 animate-reveal-up whitespace-pre-line"
            style={{ animationDelay: "350ms", color: "hsl(40 33% 98%)" }}
          >
            {title}
          </h1>
          <p
            className="text-lg md:text-xl leading-relaxed mb-10 animate-reveal-up"
            style={{ animationDelay: "500ms", color: "hsl(40 20% 82%)" }}
          >
            {subtext}
          </p>
          <div
            className="flex flex-wrap gap-4 animate-reveal-up"
            style={{ animationDelay: "650ms" }}
          >
            <Link to={btn1Link}>
              <Button
                size="lg"
                className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90 active:scale-[0.97] transition-all shadow-lg shadow-accent/25 text-base px-8 py-6"
              >
                {btn1Text}
              </Button>
            </Link>
            <a href={btn2Link}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 font-semibold text-base px-8 py-6 active:scale-[0.97] transition-all"
                style={{
                  borderColor: "hsl(40 20% 82% / 0.3)",
                  color: "hsl(40 33% 98%)",
                  backgroundColor: "transparent",
                }}
              >
                {btn2Text}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
