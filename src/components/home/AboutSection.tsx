import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Users, MapPin, Handshake, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import founderImg from "@/assets/founder.jpg";

const values = [
  { icon: Users, title: "Community First", description: "Every decision is driven by the needs of the communities we serve." },
  { icon: MapPin, title: "Local Presence", description: "Coordinators embedded at district, block, and panchayat levels." },
  { icon: Handshake, title: "Transparent Action", description: "Open reporting and accountability from ground level to leadership." },
  { icon: Target, title: "Measurable Impact", description: "Data-driven approach to track and maximize every initiative's reach." },
];

export function AboutSection() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const [s, setS] = useState<any>(null);

  useEffect(() => {
    supabase.from("about_settings").select("*").limit(1).maybeSingle().then(({ data, error }) => {
      if (error) console.error("About fetch error:", error);
      if (data) setS(data);
    });
  }, []);

  const eyebrow = s?.eyebrow || "About Us";
  const title = s?.title || "Meri Pahal Fast Help Artists Welfare Association (Trust)";
  const desc = s?.description || "We are committed to empowering rural communities through sustainable development programs, women's health awareness, free sanitary pad distribution, and healthcare initiatives across India.";
  const desc2 = s?.description2 || "Our network of dedicated coordinators and volunteers works at the grassroots level — from panchayats to districts — to bring real, measurable change.";

  return (
    <section id="about" className="py-24 md:py-32 section-padding bg-secondary/50">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-700 ${isVisible ? "animate-slide-in-left" : "opacity-0"}`}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">{eyebrow}</p>
            <h2 className="text-display text-2xl md:text-4xl text-foreground mb-6 whitespace-pre-line leading-tight">{title}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">{desc}</p>
            <p className="text-muted-foreground leading-relaxed">{desc2}</p>

            {/* Founder */}
            <div className={`mt-8 flex items-center gap-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <img src={founderImg} alt="Founder" className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20" loading="lazy" />
              <div>
                <p className="font-semibold text-foreground text-sm">Founder & Chairman</p>
                <p className="text-xs text-muted-foreground">Meri Pahal Fast Help Artists Welfare Association</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {values.map((item, i) => (
              <div
                key={item.title}
                className={`glass-card rounded-xl p-6 transition-all duration-500 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                <item.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}