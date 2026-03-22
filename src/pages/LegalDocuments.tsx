import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { FileText, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LegalDoc {
  id: string;
  name: string;
  file_url: string;
  category: string;
  created_at: string;
}

export default function LegalDocuments() {
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("legal_documents")
      .select("*")
      .order("category")
      .order("name")
      .then(({ data }) => {
        if (data) setDocs(data as LegalDoc[]);
        setLoading(false);
      });
  }, []);

  const grouped = docs.reduce<Record<string, LegalDoc[]>>((acc, doc) => {
    (acc[doc.category] ??= []).push(doc);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Legal Documents</h1>
        <p className="text-muted-foreground mb-8">
          View and download official documents, policies, and certificates.
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No documents available yet.</p>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category}>
                <h2 className="text-lg font-semibold text-foreground mb-3 border-b pb-2">
                  {category}
                </h2>
                <div className="grid gap-3">
                  {items.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/60 shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 text-primary shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate">
                          {doc.name}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      
    </div>
  );
}
