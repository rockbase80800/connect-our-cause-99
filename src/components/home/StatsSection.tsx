import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Skeleton } from "@/components/ui/skeleton";

function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!start || target === 0) { setValue(target); return; }
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, start]);

  return value;
}

export function StatsSection() {
  const { ref, isVisible } = useScrollReveal(0.2);
  const [stats, setStats] = useState<{ users: number; projects: number; districts: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ count: users }, { count: projects }, { data: dists }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("district").not("district", "is", null),
      ]);
      const uniqueDistricts = new Set((dists ?? []).map((d: any) => d.district).filter(Boolean));
      setStats({ users: users ?? 0, projects: projects ?? 0, districts: uniqueDistricts.size });
    };
    load();
  }, []);

  const shouldAnimate = isVisible && !!stats;
  const usersCount = useCountUp(stats?.users ?? 0, 2000, shouldAnimate);
  const projectsCount = useCountUp(stats?.projects ?? 0, 1600, shouldAnimate);
  const districtsCount = useCountUp(stats?.districts ?? 0, 1400, shouldAnimate);

  if (!stats) {
    return (
      <section className="relative py-16 bg-primary overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-10 w-20 bg-primary-foreground/10" />
                <Skeleton className="h-4 w-24 bg-primary-foreground/10" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const items = [
    { value: usersCount.toLocaleString() + "+", label: "Lives Impacted" },
    { value: projectsCount.toString(), label: "Active Projects" },
    { value: districtsCount.toString(), label: "Districts Covered" },
  ];

  return (
    <section ref={ref} className="relative py-16 bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          {items.map((stat, i) => (
            <div key={stat.label} style={{ animationDelay: `${i * 120}ms` }}>
              <div className="font-display text-3xl md:text-4xl font-bold text-accent tabular-nums">{stat.value}</div>
              <div className="text-sm mt-1 text-primary-foreground/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
