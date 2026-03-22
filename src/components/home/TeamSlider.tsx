import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TeamMember {
  id: string;
  name: string;
  photo_url: string | null;
  designation: string | null;
  bio: string | null;
}

export function TeamSlider() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [idx, setIdx] = useState(0);
  const { ref, isVisible } = useScrollReveal(0.15);

  useEffect(() => {
    console.log("TeamSlider: fetching profiles...");
    supabase
      .from("user_profiles")
      .select("id, name, photo_url, designation, bio")
      .eq("status", "approved")
      .eq("show_in_slider", true)
      .then(({ data, error }) => {
        console.log("TeamSlider: data =", data, "error =", error);
        if (error) console.error("TeamSlider fetch error:", error);
        if (data && data.length > 0) setMembers(data);
      });
  }, []);

  if (members.length === 0) return null;

  const visibleCount = typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 3;
  const maxIdx = Math.max(0, members.length - visibleCount);

  return (
    <section className="py-20 md:py-28 section-padding bg-background">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">Our Team</p>
          <h2 className="text-display text-2xl md:text-4xl text-foreground">Meet the People Behind the Mission</h2>
        </div>

        <div className="relative">
          {members.length > visibleCount && (
            <>
              <button
                onClick={() => setIdx(Math.max(0, idx - 1))}
                disabled={idx === 0}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIdx(Math.min(maxIdx, idx + 1))}
                disabled={idx >= maxIdx}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center disabled:opacity-30 hover:bg-muted transition-colors active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${idx * (100 / visibleCount)}%)` }}
            >
              {members.map((m, i) => (
                <div
                  key={m.id}
                  className="shrink-0 px-3"
                  style={{ width: `${100 / visibleCount}%` }}
                >
                  <div
                    className={`bg-card rounded-2xl p-6 text-center shadow-sm border border-border/50 hover:shadow-md transition-all duration-500 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
                    style={{ animationDelay: `${200 + i * 120}ms` }}
                  >
                    <Avatar className="h-24 w-24 mx-auto mb-4 ring-2 ring-primary/10">
                      <AvatarImage src={m.photo_url ?? undefined} alt={m.name} className="object-cover" />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {m.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-foreground text-lg">{m.name}</h3>
                    {m.designation && <p className="text-sm text-primary font-medium mt-1">{m.designation}</p>}
                    {m.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{m.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
