import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { addFbGroup, deleteFbGroup, fetchFbGroups, setFbGroupActive } from "@/lib/admin";
import { timeAgo } from "@/lib/format";
import { TableShell, Empty } from "./shared";

/**
 * Manages the Facebook groups the autopilot and the social scheduler share to.
 * Every Facebook post picks 9 random active groups at posting time.
 */
export function FacebookGroups() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-fb-groups"], queryFn: fetchFbGroups });
  const [groupId, setGroupId] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-fb-groups"] });

  const add = async () => {
    if (!groupId.trim()) { toast({ title: "Group ID required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      await addFbGroup(groupId.trim(), name.trim() || groupId.trim());
      setGroupId(""); setName(""); refresh(); toast({ title: "Group added" });
    } catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const activeCount = (data ?? []).filter((g) => g.active).length;

  return (
    <div>
      <div className="mb-4 grid gap-3 rounded-2xl glass p-5 sm:grid-cols-[1fr_1fr_auto]">
        <Input value={groupId} onChange={(e) => setGroupId(e.target.value)} placeholder="Facebook group ID (numeric)" />
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name (optional)" />
        <Button onClick={add} disabled={saving}>
          {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}Add group
        </Button>
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        {activeCount} active group{activeCount === 1 ? "" : "s"}. Each Facebook post is shared to 9 randomly chosen
        active groups straight after it publishes to the Page.
      </p>

      {isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : !data?.length ? (
        <Empty>No groups yet. Add the group IDs you want autopilot posts shared to.</Empty>
      ) : (
        <TableShell head={<>
          <th className="px-4 py-3">Group</th><th className="px-4 py-3">ID</th>
          <th className="px-4 py-3">Last shared</th><th className="px-4 py-3">Last error</th>
          <th className="px-4 py-3">Active</th><th className="px-4 py-3 text-right">Remove</th>
        </>}>
          {data.map((g) => (
            <tr key={g.id} className="border-b border-white/5 last:border-0 hover:bg-card/40">
              <td className="px-4 py-3">{g.name || "—"}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{g.group_id}</td>
              <td className="px-4 py-3 text-muted-foreground">{g.last_posted_at ? timeAgo(g.last_posted_at) : "—"}</td>
              <td className="max-w-xs truncate px-4 py-3 text-xs text-destructive">{g.last_error ?? ""}</td>
              <td className="px-4 py-3">
                <Switch
                  checked={g.active}
                  onCheckedChange={(v) => setFbGroupActive(g.id, v).then(refresh)}
                  aria-label={`Toggle posting to ${g.name || g.group_id}`}
                />
              </td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => deleteFbGroup(g.id).then(refresh)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </div>
  );
}
