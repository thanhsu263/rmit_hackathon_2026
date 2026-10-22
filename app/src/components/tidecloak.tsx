"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { USE_MOCK_AUTH } from "./config";
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
  // Hackathon demo helpers
  switchUser: (userKey: string) => void;
  availableUsers: Record<string, TideCloakUser>;
  currentProfileKey: string;
}

const TideCloakContext = createContext<TideCloakContextType | null>(null);

const STORAGE_USER_KEY = "custodian_vault_mock_user";

export function TideCloakProvider({ children }: { children: ReactNode }) {
  const [currentProfileKey, setCurrentProfileKey] = useState<string>("researcher");
  const [currentUser, setCurrentUser] = useState<TideCloakUser>(MOCK_USERS["researcher"]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [tokenVersion, setTokenVersion] = useState<number>(1);

  // Initialize from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      if (saved && MOCK_USERS[saved]) {
        setCurrentProfileKey(saved);
        setCurrentUser(MOCK_USERS[saved]);
      }
    }
  }, []);

  const switchUser = (userKey: string) => {
    if (userKey === "unauthenticated") {
      setIsAuthenticated(false);
      setCurrentProfileKey("unauthenticated");
      return;
    }
    if (MOCK_USERS[userKey]) {
      setIsAuthenticated(true);
      setCurrentProfileKey(userKey);
      setCurrentUser(MOCK_USERS[userKey]);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_USER_KEY, userKey);
      }
    }
  };

  const login = () => {
    setIsAuthenticated(true);
    switchUser("researcher");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentProfileKey("unauthenticated");
  };

  const refreshToken = async (): Promise<void> => {
    // Simulates refreshing token from TideCloak server (fetching latest realm roles)
    await new Promise((resolve) => setTimeout(resolve, 300));
    setTokenVersion((v) => v + 1);
  };

  const hasRealmRole = (role: string): boolean => {
    if (!isAuthenticated || !currentUser) return false;
    return currentUser.roles.includes(role);
  };

  const getValueFromToken = (key: string): any => {
    if (!isAuthenticated || !currentUser) return null;
    if (key === "preferred_username" || key === "username") return currentUser.username;
    if (key === "name") return currentUser.name;
    if (key === "roles") return currentUser.roles;
    return null;
  };

  const token = isAuthenticated
    ? `mock_tidecloak_jwt_token_${currentUser.username}_v${tokenVersion}`
    : null;

  // Browser-side encryption (Contract rule: Tag sitecoords)
  const doEncrypt = async (
    items: Array<{ data: string; tags: string[] }>
  ): Promise<string[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400)); // Network/crypto delay

    if (!hasRealmRole("_tide_sitecoords.selfencrypt")) {
      throw new Error(
        "TideCloak Security Policy: Missing realm role '_tide_sitecoords.selfencrypt'. Cannot seal coordinates."
      );
    }

    return items.map((item) => {
      // Create tamper-evident reversible mock ciphertext with sitecoords tag
      const b64 = btoa(encodeURIComponent(item.data));
      return `TIDE_ENC:sitecoords:${b64}`;
    });
  };

  // Browser-side decryption (Contract rule: Tag sitecoords, throws if missing selfdecrypt)
  const doDecrypt = async (
    items: Array<{ encrypted: string; tags: string[] }>
  ): Promise<string[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Crypto delay

    // Contract: Always attempt doDecrypt so denial comes from TideCloak
    if (!hasRealmRole("_tide_sitecoords.selfdecrypt")) {
      throw new Error("You do not hold the decrypt role yet. Two of three stewards must approve.");
    }

    return items.map((item) => {
      if (!item.encrypted) return "";
      try {
        if (item.encrypted.startsWith("TIDE_ENC:sitecoords:")) {
          const payload = item.encrypted.replace("TIDE_ENC:sitecoords:", "");
          return decodeURIComponent(atob(payload));
        }
        // Handle pre-seeded direct format
        return item.encrypted.replace("TIDE_ENC:sitecoords:", "");
      } catch (err) {
        throw new Error("TideCloak decryption failed: Invalid ciphertext format.");
      }
    });
  };

  return (
    <TideCloakContext.Provider
      value={{
        authenticated: isAuthenticated,
        user: isAuthenticated ? currentUser : null,
        token,
        login,
        logout,
        refreshToken,
        hasRealmRole,
        getValueFromToken,
        doEncrypt,
        doDecrypt,
        switchUser,
        availableUsers: MOCK_USERS,
        currentProfileKey,
      }}
    >
      {children}
    </TideCloakContext.Provider>
  );
}

export function useTideCloak(): TideCloakContextType {
  const context = useContext(TideCloakContext);
  if (!context) {
    throw new Error("useTideCloak must be used within a <TideCloakProvider>");
  }
  return context;
}
