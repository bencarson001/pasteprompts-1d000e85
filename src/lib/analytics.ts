import { supabase } from "@/integrations/supabase/client";

const VISITOR_KEY = "pp_visitor_id";
const SESSION_KEY = "pp_session_id";

function uid() {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

/** Returns { id, isNew } — isNew is true only the very first time we see a visitor. */
function getVisitor(): { id: string; isNew: boolean } {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (id) return { id, isNew: false };
    id = uid();
    localStorage.setItem(VISITOR_KEY, id);
    return { id, isNew: true };
  } catch {
    return { id: uid(), isNew: true };
  }
}

function getSession(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = uid();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return uid();
  }
}

let lastPath = "";

/** Records a page view. De-duplicates rapid repeats of the same path. */
export function trackPageView(path: string) {
  if (path === lastPath) return;
  lastPath = path;
  const { id, isNew } = getVisitor();
  // Fire-and-forget; never block the UI or surface errors to users.
  void supabase
    .from("analytics_events")
    .insert({
      visitor_id: id,
      session_id: getSession(),
      event_type: "page_view",
      path,
      is_new_visitor: isNew,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
    } as never)
    .then(() => {}, () => {});
}

/** Records a prompt view (called from the prompt detail page). */
export function trackPromptView(promptId: string, path: string) {
  const { id, isNew } = getVisitor();
  void supabase
    .from("analytics_events")
    .insert({
      visitor_id: id,
      session_id: getSession(),
      event_type: "prompt_view",
      path,
      prompt_id: promptId,
      is_new_visitor: isNew,
    } as never)
    .then(() => {}, () => {});
}
