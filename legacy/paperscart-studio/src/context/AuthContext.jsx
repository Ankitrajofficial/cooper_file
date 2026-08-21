import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getApiBase, getGoogleClientId } from '../utils/apiConfig';
import { clearAuthSession, readAuthSession, writeAuthSession } from '../utils/authStorage';

const AuthContext = createContext(null);

async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const base = getApiBase();
  if (!base) {
    throw new Error('Backend API is not configured.');
  }

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const error = new Error('Unable to reach the auth server.');
    error.code = 'NETWORK';
    throw error;
  }

  if (!response.ok) {
    let payload;
    let fallbackMessage = response.statusText || 'Request failed.';
    try {
      payload = await response.json();
    } catch {
      payload = null;
      try {
        fallbackMessage = (await response.text()) || fallbackMessage;
      } catch {
        fallbackMessage = response.statusText || 'Request failed.';
      }
    }

    if (response.status >= 500 && fallbackMessage === 'Internal Server Error') {
      fallbackMessage = 'The auth server failed while processing this request. Check that the backend is running correctly, then try again.';
    }

    const error = new Error(payload?.error || fallbackMessage);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export function AuthProvider({ children }) {
  const apiBase = getApiBase();
  const googleClientId = getGoogleClientId();
  const [state, setState] = useState({
    status: 'loading',
    session: null,
    connectivity: 'unknown',
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!apiBase) {
        if (!cancelled) {
          setState({ status: 'unavailable', session: null, connectivity: 'missing_config' });
        }
        return;
      }

      const storedSession = readAuthSession();
      if (!storedSession?.token) {
        try {
          await apiRequest('/health');
          if (!cancelled) {
            setState({ status: 'unauthenticated', session: null, connectivity: 'connected' });
          }
        } catch (error) {
          if (!cancelled) {
            setState({
              status: 'unauthenticated',
              session: null,
              connectivity: error?.code === 'NETWORK' ? 'server_unreachable' : 'connected',
            });
          }
        }
        return;
      }

      try {
        const result = await apiRequest('/api/auth/me', { token: storedSession.token });
        const nextSession = { token: storedSession.token, user: result.user };
        writeAuthSession(nextSession);
        if (!cancelled) {
          setState({ status: 'authenticated', session: nextSession, connectivity: 'connected' });
        }
      } catch (error) {
        clearAuthSession();
        if (!cancelled) {
          setState({
            status: 'unauthenticated',
            session: null,
            connectivity: error?.code === 'NETWORK' ? 'server_unreachable' : 'connected',
          });
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const setAuthenticated = (session) => {
    writeAuthSession(session);
    setState({ status: 'authenticated', session, connectivity: 'connected' });
  };

  const register = async (payload) => {
    const result = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: payload,
    });
    setAuthenticated(result);
    return result;
  };

  const login = async (payload) => {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: payload,
    });
    setAuthenticated(result);
    return result;
  };

  const loginWithGoogle = async (payload) => {
    const result = await apiRequest('/api/auth/google', {
      method: 'POST',
      body: payload,
    });
    setAuthenticated(result);
    return result;
  };

  const logout = async () => {
    const token = state.session?.token;
    try {
      if (apiBase && token) {
        await apiRequest('/api/auth/logout', { method: 'POST', token });
      }
    } catch {
      // Clear the local session even if the server-side cleanup fails.
    } finally {
      clearAuthSession();
      setState({
        status: apiBase ? 'unauthenticated' : 'unavailable',
        session: null,
        connectivity: apiBase ? 'connected' : 'missing_config',
      });
    }
  };

  const value = useMemo(
    () => ({
      status: state.status,
      session: state.session,
      user: state.session?.user || null,
      apiAvailable: Boolean(apiBase),
      googleClientId,
      connectivity: state.connectivity,
      login,
      loginWithGoogle,
      register,
      logout,
    }),
    [apiBase, googleClientId, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
