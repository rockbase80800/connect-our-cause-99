import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox";
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const [{ data: proj }, { data: schema }, { data: imgs }] = await Promise.all([
        supabase.from("projects").select("*").eq("id", id).single(),
        supabase.from("form_schemas").select("fields").eq("project_id", id).single(),
        supabase.from("project_images").select("image_url").eq("project_id", id).order("created_at"),
      ]);
      setProject(proj);
      if (schema?.fields) setFields(schema.fields as unknown as FormField[]);
      setImages((imgs ?? []).map((i: any) => i.image_url));
      if (user) {
        const { count } = await supabase
          .from("applications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("project_id", id);
        if (count && count > 0) setAlreadyApplied(true);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) { toast.error("Please sign in to apply"); return; }
    setSubmitting(true);

    // Save as lead too
    await supabase.from("leads").insert({
      name: profile?.name || formData["full_name"] || null,
      email: profile?.email || formData["email"] || null,
      phone: profile?.phone || formData["phone"] || null,
      project_id: id,
      form_data: formData,
    });

    const { error } = await supabase.from("applications").insert({
      user_id: user.id,
      project_id: id,
      form_data: formData,
    });
    if (error) { toast.error(error.message); }
    else { setSubmitted(true); toast.success("Application submitted!"); }
    setSubmitting(false);
  };

  const updateField = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-muted-foreground">Project not found</p>
          <Link to="/"><Button variant="outline">Go Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* 1. Banner */}
      {project.image_url && (
        <div className="relative h-64 md:h-80 mt-16">
          <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[hsl(var(--hero-overlay))]/60" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <h1 className="text-display text-3xl md:text-5xl" style={{ color: "hsl(40 33% 98%)" }}>
              {project.title}
            </h1>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 2. Title (if no banner) */}
        {!project.image_url && (
          <>
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <h1 className="text-display text-3xl text-foreground mb-4 mt-4">{project.title}</h1>
          </>
        )}

        {/* 3. About section */}
        <p className="text-muted-foreground text-lg leading-relaxed mb-4">{project.description}</p>
        {project.about && (
          <div className="prose prose-sm max-w-none text-foreground mb-8">
            <h2 className="text-display text-xl text-foreground mb-3">About This Project</h2>
            <p className="text-muted-foreground leading-relaxed">{project.about}</p>
          </div>
        )}

        {/* 4. Gallery */}
        {images.length > 0 && (
          <div className="mb-12">
            <h2 className="text-display text-xl text-foreground mb-4">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden aspect-[4/3]">
                  <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Application Form (LAST) */}
        {submitted || alreadyApplied ? (
          <Card className="border-success/30">
            <CardContent className="py-8 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
              <h3 className="font-semibold text-lg text-foreground mb-1">
                {alreadyApplied && !submitted ? "Already Applied" : "Application Submitted"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {alreadyApplied && !submitted
                  ? "You have already applied to this project."
                  : "Your application is now under review."}
              </p>
              <Link to="/dashboard/applications" className="mt-4 inline-block">
                <Button variant="outline" size="sm">View My Applications</Button>
              </Link>
            </CardContent>
          </Card>
        ) : fields.length > 0 ? (
          <Card>
            <CardHeader><CardTitle className="text-lg">Apply Now</CardTitle></CardHeader>
            <CardContent>
              {!user ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Sign in to apply for this project</p>
                  <Link to={`/auth?redirect=/project/${id}`}><Button>Sign In</Button></Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.name}>
                      <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {field.type === "textarea" ? (
                        <Textarea id={field.name} placeholder={field.placeholder} required={field.required} value={formData[field.name] || ""} onChange={(e) => updateField(field.name, e.target.value)} />
                      ) : field.type === "select" ? (
                        <Select value={formData[field.name] || ""} onValueChange={(v) => updateField(field.name, v)} required={field.required}>
                          <SelectTrigger><SelectValue placeholder={field.placeholder || "Select..."} /></SelectTrigger>
                          <SelectContent>{field.options?.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}</SelectContent>
                        </Select>
                      ) : field.type === "checkbox" ? (
                        <div className="flex items-center gap-2 mt-1">
                          <Checkbox id={field.name} checked={formData[field.name] || false} onCheckedChange={(v) => updateField(field.name, v)} />
                          <label htmlFor={field.name} className="text-sm">{field.placeholder}</label>
                        </div>
                      ) : (
                        <Input id={field.name} type={field.type} placeholder={field.placeholder} required={field.required} value={formData[field.name] || ""} onChange={(e) => updateField(field.name, e.target.value)} />
                      )}
                    </div>
                  ))}
                  <Button type="submit" disabled={submitting} className="active:scale-[0.97]">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Applications are not open for this project yet.
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
