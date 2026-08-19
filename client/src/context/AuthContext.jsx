import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest, meRequest } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("erp_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await meRequest();
        setUser(data.user);
        localStorage.setItem("erp_user", JSON.stringify(data.user));
      } catch (error) {
        // If meRequest fails and no token, clean up
        const token = localStorage.getItem("erp_token");
        if (!token) {
          setUser(null);
          localStorage.removeItem("erp_user");
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (payload) => {
    const data = await loginRequest(payload);
    if (data.token) {
      localStorage.setItem("erp_token", data.token);
    }
    if (data.user) {
      localStorage.setItem("erp_user", JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, isAuthenticated: Boolean(user) }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
