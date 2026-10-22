"use client";

// Adapter: keeps the TideCloak-shaped API these components were written against, but delegates to the shared
// auth layer (src/lib/auth). Live mode -> real TideCloak; mock mode -> simulated sign-in, 2-of-3 approvals and
// encryption. Roles always come from the auth layer, so a profile can never "grant itself" decrypt access.
import React, { createContext, useContext, ReactNode } from "react";
import { AuthProvider, mockSignIn, useAuth } from "../lib/auth/client";
import { MOCK_USERS } from "./mockData";
import { TideCloakUser } from "./types";

export interface TideCloakContextType {
  authenticated: boolean;
  user: TideCloakUser | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasRealmRole: (role: string) => boolean;
  getValueFromToken: (key: string) => any;
  doEncrypt: (items: Array<{ data: string; tags: string[] }>) => Promise<string[]>;
  doDecrypt: (items: Array<{ encrypted: string; tags: string[] }>) => Promise<string[]>;
  // Hackathon demo helpers (mock mode only)
  switchUser: (userKey: string) => void;
  availableUsers: Record<string, TideCloakUser>;
  currentProfileKey: string;
}

const TideCloakContext = createContext<TideCloakContextType | null>(null);

// Profiles that map to a real demo account; "researcher_approved" is gone because approval now really takes 2 of 3.
const DEMO_USERS: Record<string, TideCloakUser> = Object.fromEntries(
  Object.entries(MOCK_USERS).filter(([key]) => key !== "researcher_approved")
);

export function TideCloakProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Bridge>{children}</Bridge>
    </AuthProvider>
  );
}

function Bridge({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const profile = DEMO_USERS[auth.username];
  const user: TideCloakUser | null = auth.authenticated
    ? {
        username: auth.username,
        name: profile?.name ?? auth.username,
        roleDescription: profile?.roleDescription ?? "",
        roles: auth.roles,
      }
    : null;

  const value: TideCloakContextType = {
    authenticated: auth.authenticated,
    user,
    token: auth.token,
    login: auth.login,
    logout: auth.logout,
    refreshToken: auth.refresh,
    hasRealmRole: auth.hasRole,
    getValueFromToken: (key) => {
      if (!user) return null;
      if (key === "preferred_username" || key === "username") return user.username;
      if (key === "name") return user.name;
      if (key === "roles") return user.roles;
      return null;
    },
    doEncrypt: (items) => Promise.all(items.map((i) => auth.encrypt(i.data))),
    doDecrypt: (items) => Promise.all(items.map((i) => auth.decrypt(i.encrypted))),
    switchUser: (key) => {
      if (auth.mode !== "mock") return;
      if (key === "unauthenticated") auth.logout();
      else if (DEMO_USERS[key]) mockSignIn(DEMO_USERS[key].username, window.location.pathname);
    },
    availableUsers: auth.mode === "mock" ? DEMO_USERS : {},
    currentProfileKey: auth.authenticated ? auth.username : "unauthenticated",
  };

  return <TideCloakContext.Provider value={value}>{children}</TideCloakContext.Provider>;
}

export function useTideCloak(): TideCloakContextType {
  const context = useContext(TideCloakContext);
  if (!context) {
    throw new Error("useTideCloak must be used within a <TideCloakProvider>");
  }
  return context;
}
