import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, getToken } from "./api.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(identifier, password) {
    const d = await api.post("/auth/login", { identifier, password });
    setToken(d.token);
    setUser(d.user);
  }

  async function register(payload) {
    const d = await api.post("/auth/register", payload);
    setToken(d.token);
    setUser(d.user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
