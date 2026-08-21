import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchCurrentSession,
  loginWithGoogleCredential,
  loginWithPassword,
  logout,
  registerAccount,
  subscribeToAuthChanges,
} from '../utils/authClient';

// Historical name: this context used to wrap Supabase auth. It now fronts the
// PapersCart backend (/api/auth/*) backed by Neon Postgres, but keeps the same
// provider/hook API so consumers didn't have to change.
const SupabaseAuthContext = createContext(null);

export function SupabaseAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let mounted = true;

    fetchCurrentSession()
      .then((currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        setLoading(false);
      })
      .catch((error) => {
        if (!mounted) return;
        setAuthError(error.message || 'Could not restore your session.');
        setSession(null);
        setLoading(false);
      });

    const unsubscribe = subscribeToAuthChanges((nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);
      setAuthError('');
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    const nextSession = await loginWithPassword({ email, password });
    setSession(nextSession);
    return { session: nextSession, user: nextSession.user };
  }, []);

  const signUp = useCallback(async ({ email, password, name, workspaceMode }) => {
    const nextSession = await registerAccount({ email, password, name, workspaceMode });
    setSession(nextSession);
    return { session: nextSession, user: nextSession.user };
  }, []);

  const signInWithGoogle = useCallback(async ({ credential, mode, workspaceMode }) => {
    const nextSession = await loginWithGoogleCredential({ credential, mode, workspaceMode });
    setSession(nextSession);
    return { session: nextSession, user: nextSession.user };
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      authError,
      isConfigured: true,
      loading,
      session,
      signIn,
      signInWithGoogle,
      signOut,
      signUp,
      user: session?.user || null,
    }),
    [authError, loading, session, signIn, signInWithGoogle, signOut, signUp]
  );

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  }
  return context;
}
