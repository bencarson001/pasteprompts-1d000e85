import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Trash2, Check, Inbox, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  fetchFeedback, setFeedbackStatus, setFeedbackNote, deleteFeedback, type FeedbackMessage,
} from "@/lib/admin";
import { timeAgo } from "@/lib/format";
import { SectionHeader, Empty } from "./shared";

const FILTERS = [
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "resolved", label: "Resolved" },
  { id: "all", label: "All" },
] as const;

const statusStyles: Record<string, string> = {
  new: "bg-primary/15 text-primary-glow",
  read: "bg-secondary/70 text-muted-foreground",
  resolved: "bg-success/15 text-success",
};

function FeedbackRow({ m }: { m: FeedbackMessage }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [note, setNote] = useState(m.admin_note ?? "");
  const [savingNote, setSavingNote] = useState(false);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-feedback"] });
    qc.invalidateQueries({ queryKey: ["admin-feedback-unread"] });
  };

  const act = async (fn: () => Promise<void>, msg: string) => {
    try { await fn(); refresh(); toast({ title: msg }); }
    catch (e) { toast({ title: "Action failed", description: (e as Error).message, variant: "destructive" }); }
  };

  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{m.name}</span>
            <Badge className={`${statusStyles[m.status] ?? statusStyles.read} capitalize`}>{m.status}</Badge>
            <Badge variant="outline" className="capitalize border-white/15">{m.category}</Badge>
          </div>
          <a href={`mailto:${m.email}`} className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary-glow hover:underline">
            <Mail className="h-3.5 w-3.5" /> {m.email}
          </a>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(m.created_at)}</span>
      </div>

      {m.subject && <p className="mt-3 font-medium">{m.subject}</p>}
      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>

      <div className="mt-4 flex flex-col gap-3 border-t border-white/5 pt-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Private admin note</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add an internal note…"
            className="min-h-[40px] resize-y bg-card/60"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm" variant="secondary" disabled={savingNote}
            onClick={async () => { setSavingNote(true); await act(() => setFeedbackNote(m.id, note), "Note saved"); setSavingNote(false); }}
          >
            Save note
          </Button>
          {m.status !== "read" && (
            <Button size="sm" variant="outline" className="border-white/15"
              onClick={() => act(() => setFeedbackStatus(m.id, "read"), "Marked read")}>
              <CircleDot className="mr-1 h-4 w-4" /> Read
            </Button>
          )}
          {m.status !== "resolved" && (
            <Button size="sm" variant="outline" className="border-success/30 text-success"
              onClick={() => act(() => setFeedbackStatus(m.id, "resolved"), "Marked resolved")}>
              <Check className="mr-1 h-4 w-4" /> Resolve
            </Button>
          )}
          <Button size="sm" variant="outline" className="border-destructive/30 text-destructive"
            onClick={() => { if (confirm("Delete this message?")) act(() => deleteFeedback(m.id), "Deleted"); }}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminFeedback() {
  const [filter, setFilter] = useState<string>("new");
  const { data, isLoading } = useQuery({ queryKey: ["admin-feedback", filter], queryFn: () => fetchFeedback(filter) });

  return (
    <div>
      <SectionHeader title="Feedback inbox" desc="Messages sent from the contact form. Reply by email, then mark read or resolved." />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
              filter === f.id ? "bg-gradient-primary text-primary-foreground shadow-glow" : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
      ) : !data?.length ? (
        <Empty><Inbox className="mx-auto mb-3 h-8 w-8 opacity-50" />No messages in this view.</Empty>
      ) : (
        <div className="space-y-4">{data.map((m) => <FeedbackRow key={m.id} m={m} />)}</div>
      )}
    </div>
  );
}
