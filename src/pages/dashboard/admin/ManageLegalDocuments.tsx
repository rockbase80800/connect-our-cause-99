import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { FileText, Trash2, Upload, Loader2, Plus, Replace } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LegalDoc {
  id: string;
  name: string;
  file_url: string;
  category: string;
  created_at: string;
}

const CATEGORIES = ["Policies", "Certificates", "Agreements", "Reports", "Other"];

export default function ManageLegalDocuments() {
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Policies");
  const [file, setFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchDocs = async () => {
    const { data } = await supabase
      .from("legal_documents")
      .select("*")
      .order("category")
      .order("name");
    if (data) setDocs(data as LegalDoc[]);
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name.trim()) return;
    setSubmitting(true);

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("legal-docs")
      .upload(path, file);

    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("legal-docs").getPublicUrl(path);

    const { error: insertErr } = await supabase
      .from("legal_documents")
      .insert({ name: name.trim(), file_url: urlData.publicUrl, category });

    if (insertErr) {
      toast({ title: "Error", description: insertErr.message, variant: "destructive" });
    } else {
      toast({ title: "Document added successfully" });
      setName("");
      setFile(null);
      setShowForm(false);
      fetchDocs();
    }
    setSubmitting(false);
  };

  const handleDelete = async (doc: LegalDoc) => {
    // Extract storage path from URL
    const urlParts = doc.file_url.split("/legal-docs/");
    const storagePath = urlParts[urlParts.length - 1];

    if (storagePath) {
      await supabase.storage.from("legal-docs").remove([storagePath]);
    }

    const { error } = await supabase.from("legal_documents").delete().eq("id", doc.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Document deleted" });
      fetchDocs();
    }
  };

  const handleReplace = async (doc: LegalDoc, newFile: File) => {
    const ext = newFile.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from("legal-docs").upload(path, newFile);
    if (uploadErr) {
      toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" });
      return;
    }

    // Delete old file
    const urlParts = doc.file_url.split("/legal-docs/");
    const oldPath = urlParts[urlParts.length - 1];
    if (oldPath) await supabase.storage.from("legal-docs").remove([oldPath]);

    const { data: urlData } = supabase.storage.from("legal-docs").getPublicUrl(path);

    const { error } = await supabase
      .from("legal_documents")
      .update({ file_url: urlData.publicUrl })
      .eq("id", doc.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "File replaced successfully" });
      fetchDocs();
    }
  };

  const grouped = docs.reduce<Record<string, LegalDoc[]>>((acc, doc) => {
    (acc[doc.category] ??= []).push(doc);
    return acc;
  }, {});

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Legal Documents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Upload and manage legal documents for users
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Document
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Document</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Privacy Policy"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>File (PDF, DOC, etc.)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-muted-foreground text-center py-10">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <h2 className="text-base font-semibold text-foreground mb-3 border-b pb-2">{cat}</h2>
                <div className="grid gap-2">
                  {items.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium truncate">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <label>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleReplace(doc, f);
                              e.target.value = "";
                            }}
                          />
                          <Button size="sm" variant="ghost" asChild className="cursor-pointer">
                            <span><Replace className="h-4 w-4" /></span>
                          </Button>
                        </label>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete "{doc.name}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the document and its file.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(doc)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
