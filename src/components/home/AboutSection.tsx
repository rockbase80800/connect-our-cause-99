import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Users, MapPin, Handshake, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    supabase.from("about_settings").select("*").limit(1).single().then(({ data }) => {
      if (data) setS(data);
    });
  }, []);

  const eyebrow = s?.eyebrow || "About JanSeva";
  const title = s?.title || "Grassroots Development,\nReal Results";
  const desc = s?.description || "JanSeva is a non-governmental organization committed to empowering rural communities through sustainable development programs.";
  const desc2 = s?.description2 || "Founded in 2018, we've grown from a single district operation to a multi-district network of dedicated coordinators and volunteers.";

  return (
    <section id="about" className="py-24 md:py-32 section-padding bg-secondary/50">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className={`transition-all duration-700 ${isVisible ? "animate-slide-in-left" : "opacity-0"}`}>
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">{eyebrow}</p>
            <h2 className="text-display text-3xl md:text-5xl text-foreground mb-6 whitespace-pre-line">{title}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">{desc}</p>
            <p className="text-muted-foreground leading-relaxed">{desc2}</p>
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
