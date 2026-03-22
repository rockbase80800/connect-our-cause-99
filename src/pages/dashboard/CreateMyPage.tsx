import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { compressImage } from "@/lib/image-utils";

export default function CreateMyPage() {
  const { user } = useAuth();
  const [existing, setExisting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [designation, setDesignation] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExisting(data);
          setName(data.name || "");
          setBio(data.bio || "");
          setDescription(data.description || "");
          setContact(data.contact || "");
          setDesignation(data.designation || "");
          setPhotoPreview(data.photo_url);
        }
        setLoading(false);
      });
  }, [user]);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 800);
    setPhotoFile(compressed);
    setPhotoPreview(URL.createObjectURL(compressed));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);

    let photo_url = existing?.photo_url || null;

    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `${user.id}/profile.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, photoFile, { upsert: true });
      if (upErr) {
        toast.error("Photo upload failed");
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      photo_url = urlData.publicUrl;
    }

    const payload = {
      user_id: user.id,
      name: name.trim(),
      bio: bio.trim() || null,
      description: description.trim() || null,
      contact: contact.trim() || null,
      designation: designation.trim() || null,
      photo_url,
      status: "pending",
    };

    let error;
    if (existing) {
      ({ error } = await supabase
        .from("user_profiles")
        .update({ ...payload, status: "pending" })
        .eq("user_id", user.id));
    } else {
      ({ error } = await supabase.from("user_profiles").insert(payload));
    }

    if (error) {
      console.error("Save error:", error);
      toast.error("Failed to save profile page");
    } else {
      toast.success(existing ? "Profile updated! Pending approval." : "Profile submitted for approval!");
      setExisting({ ...payload });
    }
    setSaving(false);
  };

  if (loading) return <PageWrapper><p>Loading...</p></PageWrapper>;

  return (
    <PageWrapper>
      {existing?.status && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
          existing.status === "approved" ? "bg-green-100 text-green-800" :
          existing.status === "rejected" ? "bg-red-100 text-red-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          Status: {existing.status.charAt(0).toUpperCase() + existing.status.slice(1)}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
        <div>
          <Label>Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Designation</Label>
          <Input value={designation} onChange={e => setDesignation(e.target.value)} placeholder="e.g. District Coordinator" />
        </div>
        <div>
          <Label>Photo</Label>
          {photoPreview && <img src={photoPreview} alt="Preview" className="h-24 w-24 rounded-full object-cover mb-2" />}
          <Input type="file" accept="image/*" onChange={handlePhoto} />
        </div>
        <div>
          <Label>Short Bio</Label>
          <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} placeholder="A brief introduction..." />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Detailed description..." />
        </div>
        <div>
          <Label>Contact Info</Label>
          <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="Email or phone" />
        </div>
        <Button type="submit" disabled={saving} className="active:scale-95 transition-transform">
          {saving ? "Saving..." : existing ? "Update Page" : "Submit for Approval"}
        </Button>
      </form>
    </PageWrapper>
  );
}
