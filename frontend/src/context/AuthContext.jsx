import { createContext, useContext, useEffect, useState } from "react";
import API, { getCookie, setCookie, deleteCookie } from "../services/api";

const AuthContext = createContext(null);

const normalizeRole = (role) => {
  if (!role) return "student";
  return role.replace(/^ROLE_/i, "").toLowerCase();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Restore session on page refresh ───────────────────────────────────── */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getCookie("token");
      if (!token) { setLoading(false); return; }

      try {
        // /auth/test-auth is protected — uses JWT from cookie
        const response = await API.get("/auth/test-auth");
        const data = response.data;

        const normalizedUser = {
          id:    data.id,
          name:  data.name,
          email: data.email,
          role:  normalizeRole(data.roles?.[0] || "student"),
        };
        setUser(normalizedUser);
      } catch (error) {
        deleteCookie("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /* ── Login ──────────────────────────────────────────────────────────────── */
  const login = (userData, token) => {
    const cleanToken = token?.startsWith("Bearer ") ? token.substring(7) : token;
    setCookie("token", cleanToken);

    const normalizedUser = {
      id:    userData.id,
      name:  userData.name,
      email: userData.email,
      role:  normalizeRole(userData.role || "student"),
    };
    setUser(normalizedUser);
  };

  /* ── Logout ─────────────────────────────────────────────────────────────── */
  const logout = () => {
    deleteCookie("token");
    setUser(null);
  };

  /* ── Update user in context ─────────────────────────────────────────────── */
  const updateUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};