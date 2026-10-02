import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { checkReservedName } from "@/lib/reservedNames";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  roleLoading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null; user?: User | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Remove any leftover fake admin session from the old "quick login".
if (typeof window !== "undefined") {
  try { localStorage.removeItem("paste_prompts_admin_session"); } catch { /* ignore */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const lastUserId = useRef<string | null>(null);

  async function syncProfile(u: User) {
    if (!u.email) return;
    try {
      const { data: existing, error } = await supabase.from("profiles").select("id").eq("id", u.id).maybeSingle();
      if (!error && existing) return;
      const rawHandle = (u.email.split("@")[0] ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const handle = checkReservedName(rawHandle, u.email).isReserved
        ? `user_${u.id.replace(/-/g, "").slice(0, 8)}`
        : rawHandle;
      let displayName = u.user_metadata?.["full_name"] || u.user_metadata?.["display_name"] || handle;
      if (checkReservedName(displayName, u.email).isReserved) {
        displayName = `User ${u.id.replace(/-/g, "").slice(0, 6)}`;
      }
      await supabase.from("profiles").upsert(
        { id: u.id, handle, display_name: displayName, avatar_url: u.user_metadata?.["avatar_url"] || "", updated_at: new Date().toISOString() },
        { onConflict: "id" },
      );
    } catch (e) {
      console.warn("Profile sync failed:", e);
    }
  }

  // Admin status comes only from the server-side user_roles table.
  async function fetchRole(userId: string) {
    setRoleLoading(true);
    try {
      const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      setIsAdmin(!error && data === true);
    } catch {
      setIsAdmin(false);
    } finally {
      setRoleLoading(false);
    }
  }

  function applySession(s: Session | null) {
    setSession(s);
    setUser(s?.user ?? null);
    const uid = s?.user?.id ?? null;
    if (!uid) {
      lastUserId.current = null;
      setIsAdmin(false);
      setRoleLoading(false);
      return;
    }
    if (uid !== lastUserId.current) {
      lastUserId.current = uid;
      if (s?.user) {
        fetchRole(s.user.id);
        syncProfile(s.user);
      } else {
        setIsAdmin(false);
        setRoleLoading(false);
      }
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      applySession(s);
      setLoading(false);
    });
    supabase.auth.getSession()
      .then(({ data: { session: s } }) => applySession(s))
      .catch((err) => console.warn("Initial session fetch error:", err))
      .finally(() => setLoading(false));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp: AuthContextValue["signUp"] = async (email, password, displayName) => {
    const reservedCheck = checkReservedName(displayName, email);
    if (reservedCheck.isReserved) {
      return { error: reservedCheck.reason ?? "This display name is reserved for platform administrators." };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/`, data: { display_name: displayName } },
    });
    return { error: error?.message ?? null, user: data?.user };
  };

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    void redirectTo;
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: { prompt: "select_account" },
    });
    if (result.redirected) return;
    if (result.error) {
      throw new Error((result.error as Error)?.message || "Google sign-in failed. Please try again or use email sign-in.");
    }
  };

  const signOut = async () => {
    try { await supabase.auth.signOut(); } catch (e) { console.warn("Sign out error:", e); }
    lastUserId.current = null;
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, roleLoading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
