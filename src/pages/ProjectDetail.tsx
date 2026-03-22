import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
import { Loader2, ArrowLeft, CheckCircle, ChevronDown, ArrowRight, Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "checkbox" | "file";
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

/* ---------- tiny scroll-reveal wrapper ---------- */
function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal(0.15);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-5 blur-[4px]"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileUploads, setFileUploads] = useState<Record<string, { name: string; url: string }>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

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

  const handleFileUpload = async (fieldName: string, file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    setUploadingField(fieldName);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${fieldName}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("application-documents").upload(path, file);
    if (error) { toast.error(error.message); setUploadingField(null); return; }
    const { data: urlData } = supabase.storage.from("application-documents").getPublicUrl(path);
    setFileUploads((prev) => ({ ...prev, [fieldName]: { name: file.name, url: urlData.publicUrl } }));
    updateField(fieldName, urlData.publicUrl);
    setUploadingField(null);
    toast.success("File uploaded");
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

  const heroImg = project.image_url || (images.length > 0 ? images[0] : null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══════ 1. HERO BANNER ═══════ */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden mt-16">
        {heroImg ? (
          <>
            <img src={heroImg} alt={project.title} className="absolute inset-0 w-full h-full object-cover" loading="eager" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/60" />
        )}
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-12 md:pb-16 pt-32 w-full">
          <Link to="/" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1
            className="text-display text-3xl md:text-5xl lg:text-6xl mb-4 animate-reveal-up whitespace-pre-line"
            style={{ color: "hsl(40 33% 98%)", lineHeight: 1.1 }}
          >
            {project.title}
          </h1>
          {project.description && (
            <p
              className="text-lg md:text-xl max-w-2xl leading-relaxed animate-reveal-up"
              style={{ color: "hsl(40 20% 85%)", animationDelay: "200ms" }}
            >
              {project.description}
            </p>
          )}
          <div className="mt-8 animate-reveal-up" style={{ animationDelay: "400ms" }}>
            <a href="#apply">
              <Button size="lg" className="bg-accent text-accent-foreground font-semibold hover:bg-accent/90 active:scale-[0.97] transition-all shadow-lg text-base px-8 py-6">
                Apply Now <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
        {/* scroll hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/50" />
        </div>
      </section>

      {/* ═══════ 2. ABOUT / DESCRIPTION ═══════ */}
      {project.about && (
        <section className="py-16 md:py-24 section-padding bg-secondary/30">
          <RevealSection className="max-w-5xl mx-auto">
            <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">About This Project</p>
            <div className="grid md:grid-cols-[1fr_0.8fr] gap-10 items-start">
              <div>
                <p className="text-foreground text-lg md:text-xl leading-relaxed whitespace-pre-line">
                  {project.about}
                </p>
              </div>
              {heroImg && (
                <div className="rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                  <img src={heroImg} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </RevealSection>
        </section>
      )}

      {/* ═══════ 3. GALLERY ═══════ */}
      {images.length > 0 && (
        <section className="py-16 md:py-24 section-padding">
          <RevealSection className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <ImageIcon className="h-6 w-6 text-primary" />
              <h2 className="text-display text-2xl md:text-3xl text-foreground">Project Gallery</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {images.map((url, i) => (
                <RevealSection key={i} delay={i * 80}>
                  <button
                    onClick={() => setLightboxImg(url)}
                    className="rounded-xl overflow-hidden aspect-[4/3] w-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </button>
                </RevealSection>
              ))}
            </div>
          </RevealSection>

          {/* Lightbox */}
          <Dialog open={!!lightboxImg} onOpenChange={() => setLightboxImg(null)}>
            <DialogContent className="max-w-4xl p-1 bg-black/90 border-none">
              {lightboxImg && (
                <img src={lightboxImg} alt="" className="w-full h-auto rounded-lg max-h-[85vh] object-contain" />
              )}
            </DialogContent>
          </Dialog>
        </section>
      )}

      {/* ═══════ 4. APPLICATION FORM ═══════ */}
      <section id="apply" className="py-16 md:py-24 section-padding bg-secondary/30">
        <RevealSection className="max-w-2xl mx-auto">
          <h2 className="text-display text-2xl md:text-3xl text-foreground mb-8 text-center">Apply for This Project</h2>

          {submitted || alreadyApplied ? (
            <Card className="border-success/30 shadow-lg">
              <CardContent className="py-10 text-center">
                <CheckCircle className="h-14 w-14 text-success mx-auto mb-4" />
                <h3 className="font-semibold text-xl text-foreground mb-2">
                  {alreadyApplied && !submitted ? "Already Applied" : "Application Submitted!"}
                </h3>
                <p className="text-muted-foreground">
                  {alreadyApplied && !submitted
                    ? "You have already applied to this project."
                    : "Your application is now under review. We'll notify you soon."}
                </p>
                <Link to="/dashboard/applications" className="mt-6 inline-block">
                  <Button variant="outline">View My Applications</Button>
                </Link>
              </CardContent>
            </Card>
          ) : fields.length > 0 ? (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Fill the Application Form</CardTitle>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Sign in to apply for this project</p>
                    <Link to={`/auth?redirect=/project/${id}`}><Button size="lg">Sign In to Apply</Button></Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
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
                          <div className="flex items-start gap-2 mt-1">
                            <Checkbox id={field.name} checked={formData[field.name] || false} onCheckedChange={(v) => updateField(field.name, v)} />
                            <label htmlFor={field.name} className="text-sm leading-snug">{field.label}</label>
                          </div>
                        ) : field.type === "file" ? (
                          <div className="mt-1">
                            {fileUploads[field.name] ? (
                              <div className="flex items-center gap-2 p-2 bg-success/10 border border-success/30 rounded-lg text-sm">
                                <CheckCircle className="h-4 w-4 text-success shrink-0" />
                                <span className="truncate">{fileUploads[field.name].name}</span>
                                <Button type="button" variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => { setFileUploads((p) => { const n = { ...p }; delete n[field.name]; return n; }); updateField(field.name, ""); }}>Change</Button>
                              </div>
                            ) : (
                              <Button type="button" variant="outline" size="sm" className="relative w-full justify-start" disabled={uploadingField === field.name}>
                                {uploadingField === field.name ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                {uploadingField === field.name ? "Uploading..." : "Choose File"}
                                <input type="file" accept="image/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(field.name, f); }} />
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Input id={field.name} type={field.type} placeholder={field.placeholder} required={field.required} value={formData[field.name] || ""} onChange={(e) => updateField(field.name, e.target.value)} />
                        )}
                      </div>
                    ))}
                    <Button type="submit" disabled={submitting} size="lg" className="w-full active:scale-[0.97] transition-all">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Application"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardContent className="py-10 text-center text-muted-foreground">
                Applications are not open for this project yet. Check back soon!
              </CardContent>
            </Card>
          )}
        </RevealSection>
      </section>

      <Footer />
    </div>
  );
}
