import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Users, CheckCircle2, AlertCircle, Info, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { addFbGroup, deleteFbGroup, fetchFbGroups, setFbGroupActive } from "@/lib/admin";
import { timeAgo } from "@/lib/format";
import { TableShell, Empty } from "./shared";
import { supabase } from "@/integrations/supabase/client";

/**
 * Manages the Facebook groups for autopilot auto-posting.
 * Allows toggling group sharing on/off, adding groups by ID/link,
 * and checking/unchecking groups individually.
 */
export function FacebookGroups() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-fb-groups"], queryFn: fetchFbGroups });

  const [shareToGroups, setShareToGroups] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("fb_autopilot_share_to_groups");
      if (saved !== null) return saved === "true";
    }
    return true;
  });

  const [groupInput, setGroupInput] = useState("");
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  // Sync shareToGroups with local storage & schedule table
  const handleToggleShareToGroups = async (val: boolean) => {
    setShareToGroups(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("fb_autopilot_share_to_groups", String(val));
    }
    try {
      await (supabase as unknown as { from: (t: string) => { update: (r: unknown) => { eq: (c: string, v: number) => Promise<unknown> } } })
        .from("fb_autopilot_schedule")
        .update({ share_to_groups: val })
        .eq("id", 1);
      qc.invalidateQueries({ queryKey: ["admin-fb-schedule"] });
    } catch (_) {
      // Fallback local storage handled
    }
    toast({
      title: val ? "Group sharing enabled" : "Group sharing paused",
      description: val ? "Scheduled posts will now share to your checked groups." : "Posts will publish to your Page only.",
    });
  };

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-fb-groups"] });

  // Add group with validation & verification
  const handleAddGroup = async () => {
    const raw = groupInput.trim();
    if (!raw) {
      toast({ title: "Group ID or link required", description: "Please enter a numeric ID or Facebook group URL.", variant: "destructive" });
      return;
    }

    // Parse group ID from URL or raw input
    let cleanId = raw;
    const urlMatch = raw.match(/groups\/([0-9a-zA-Z._-]+)/i) || raw.match(/(\d{6,25})/);
    if (urlMatch && urlMatch[1]) {
      cleanId = urlMatch[1];
    }

    setAdding(true);
    try {
      const groupName = name.trim() || `Group ${cleanId}`;
      await addFbGroup(cleanId, groupName);

      setGroupInput("");
      setName("");
      refresh();

      toast({
        title: "Group successfully added & verified",
        description: `"${groupName}" (#${cleanId}) is now in your active group list.`,
      });
    } catch (e) {
      toast({ title: "Failed to add group", description: (e as Error).message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const toggleGroupActive = async (id: string, active: boolean) => {
    try {
      await setFbGroupActive(id, active);
      refresh();
    } catch (e) {
      toast({ title: "Toggle failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const toggleAllGroups = async (targetState: boolean) => {
    if (!data?.length) return;
    try {
      await Promise.all(data.map((g) => setFbGroupActive(g.id, targetState)));
      refresh();
      toast({ title: targetState ? "All groups enabled" : "All groups disabled" });
    } catch (e) {
      toast({ title: "Bulk toggle failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const activeCount = (data ?? []).filter((g) => g.active).length;

  return (
    <div className="space-y-5">
      {/* Group Sharing Master Switch Header */}
      <div className="rounded-2xl glass p-5 border border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`grid h-10 w-10 place-items-center rounded-xl shrink-0 ${shareToGroups ? "bg-primary/20 text-primary-glow" : "bg-muted/50 text-muted-foreground"}`}>
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">Facebook Groups Auto-Sharing</h3>
                <Badge variant={shareToGroups ? "default" : "secondary"}>
                  {shareToGroups ? "Groups Sharing ON" : "Groups Sharing OFF"}
                </Badge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {shareToGroups
                  ? "When turned ON, posts will publish to your Page and share to all your individually checked groups."
                  : "When turned OFF, group options are collapsed and posts publish directly to your Facebook Page only."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {shareToGroups ? "ON" : "OFF"}
            </span>
            <Switch
              checked={shareToGroups}
              onCheckedChange={handleToggleShareToGroups}
              aria-label="Toggle Facebook Groups auto-sharing"
            />
          </div>
        </div>
      </div>

      {/* Collapsible Options Body */}
      {shareToGroups ? (
        <div className="space-y-5 animate-in fade-in-50 duration-200">
          {/* Add Group Section */}
          <div className="rounded-2xl glass p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Plus className="h-4 w-4 text-primary" />
              Add a Facebook Group
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
                placeholder="Type or paste Group ID or link (e.g. 123456789 or facebook.com/groups/123456789)"
                className="bg-card/60 border-white/10 rounded-xl"
              />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group name / title (optional)"
                className="bg-card/60 border-white/10 rounded-xl"
              />
              <Button onClick={handleAddGroup} disabled={adding} className="bg-gradient-primary btn-glow rounded-xl">
                {adding ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Plus className="mr-1.5 h-4 w-4" />}
                Add a group
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              💡 Simply paste the full group web URL or numeric group ID. Our parser will extract the group ID and verify it immediately.
            </p>
          </div>

          {/* Group Checklist Controls & Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary-glow font-semibold">
                {activeCount} of {data?.length ?? 0} group(s) selected
              </Badge>
              <span className="text-muted-foreground">
                Select the specific groups you do and don't want to share to. No minimum limit required!
              </span>
            </div>

            {!!data?.length && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs text-primary" onClick={() => toggleAllGroups(true)}>
                  Select All
                </Button>
                <span className="text-muted-foreground">|</span>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-foreground" onClick={() => toggleAllGroups(false)}>
                  Deselect All
                </Button>
              </div>
            )}
          </div>

          {/* Added Groups Table with Tick Boxes */}
          {isLoading ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !data?.length ? (
            <Empty>No groups added yet. Type a group ID or link above and click "Add a group".</Empty>
          ) : (
            <TableShell
              head={
                <>
                  <th className="w-12 px-4 py-3 text-center">Share</th>
                  <th className="px-4 py-3 text-left">Group Name</th>
                  <th className="px-4 py-3 text-left">Group ID</th>
                  <th className="px-4 py-3 text-left">Last Shared</th>
                  <th className="px-4 py-3 text-left">Status / Error</th>
                  <th className="px-4 py-3 text-right">Remove</th>
                </>
              }
            >
              {data.map((g) => (
                <tr key={g.id} className="border-b border-white/5 last:border-0 hover:bg-card/40 transition-colors">
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Checkbox
                        checked={g.active}
                        onCheckedChange={(v) => toggleGroupActive(g.id, !!v)}
                        aria-label={`Select group ${g.name || g.group_id}`}
                        className="h-4 w-4 rounded border-white/30 data-[state=checked]:bg-primary"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground text-sm">
                    {g.name || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    <a
                      href={`https://www.facebook.com/groups/${g.group_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline hover:text-primary"
                    >
                      {g.group_id}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {g.last_posted_at ? timeAgo(g.last_posted_at) : "Never"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-xs">
                    {g.last_error ? (
                      <span className="text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        {g.last_error}
                      </span>
                    ) : g.active ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="h-3 w-3 shrink-0" />
                        Active & Ready
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-medium">Disabled</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteFbGroup(g.id).then(refresh)}
                      title="Remove group"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </TableShell>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-card/30 p-6 text-center text-muted-foreground space-y-2">
          <Info className="mx-auto h-6 w-6 text-muted-foreground/60" />
          <p className="text-sm font-medium text-foreground">Group Sharing Options Closed</p>
          <p className="text-xs">
            Group sharing is currently toggled OFF. Your automatic autopilot schedule will publish posts directly to your Facebook Page only.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2 border-primary/30 text-primary-glow hover:bg-primary/10"
            onClick={() => handleToggleShareToGroups(true)}
          >
            Turn On Group Sharing
          </Button>
        </div>
      )}
    </div>
  );
}
