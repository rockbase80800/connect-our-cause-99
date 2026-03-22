import { useEffect, useState, useCallback } from "react";

import { PageWrapper } from "@/components/dashboard/PageWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Users, Loader2, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface TreeNode {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  children: TreeNode[];
}

export default function Referrals() {
  const { profile, refreshProfile } = useAuth();
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fallback: generate referral code if missing
  useEffect(() => {
    const ensureCode = async () => {
      if (profile && !profile.referral_code) {
        const { data } = await supabase.rpc("generate_referral_code");
        if (data) {
          await supabase
            .from("profiles")
            .update({ referral_code: data })
            .eq("id", profile.id);
          await refreshProfile();
        }
      }
    };
    ensureCode();
  }, [profile, refreshProfile]);

  const referralLink = profile?.referral_code
    ? `${window.location.origin}/auth?ref=${profile.referral_code}`
    : "";

  const buildTree = useCallback(async (parentId: string, depth: number): Promise<TreeNode[]> => {
    if (depth > 3) return [];
    const { data } = await supabase
      .from("profiles")
      .select("id, name, email, phone, created_at")
      .eq("referred_by", parentId)
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) return [];

    const nodes: TreeNode[] = [];
    for (const user of data) {
      const children = await buildTree(user.id, depth + 1);
      nodes.push({ ...user, children });
    }
    return nodes;
  }, []);

  const countAll = (nodes: TreeNode[]): number => {
    let count = nodes.length;
    for (const n of nodes) count += countAll(n.children);
    return count;
  };

  useEffect(() => {
    if (!profile) return;
    buildTree(profile.id, 1).then((nodes) => {
      setTree(nodes);
      setTotalCount(countAll(nodes));
      setLoading(false);
    });
  }, [profile, buildTree]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <PageWrapper>
      <div className="space-y-6">
        <h1 className="text-display text-2xl text-foreground">My Team</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="bg-muted text-sm" />
              <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0 active:scale-[0.95]">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Code: <span className="font-mono font-medium">{profile?.referral_code}</span>
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground">{tree.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Direct Referrals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground">{totalCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Team</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" /> My Tree
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tree.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No referrals yet. Share your link to invite others!
              </p>
            ) : (
              <div className="space-y-1">
                {tree.map((node) => (
                  <TreeNodeItem key={node.id} node={node} level={0} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

function TreeNodeItem({ node, level }: { node: TreeNode; level: number }) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = node.children.length > 0;

  return (
    <div style={{ paddingLeft: `${level * 16}px` }}>
      <button
        onClick={() => hasChildren && setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
      >
        <span className="w-5 flex-shrink-0">
          {hasChildren ? (
            expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <span className="inline-block w-4 h-4 rounded-full bg-primary/20" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{node.name || "Unnamed"}</p>
          <p className="text-xs text-muted-foreground truncate">{node.email} {node.phone ? `• ${node.phone}` : ""}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-muted-foreground">{new Date(node.created_at).toLocaleDateString()}</p>
          {hasChildren && <p className="text-xs text-primary">{node.children.length} referral{node.children.length > 1 ? "s" : ""}</p>}
        </div>
      </button>
      {expanded && hasChildren && (
        <div className="mt-1 space-y-1">
          {node.children.map((child) => (
            <TreeNodeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
