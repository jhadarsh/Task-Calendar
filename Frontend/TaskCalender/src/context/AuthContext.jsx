import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../service/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔑 RESTORE USER ON PAGE RELOAD */
  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiRequest("/auth/me");
        setUser(res.user);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  /* ---------- SIGNUP ---------- */
 const signup = async (form) => {
  const payload = {
    name: form.name,
    email: form.email,
    password: form.password,
    goals: form.goals
      ? form.goals.split(",").map((g) => g.trim())
      : [],
  };

  const res = await apiRequest("/auth/signup", "POST", payload);
  return res;
};


  /* ---------- LOGIN ---------- */
const login = async (form) => {
  const res = await apiRequest("/auth/login", "POST", form);
  localStorage.setItem("token", res.token);
  setUser(res.user);             // ✅ triggers re-render
  return res;
};


  /* ---------- LOGOUT ---------- */
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
