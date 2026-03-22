import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Users, MapPin, Handshake, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import founderImg from "@/assets/founder.jpg";

const values = [
  { icon: Users, title: "Community First", description: "Every decision is driven by the needs of the communities we serve." },
  { icon: MapPin, title: "Local Presence", description: "Coordinators embedded at district, block, and panchayat levels." },
  { icon: Handshake, title: "Transparent Action", description: "Open reporting and accountability from ground level to leadership." },
  { icon: Target, title: "Measurable Impact", description: "Data-driven approach to track and maximize every initiative's reach." },
];

const defaultAbout = {
  eyebrow: "About Us",
  title: "Grassroots Development, Real Results",
  description: "We are a non-governmental organization committed to empowering rural communities through sustainable development programs.",
  description2: "Founded in 2018, we've grown from a single district operation to a multi-district network of dedicated coordinators and volunteers.",
};

export function AboutSection() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const [s, setS] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("about_settings").select("*").limit(1).maybeSingle().then(({ data, error }) => {
      if (error) console.error("About fetch error:", error);
      setS(data || defaultAbout);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="py-24 md:py-32 section-padding bg-secondary/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-24 md:py-32 section-padding bg-secondary/50">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-700 ${isVisible ? "animate-slide-in-left" : "opacity-0"}`}>
            {s.eyebrow && <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">{s.eyebrow}</p>}
            <h2 className="text-display text-2xl md:text-4xl text-foreground mb-6 whitespace-pre-line leading-tight">{s.title}</h2>
            {s.description && <p className="text-muted-foreground text-lg leading-relaxed mb-6">{s.description}</p>}
            {s.description2 && <p className="text-muted-foreground leading-relaxed">{s.description2}</p>}

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
              <div key={item.title} className={`glass-card rounded-xl p-6 transition-all duration-500 ${isVisible ? "animate-reveal-up" : "opacity-0"}`} style={{ animationDelay: `${400 + i * 100}ms` }}>
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
