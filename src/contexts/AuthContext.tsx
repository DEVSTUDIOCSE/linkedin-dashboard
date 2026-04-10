/**
 * Authentication Context Provider
 * Manages global authentication state using Firebase Auth
 */

'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, isFirebaseAvailable } from '@/lib/firebase/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to access authentication context
 * Must be used within AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/** How often to proactively refresh the session cookie (4 hours — session cookies last 5 days) */
const TOKEN_REFRESH_INTERVAL_MS = 4 * 60 * 60 * 1000;

/**
 * Read the CSRF double-submit cookie value.
 */
function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match?.[1] ?? null;
}

/**
 * Ensure a CSRF token cookie exists.
 */
async function ensureCsrfToken(): Promise<string | null> {
  if (getCsrfToken()) return getCsrfToken();
  try {
    await fetch('/api/auth/session', { method: 'GET' });
  } catch { /* ignore */ }
  return getCsrfToken();
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hadUserRef = useRef(false);

  useEffect(() => {
    // If Firebase is not configured, skip auth entirely
    if (!isFirebaseAvailable() || !auth) {
      setLoading(false);
      return;
    }

    const syncSession = async (firebaseUser: User | null): Promise<boolean> => {
      try {
        const csrfToken = await ensureCsrfToken();
        const csrfHeaders: Record<string, string> = csrfToken
          ? { 'x-csrf-token': csrfToken }
          : {};

        if (firebaseUser) {
          const token = await firebaseUser.getIdToken(/* forceRefresh */ true);
          const res = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...csrfHeaders },
            body: JSON.stringify({ token }),
          });

          if (!res.ok) {
            if (auth) await signOut(auth);
            return false;
          }
          hadUserRef.current = true;
          return true;
        } else {
          if (hadUserRef.current) {
            hadUserRef.current = false;
            await fetch('/api/auth/session', { method: 'DELETE', headers: csrfHeaders });
          }
          return true;
        }
      } catch {
        return true;
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const ok = await syncSession(firebaseUser);
        if (!ok) return;
      } else {
        await syncSession(null);
      }

      setUser(firebaseUser);
      setLoading(false);

      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      if (firebaseUser) {
        refreshTimerRef.current = setInterval(async () => {
          try {
            const freshToken = await firebaseUser.getIdToken(/* forceRefresh */ true);
            const csrf = getCsrfToken();
            await fetch('/api/auth/session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(csrf ? { 'x-csrf-token': csrf } : {}),
              },
              body: JSON.stringify({ token: freshToken }),
            });
          } catch {
            // Retry on next interval
          }
        }, TOKEN_REFRESH_INTERVAL_MS);
      }
    });

    return () => {
      unsubscribe();
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
