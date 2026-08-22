import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Announcement {
  id: string;
  title: string;
  body: string | null;
  level: string | null;
}

const DISMISS_KEY = "pp_dismissed_announcements";

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

const toneStyles: Record<string, string> = {
  info: "bg-gradient-primary text-primary-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  alert: "bg-destructive text-destructive-foreground",
};

/**
 * Site-wide announcement banner. Reads active announcements (public RLS) and
 * shows the most recent un-dismissed one at the very top of every page —
 * visible to logged-out and logged-in visitors alike.
 */
export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  useEffect(() => setDismissed(getDismissed()), []);

  const { data } = useQuery({
    queryKey: ["public-announcements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("announcements")
        .select("id, title, body, level")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(5);
      return (data ?? []) as Announcement[];
    },
    staleTime: 60_000,
  });

  const active = (data ?? []).find((a) => !dismissed.includes(a.id));
  if (!active) return null;

  const dismiss = () => {
    const next = [...dismissed, active.id];
    setDismissed(next);
    try {
      localStorage.setItem(DISMISS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={`relative ${toneStyles[active.level ?? "info"] ?? toneStyles.info}`}>
      <div className="container-wide flex items-center justify-center gap-1.5 px-6 py-0.5 text-center text-[10px] font-semibold leading-normal sm:gap-2 sm:px-8 sm:py-1 sm:text-xs">
        <Megaphone className="h-3 w-3 shrink-0 opacity-90 sm:h-3.5 sm:w-3.5" />
        <span className="truncate sm:overflow-visible sm:whitespace-normal">
          <span className="font-bold">{active.title}</span>
          {active.body ? <span className="opacity-90"> — {active.body}</span> : null}
        </span>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 opacity-80 transition hover:opacity-100 sm:right-3"
      >
        <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
      </button>
    </div>
  );
}

export default AnnouncementBanner;
