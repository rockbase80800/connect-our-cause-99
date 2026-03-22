import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Shield, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ALL_ROLES = [
  "super_admin",
  "state_admin",
  "admin",
  "district_coordinator",
  "block_coordinator",
  "panchayat_coordinator",
  "own_page",
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

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [editRole, setEditRole] = useState("");
  const [editState, setEditState] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editBlock, setEditBlock] = useState("");
  const [editPanchayat, setEditPanchayat] = useState("");

  // Delete confirm state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<any>(null);

  const allowedRoles = primaryRole === "super_admin" ? ALL_ROLES : COORDINATOR_ROLES;

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*, user_roles(id, role)")
      .order("name");
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter(
    (u) =>
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedUser || !selectedRole) return;
    setSaving(true);

    const profileUpdate: any = {};
    if (areaState) profileUpdate.state = areaState;
    if (areaDistrict) profileUpdate.district = areaDistrict;
    if (areaBlock) profileUpdate.block = areaBlock;
    if (areaPanchayat) profileUpdate.panchayat = areaPanchayat;

    if (Object.keys(profileUpdate).length > 0) {
      await supabase.from("profiles").update(profileUpdate).eq("id", selectedUser.id);
    }

    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: selectedUser.id, role: selectedRole as any });

    if (error) toast.error(error.message);
    else {
      toast.success(`Role "${selectedRole.replace(/_/g, " ")}" assigned to ${selectedUser.name}`);
      setSelectedUser(null);
      setSelectedRole("");
      fetchUsers();
    }
    setSaving(false);
  };

  const openEdit = (user: any, roleEntry: any) => {
    setEditingRole({ userId: user.id, roleId: roleEntry.id, userName: user.name });
    setEditRole(roleEntry.role);
    setEditState(user.state ?? "");
    setEditDistrict(user.district ?? "");
    setEditBlock(user.block ?? "");
    setEditPanchayat(user.panchayat ?? "");
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingRole || !editRole) return;
    setSaving(true);

    // Update role
    const { error } = await supabase
      .from("user_roles")
      .update({ role: editRole as any })
      .eq("id", editingRole.roleId);

    if (error) { toast.error(error.message); setSaving(false); return; }

    // Update area
    await supabase.from("profiles").update({
      state: editState || null,
      district: editDistrict || null,
      block: editBlock || null,
      panchayat: editPanchayat || null,
    }).eq("id", editingRole.userId);

    toast.success("Role updated successfully");
    setEditOpen(false);
    setSaving(false);
    fetchUsers();
  };

  const openDelete = (user: any, roleEntry: any) => {
    if (roleEntry.role === "super_admin") {
      toast.error("Cannot remove Super Admin role");
      return;
    }
    setDeletingRole({ userId: user.id, roleId: roleEntry.id, userName: user.name, role: roleEntry.role });
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    setSaving(true);
    const { error } = await supabase.from("user_roles").delete().eq("id", deletingRole.roleId);
    if (error) toast.error(error.message);
    else {
      toast.success(`Role removed from ${deletingRole.userName}`);
      fetchUsers();
    }
    setSaving(false);
    setDeleteOpen(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-display text-2xl text-foreground flex items-center gap-2">
        <Shield className="h-6 w-6" /> Assign Roles
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User list with existing roles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Users & Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="max-h-[28rem] overflow-y-auto space-y-2">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className={`p-3 rounded-lg border text-sm transition-colors cursor-pointer ${
                    selectedUser?.id === u.id
                      ? "bg-primary/10 border-primary/30"
                      : "border-border/60 hover:bg-muted"
                  }`}
                  onClick={() => {
                    setSelectedUser(u);
                    setAreaState(u.state ?? "");
                    setAreaDistrict(u.district ?? "");
                    setAreaBlock(u.block ?? "");
                    setAreaPanchayat(u.panchayat ?? "");
                  }}
                >
                  <p className="font-medium">{u.name ?? "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground mb-2">{u.email}</p>
                  <div className="flex flex-wrap gap-1">
                    {u.user_roles?.map((r: any) => (
                      <div key={r.id} className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {r.role.replace(/_/g, " ")}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); openEdit(u, r); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); openDelete(u, r); }}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
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
                <div><Label>State</Label><Input value={areaState} onChange={(e) => setAreaState(e.target.value)} placeholder="e.g. Bihar" /></div>
                <div><Label>District</Label><Input value={areaDistrict} onChange={(e) => setAreaDistrict(e.target.value)} /></div>
                <div><Label>Block</Label><Input value={areaBlock} onChange={(e) => setAreaBlock(e.target.value)} /></div>
                <div><Label>Panchayat</Label><Input value={areaPanchayat} onChange={(e) => setAreaPanchayat(e.target.value)} /></div>
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

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role — {editingRole?.userName}</DialogTitle>
            <DialogDescription>Update the role and area assignment for this user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allowedRoles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>State</Label><Input value={editState} onChange={(e) => setEditState(e.target.value)} /></div>
            <div><Label>District</Label><Input value={editDistrict} onChange={(e) => setEditDistrict(e.target.value)} /></div>
            <div><Label>Block</Label><Input value={editBlock} onChange={(e) => setEditBlock(e.target.value)} /></div>
            <div><Label>Panchayat</Label><Input value={editPanchayat} onChange={(e) => setEditPanchayat(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove the role <strong>"{deletingRole?.role?.replace(/_/g, " ")}"</strong> from <strong>{deletingRole?.userName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
