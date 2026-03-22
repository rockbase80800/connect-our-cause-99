import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

interface Website {
  id: string;
  name: string;
  image_url: string | null;
  url: string;
}

function WebsiteCard({ site, index }: { site: Website; index: number }) {
  const { ref, isVisible } = useScrollReveal(0.15);
  return (
    <div
      ref={ref}
      className={`rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-lg transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {site.image_url && (
        <img src={site.image_url} alt={site.name} className="w-full h-44 object-cover" loading="lazy" />
      )}
      <div className="p-5 space-y-3">
        <h3 className="font-semibold text-foreground text-lg">{site.name}</h3>
        <a href={site.url} target="_blank" rel="noopener noreferrer">
          <Button className="w-full active:scale-[0.97] transition-all" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" /> Visit Website
          </Button>
        </a>
      </div>
    </div>
  );
}

export default function OurWebsites() {
  const [sites, setSites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("websites")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setSites((data as Website[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
        <h1 className="text-display text-3xl md:text-4xl text-foreground mb-2">Our Websites</h1>
        <p className="text-muted-foreground mb-8">Explore our online presence and partner platforms.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sites.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No websites added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site, i) => (
              <WebsiteCard key={site.id} site={site} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
