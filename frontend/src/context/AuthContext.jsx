import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { setOnUnauthorized } from "../lib/api.js";
import { login as loginRequest, getUserById } from "../services/userService.js";

const AuthContext = createContext(null);

const TOKEN_KEY = "access_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Wire up the axios 401 interceptor to clear session app-wide.
  useEffect(() => {
    setOnUnauthorized(() => clearSession());
  }, [clearSession]);

  const loadUser = useCallback(async (jwt) => {
    // JWT only contains { sub: "<uid>" } - see utils/jwt_handler.py
    let uid;
    try {
      const decoded = jwtDecode(jwt);
      uid = decoded.sub;
    } catch {
      clearSession();
      return;
    }

    try {
      const profile = await getUserById(uid);
      setUser(profile);
    } catch {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    (async () => {
      if (token) {
        await loadUser(token);
      }
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (identifier, password) => {
    const data = await loginRequest(identifier, password); // { access_token, token_type }
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    await loadUser(data.access_token);
    return data;
  }, [loadUser]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
