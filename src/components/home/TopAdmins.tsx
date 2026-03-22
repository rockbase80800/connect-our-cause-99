import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Admin {
  id: string;
  name: string;
  photo_url: string | null;
  designation: string | null;
}

export function TopAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const { ref, isVisible } = useScrollReveal(0.15);

  useEffect(() => {
    supabase
      .from("homepage_admins" as any)
      .select("id, name, photo_url, designation")
      .order("created_at")
      .limit(5)
      .then(({ data }) => {
        if (data) setAdmins(data as any);
      });
  }, []);

  if (admins.length === 0) return null;

  return (
    <section className="py-20 md:py-28 section-padding bg-background">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Our Leadership</p>
          <h2 className="text-display text-2xl md:text-4xl text-foreground">Meet Our Team</h2>
        </div>
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          {admins.map((a, i) => (
            <div
              key={a.id}
              className="text-center group"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <Avatar className="h-28 w-28 mx-auto mb-3 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                <AvatarImage src={a.photo_url ?? undefined} alt={a.name} className="object-cover" />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {a.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-foreground">{a.name}</h3>
              {a.designation && <p className="text-sm text-muted-foreground mt-0.5">{a.designation}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
