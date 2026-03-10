import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { jwtDecode } from "jwt-decode";
import { supabase } from "../lib/supabase";
import type { AppRole, AuthUser, JWTClaims } from "../types/auth";

// Admin email configuration — emails listed here get CEO role
const ADMIN_EMAILS = new Set([
  "matome@fairflow.dev",
  "sobuhle@fairflow.dev",
  "matome.mb@fairflow.dev",
  "sobuhle.n@fairflow.dev",
  "matome",
  "sobuhle",
]);

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  function extractRoleFromSession(session: Session | null): AppRole | null {
    if (!session?.access_token) return null;
    try {
      const decoded = jwtDecode<JWTClaims>(session.access_token);
      const userEmail = session.user.email?.toLowerCase() || "";
      
      // Override role to CEO if email is in admin list
      if (ADMIN_EMAILS.has(userEmail)) {
        return "ceo";
      }
      
      return decoded.user_role ?? "consumer";
    } catch {
      return "consumer";
    }
  }

  function buildUser(session: Session, appRole: AppRole): AuthUser {
    return {
      id: session.user.id,
      email: session.user.email ?? "",
      role: appRole,
      name: session.user.user_metadata?.full_name,
      avatarUrl: session.user.user_metadata?.avatar_url,
    };
  }

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        let appRole = extractRoleFromSession(session);
        if (session && appRole) {
          setRole(appRole);
          setUser(buildUser(session, appRole));
        } else {
          const devEmail = typeof window !== 'undefined' ? sessionStorage.getItem('devAdminEmail') : null;
          console.log("[fairflow] Checking devAdminEmail:", devEmail);
          if (devEmail && ADMIN_EMAILS.has(devEmail)) {
            appRole = 'ceo';
            console.log("[fairflow] Setting dev admin role:", appRole);
            setRole(appRole);
            setUser({ id: 'dev-admin', email: devEmail, role: 'ceo', name: null, avatarUrl: null });
          } else {
            console.log("[fairflow] No session or dev admin email found");
            setRole(appRole);
          }
        }
      })
      .catch((err) => {
        console.error("[fairflow] Failed to restore session:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        setSession(session);
        const appRole = extractRoleFromSession(session);
        setRole(appRole);
        if (session && appRole) {
          setUser(buildUser(session, appRole));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("[fairflow] Auth state change error:", err);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') sessionStorage.removeItem('devAdminEmail');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signInWithGoogle, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
