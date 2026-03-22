import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  image: string | null;
  status: string;
  customLink?: string;
}

export function ProjectsSection() {
  const { ref, isVisible } = useScrollReveal(0.15);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("projects")
      .select("id, title, description, image_url, status")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setProjects(
            data.map((p: any) => ({
              id: p.id,
              title: p.title,
              description: p.description ?? "",
              image: p.image_url,
              status: "Active",
            }))
          );
        }
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="py-24 md:py-32 section-padding bg-background">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-5 w-96 mb-16" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl overflow-hidden border border-border/50">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    console.log("projects: no data, showing fallback");
    return (
      <section id="projects" className="py-24 md:py-32 section-padding bg-background">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Our Work</p>
          <h2 className="text-display text-3xl md:text-5xl text-foreground mb-4">Active Projects</h2>
          <p className="text-muted-foreground text-lg">No projects available at this time.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" className="py-24 md:py-32 section-padding bg-background">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className={`mb-16 transition-all duration-700 ${isVisible ? "animate-reveal-up" : "opacity-0"}`}>
          <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">Our Work</p>
          <h2 className="text-display text-3xl md:text-5xl text-foreground mb-4">Active Projects</h2>
          <p className="text-muted-foreground text-lg max-w-xl">
            From education to clean water, we run impactful programs across districts to uplift underserved communities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, i) => (
            <Link
              key={project.id}
              to={project.customLink || `/project/${project.id}`}
              className={`group glass-card rounded-xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] ${isVisible ? "animate-reveal-up" : "opacity-0"}`}
              style={{ animationDelay: `${300 + i * 120}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                {project.image ? (
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">No image</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block w-2 h-2 rounded-full bg-[hsl(var(--success))]" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{project.status}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{project.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Learn More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
