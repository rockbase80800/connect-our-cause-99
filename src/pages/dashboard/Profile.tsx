import { useState } from "react";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name, phone })
      .eq("id", profile.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated");
      await refreshProfile();
    }
    setSaving(false);
  };

  if (!profile) return null;

  return (
    <PageWrapper><div className="space-y-6 max-w-2xl">
      <h1 className="text-display text-2xl text-foreground">My Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={profile.email ?? ""} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>State</Label>
                <Input value={profile.state ?? ""} disabled className="bg-muted" />
              </div>
              <div>
                <Label>District</Label>
                <Input value={profile.district ?? ""} disabled className="bg-muted" />
              </div>
            </div>
            <Button type="submit" disabled={saving} className="active:scale-[0.97]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
