import { useEffect, useState } from "react";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
}

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProjects((data as Project[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <PageWrapper><div className="space-y-6">
      <h1 className="text-display text-2xl text-foreground">Active Projects</h1>
      {projects.length === 0 ? (
        <p className="text-muted-foreground">No active projects at the moment.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link key={p.id} to={`/project/${p.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer group">
                {p.image_url && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{p.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                  <span className="text-sm font-medium text-primary inline-flex items-center gap-1">
                    View Details <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
