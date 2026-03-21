import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  project_id: string | null;
  form_data: any;
  created_at: string;
  project_title?: string;
}

export default function ManageLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("leads")
        .select("*, projects(title)")
        .order("created_at", { ascending: false });
      setLeads(
        (data ?? []).map((l: any) => ({
          ...l,
          project_title: l.projects?.title ?? "—",
        }))
      );
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h1 className="text-display text-2xl text-foreground">Leads</h1>
        <div className="glass-card rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No leads yet</TableCell></TableRow>
              ) : leads.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name || "—"}</TableCell>
                  <TableCell>{l.email || "—"}</TableCell>
                  <TableCell>{l.phone || "—"}</TableCell>
                  <TableCell>{l.project_title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(l.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageWrapper>
  );
}
