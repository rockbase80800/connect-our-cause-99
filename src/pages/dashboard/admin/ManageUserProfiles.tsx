import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { Check, X } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
  designation: string | null;
  status: string;
  show_in_slider: boolean;
  created_at: string;
}

export default function ManageUserProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("Fetch error:", error);
    if (data) setProfiles(data as UserProfile[]);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ status })
      .eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success(`Profile ${status}`); fetchProfiles(); }
  };

  const toggleSlider = async (id: string, val: boolean) => {
    const { error } = await supabase
      .from("user_profiles")
      .update({ show_in_slider: val })
      .eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success(val ? "Added to slider" : "Removed from slider"); fetchProfiles(); }
  };

  const deleteProfile = async (id: string) => {
    if (!confirm("Delete this profile page?")) return;
    const { error } = await supabase.from("user_profiles").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else { toast.success("Deleted"); fetchProfiles(); }
  };

  const statusColor = (s: string) =>
    s === "approved" ? "bg-green-100 text-green-700" :
    s === "rejected" ? "bg-red-100 text-red-700" :
    "bg-yellow-100 text-yellow-700";

  if (loading) return <PageWrapper title="User Profile Pages"><p>Loading...</p></PageWrapper>;

  return (
    <PageWrapper title="User Profile Pages">
      {profiles.length === 0 ? (
        <p className="text-muted-foreground">No profile submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {profiles.map(p => (
            <div key={p.id} className="bg-card rounded-xl border border-border p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
              <Avatar className="h-14 w-14 shrink-0">
                <AvatarImage src={p.photo_url ?? undefined} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {p.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                {p.designation && <p className="text-sm text-muted-foreground">{p.designation}</p>}
                {p.bio && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{p.bio}</p>}
              </div>
              <Badge className={statusColor(p.status)}>{p.status}</Badge>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Switch checked={p.show_in_slider} onCheckedChange={v => toggleSlider(p.id, v)} />
                  Slider
                </div>
                {p.status !== "approved" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, "approved")} className="active:scale-95">
                    <Check className="h-3 w-3 mr-1" /> Approve
                  </Button>
                )}
                {p.status !== "rejected" && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(p.id, "rejected")} className="active:scale-95 text-destructive border-destructive/30">
                    <X className="h-3 w-3 mr-1" /> Reject
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => deleteProfile(p.id)} className="active:scale-95">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
