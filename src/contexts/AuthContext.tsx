import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { toValidUuid } from "@/lib/uuid";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { signInWithGoogleFirebase, auth as firebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { checkReservedName, isPlatformAdmin, ADMIN_EMAIL } from "@/lib/reservedNames";

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

function mapFirebaseUser(fbUser: FirebaseUser): User {
  const handle = fbUser.email ? fbUser.email.split("@")[0] : "user";
  const validId = toValidUuid(fbUser.uid);
  return {
    id: validId,
    app_metadata: { provider: "google", firebase_uid: fbUser.uid },
    user_metadata: {
      display_name: fbUser.displayName || handle,
      avatar_url: fbUser.photoURL || "",
      full_name: fbUser.displayName || "",
    },
    aud: "authenticated",
    created_at: fbUser.metadata?.creationTime || new Date().toISOString(),
    email: fbUser.email || "",
    phone: fbUser.phoneNumber || "",
    role: "authenticated",
    updated_at: fbUser.metadata?.lastSignInTime || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  // Synchronizes profile data in Supabase if it does not exist
  async function syncSupabaseProfile(supabaseUser: User) {
    if (!supabaseUser.email) return;
    const rawHandle = supabaseUser.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const isAdminUser = isPlatformAdmin(supabaseUser.email, isAdmin);
    const reservedCheck = checkReservedName(rawHandle, supabaseUser.email, isAdmin);
    const handle = reservedCheck.isReserved
      ? `user_${supabaseUser.id.replace(/-/g, "").slice(0, 8)}`
      : rawHandle;
    
    try {
      const { data: existingProfile, error: fetchErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", supabaseUser.id)
        .maybeSingle();

      if (!fetchErr && existingProfile) {
        // Profile already exists; preserve it to avoid overwriting user edits
        return;
      }

      // If no profile exists, create a new one using user metadata
      let displayName = supabaseUser.user_metadata?.full_name || 
                        supabaseUser.user_metadata?.display_name || 
                        handle;
      const displayReserved = checkReservedName(displayName, supabaseUser.email, isAdmin);
      if (displayReserved.isReserved) {
        displayName = `User ${supabaseUser.id.replace(/-/g, "").slice(0, 6)}`;
      }
      const avatarUrl = supabaseUser.user_metadata?.avatar_url || "";

      const { error: upsertErr } = await supabase.from("profiles").upsert({
        id: supabaseUser.id,
        handle: handle,
        display_name: displayName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

      if (upsertErr) {
        console.warn("Supabase profile sync error during login:", upsertErr);
      }
    } catch (e) {
      console.warn("syncSupabaseProfile exception:", e);
    }
  }

  async function fetchRole(userId: string, email?: string) {
    setRoleLoading(true);
    const validUserId = toValidUuid(userId);
    const isAdminEmail = isPlatformAdmin(email);
    if (isAdminEmail) {
      supabase.from("user_roles").upsert({ user_id: validUserId, role: "admin" as never }, { onConflict: "user_id,role" }).then(() => {}, () => {});
    }
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", validUserId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.warn("fetchRole error:", error);
        setIsAdmin(isAdminEmail);
      } else {
        setIsAdmin(!!data || isAdminEmail);
      }
    } catch (err) {
      console.warn("fetchRole exception:", err);
      setIsAdmin(isAdminEmail);
    } finally {
      setRoleLoading(false);
    }
  }

  useEffect(() => {
    let supabaseDone = false;
    let firebaseDone = false;
    let currentSupabaseUser: User | null = null;
    let currentSupabaseSession: Session | null = null;
    let currentFirebaseUser: FirebaseUser | null = null;

    function checkReady() {
      if (supabaseDone && firebaseDone) {
        // Reconcile user
        if (currentSupabaseUser) {
          setUser(currentSupabaseUser);
          setSession(currentSupabaseSession);
          fetchRole(currentSupabaseUser.id, currentSupabaseUser.email);
        } else if (currentFirebaseUser) {
          const mapped = mapFirebaseUser(currentFirebaseUser);
          setUser(mapped);
          setSession(null);
          fetchRole(currentFirebaseUser.uid, currentFirebaseUser.email);
        } else {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setRoleLoading(false);
        }
        setLoading(false);
      }
    }

    // 1. Listen to Supabase Auth State
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      currentSupabaseSession = newSession;
      currentSupabaseUser = newSession?.user ?? null;
      
      // If we already finished loading, we can directly update state for runtime events
      if (!loading) {
        if (currentSupabaseUser) {
          setUser(currentSupabaseUser);
          setSession(currentSupabaseSession);
          fetchRole(currentSupabaseUser.id, currentSupabaseUser.email);
          syncSupabaseProfile(currentSupabaseUser);
        } else if (!currentFirebaseUser) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setRoleLoading(false);
        }
      }
    });

    // Get initial Supabase Session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      currentSupabaseSession = s;
      currentSupabaseUser = s?.user ?? null;
      if (s?.user) {
        syncSupabaseProfile(s.user);
      }
      supabaseDone = true;
      checkReady();
    }).catch((err) => {
      console.warn("Supabase initial session fetch error:", err);
      supabaseDone = true;
      checkReady();
    });

    // 2. Listen to Firebase Auth State
    const unsubscribeFirebase = onAuthStateChanged(firebaseAuth, (fbUser) => {
      currentFirebaseUser = fbUser;
      
      if (!firebaseDone) {
        firebaseDone = true;
        checkReady();
      } else {
        // Handle runtime Firebase logins/logouts
        if (fbUser) {
          const mapped = mapFirebaseUser(fbUser);
          setUser(mapped);
          setSession(null);
          fetchRole(mapped.id, fbUser.email);
          
          // Sync profile to Supabase on sign-in
          if (fbUser.email) {
            const handle = fbUser.email.split("@")[0];
            const displayName = fbUser.displayName || handle;
            const avatarUrl = fbUser.photoURL || "";
            
            supabase.from("profiles").upsert({
              id: mapped.id,
              handle: handle,
              display_name: displayName,
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString(),
            }, { onConflict: "id" }).then(({ error }) => {
              if (error) console.warn("Supabase profile sync error:", error);
            });
          }
        } else if (!currentSupabaseUser) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setRoleLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      unsubscribeFirebase();
    };
  }, [loading]);

  const signUp: AuthContextValue["signUp"] = async (email, password, displayName) => {
    // Validate that non-admin accounts cannot register with reserved names
    const reservedCheck = checkReservedName(displayName, email);
    if (reservedCheck.isReserved) {
      return { error: reservedCheck.reason ?? "This display name is reserved for platform administrators." };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: displayName },
      },
    });
    if (data?.user) {
      setUser(data.user);
    }
    return { error: error?.message ?? null, user: data?.user };
  };

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signInWithGoogle = async (redirectTo?: string) => {
    // Lovable Cloud managed Google OAuth. redirect_uri must be a public,
    // same-origin URL (never a protected route) — the intended destination is
    // handled by the caller after the session is set.
    void redirectTo;
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: { prompt: "select_account" },
    });

    if (result.redirected) return;
    if (result.error) {
      throw new Error(
        (result.error as Error)?.message || "Google sign-in failed. Please try again or use email sign-in.",
      );
    }
  };


  const signOut = async () => {
    try {
      await firebaseAuth.signOut();
    } catch (e) {
      console.warn("Firebase sign out error:", e);
    }
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase sign out error:", e);
    }
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
