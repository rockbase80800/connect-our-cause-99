import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export function StatsSection() {
  const { ref, isVisible } = useScrollReveal(0.2);
  const [stats, setStats] = useState({ users: 0, projects: 0, districts: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [{ count: users }, { count: projects }, { data: dists }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("district").not("district", "is", null),
      ]);
      const uniqueDistricts = new Set((dists ?? []).map((d: any) => d.district).filter(Boolean));
      setStats({
        users: users ?? 0,
        projects: projects ?? 0,
        districts: uniqueDistricts.size,
      });
    };
    fetch();
  }, []);

  const items = [
    { value: stats.users.toLocaleString() + "+", label: "Lives Impacted" },
    { value: stats.projects.toString(), label: "Active Projects" },
    { value: stats.districts.toString(), label: "Districts Covered" },
  ];

  return (
    <section ref={ref} className="relative py-16 bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={`grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center transition-all duration-700 ${
            isVisible ? "animate-reveal-up" : "opacity-0"
          }`}
        >
          {items.map((stat, i) => (
            <div key={stat.label} style={{ animationDelay: `${i * 120}ms` }}>
              <div className="font-display text-3xl md:text-4xl font-bold text-accent">
                {stat.value}
              </div>
              <div className="text-sm mt-1 text-primary-foreground/70">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
