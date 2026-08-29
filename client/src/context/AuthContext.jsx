import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("jobify_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Revalidate the stored session against the API on mount
  useEffect(() => {
    const token = localStorage.getItem("jobify_token");
    if (!token) {
      setLoading(false);
      return;
    }

    authApi
      .me()
      .then(({ data }) => persist(data.user, token))
      .catch(() => clear())
      .finally(() => setLoading(false));
  }, []);

  const persist = (nextUser, token) => {
    localStorage.setItem("jobify_token", token);
    localStorage.setItem("jobify_user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const clear = () => {
    localStorage.removeItem("jobify_token");
    localStorage.removeItem("jobify_user");
    setUser(null);
  };

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    persist(data.user, data.token);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    persist(data.user, data.token);
    return data.user;
  };

  const logout = () => clear();

  const updateUser = (nextUser) => {
    localStorage.setItem("jobify_user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: Boolean(user),
        isRecruiter: user?.role === "recruiter",
        isCandidate: user?.role === "candidate",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
