import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Shield } from "lucide-react";
import { toast } from "sonner";

const ALL_ROLES = [
  "super_admin",
  "state_admin",
  "admin",
  "district_coordinator",
  "block_coordinator",
  "panchayat_coordinator",
  "user",
];

const COORDINATOR_ROLES = [
  "district_coordinator",
  "block_coordinator",
  "panchayat_coordinator",
];

export default function AssignRoles() {
  const { primaryRole } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [areaState, setAreaState] = useState("");
  const [areaDistrict, setAreaDistrict] = useState("");
  const [areaBlock, setAreaBlock] = useState("");
  const [areaPanchayat, setAreaPanchayat] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const allowedRoles = primaryRole === "super_admin" ? ALL_ROLES : COORDINATOR_ROLES;

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*, user_roles(role)")
      .order("name")
      .then(({ data }) => {
        setUsers(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedUser || !selectedRole) return;
    setSaving(true);

    // Update profile area fields
    const profileUpdate: any = {};
    if (areaState) profileUpdate.state = areaState;
    if (areaDistrict) profileUpdate.district = areaDistrict;
    if (areaBlock) profileUpdate.block = areaBlock;
    if (areaPanchayat) profileUpdate.panchayat = areaPanchayat;

    if (Object.keys(profileUpdate).length > 0) {
      await supabase.from("profiles").update(profileUpdate).eq("id", selectedUser.id);
    }

    // Insert role (ignore if already exists)
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: selectedUser.id, role: selectedRole as any });

    if (error) toast.error(error.message);
    else {
      toast.success(`Role "${selectedRole.replace(/_/g, " ")}" assigned to ${selectedUser.name}`);
      setSelectedUser(null);
      setSelectedRole("");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-display text-2xl text-foreground flex items-center gap-2">
        <Shield className="h-6 w-6" /> Assign Roles
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="max-h-80 overflow-y-auto space-y-1">
              {filtered.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    setAreaState(u.state ?? "");
                    setAreaDistrict(u.district ?? "");
                    setAreaBlock(u.block ?? "");
                    setAreaPanchayat(u.panchayat ?? "");
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                    selectedUser?.id === u.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted"
                  }`}
                >
                  <p className="font-medium">{u.name ?? "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedUser ? `Assign to ${selectedUser.name}` : "Select a user first"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedUser ? (
              <>
                <div>
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger><SelectValue placeholder="Select role..." /></SelectTrigger>
                    <SelectContent>
                      {allowedRoles.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={areaState} onChange={(e) => setAreaState(e.target.value)} placeholder="e.g. Bihar" />
                </div>
                <div>
                  <Label>District</Label>
                  <Input value={areaDistrict} onChange={(e) => setAreaDistrict(e.target.value)} />
                </div>
                <div>
                  <Label>Block</Label>
                  <Input value={areaBlock} onChange={(e) => setAreaBlock(e.target.value)} />
                </div>
                <div>
                  <Label>Panchayat</Label>
                  <Input value={areaPanchayat} onChange={(e) => setAreaPanchayat(e.target.value)} />
                </div>
                <Button onClick={handleAssign} disabled={saving || !selectedRole} className="w-full active:scale-[0.97]">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign Role"}
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Select a user from the left panel to assign a role.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
