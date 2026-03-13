import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { jwtDecode } from "jwt-decode";
import { supabase } from "../lib/supabase";
import type { AppRole, AuthUser, JWTClaims } from "../types/auth";

// Admin email configuration — emails listed here get CEO role
const STATIC_ADMIN_EMAILS = [
  "matome@fairflow.co.za",
  "sobuhle@fairflow.co.za",
];

function normalizeEmail(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function buildAdminEmails(): Set<string> {
  const fromEnv = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((item: string) => normalizeEmail(item))
    .filter((item: string | null): item is string => Boolean(item));

  return new Set([
    ...STATIC_ADMIN_EMAILS.map((item) => normalizeEmail(item)).filter((item): item is string => Boolean(item)),
    ...fromEnv,
  ]);
}

const ADMIN_EMAILS = buildAdminEmails();

function collectSessionEmails(session: Session): Set<string> {
  const candidates: Array<string | null | undefined> = [
    session.user.email,
    session.user.user_metadata?.email,
    session.user.user_metadata?.preferred_email,
  ];

  for (const identity of session.user.identities ?? []) {
    const identityData = identity.identity_data as Record<string, unknown> | undefined;
    if (!identityData) continue;
    candidates.push(
      typeof identityData.email === "string" ? identityData.email : undefined,
      typeof identityData.preferred_email === "string" ? identityData.preferred_email : undefined
    );
  }

  return new Set(
    candidates
      .map((value) => normalizeEmail(value))
      .filter((value): value is string => Boolean(value))
  );
}

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

      // Override role to CEO if any normalized profile/identity email is in admin list.
      const sessionEmails = collectSessionEmails(session);
      if ([...sessionEmails].some((email) => ADMIN_EMAILS.has(email))) {
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
          setRole(null);
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
