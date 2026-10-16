import { createContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .currentSession()
      .then((session) => {
        if (!cancelled) setUser(session.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier, password, role = null) => {
    let session;
    try {
      if (role === "applicant")
        session = await api.loginApplicant(identifier, password);
      else if (role === "staff")
        session = await api.loginStaff(identifier, password);
      else if (role === "admin")
        session = await api.loginAdmin(identifier, password);
      else session = await api.login(identifier, password);
      setUser(session.user);
      return session.user;
    } catch (err) {
      if (err.body?.emailNotVerified) {

        try {
          const session = await api.currentSession();
          setUser(session.user);
        } catch {}
      }
      throw err;
    }
  }, []);

  const registerApplicant = useCallback(
    async (username, fullName, password) => {
      const created = await api.register(username, fullName, password);
      setUser(created);
      return created;
    },
    [],
  );

  const register = useCallback(
    async ({ username, fullName, password, role, accessCode, email }) => {
      const result = await api.registerWithRole(
        username || fullName,
        fullName || username,
        password,
        role || "applicant",
        accessCode,
        email,
      );
      if (result?.user) {
        setUser(result.user);
      }
      return result;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, registerApplicant, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
