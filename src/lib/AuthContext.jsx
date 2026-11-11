import { createContext, useContext, useMemo } from "react";

const AuthContext = createContext(null);

const LOCAL_USER = Object.freeze({
  id: "local-user",
  full_name: "کارشناس تغذیه",
  email: "ذخیره روی این دستگاه",
  picture: null,
});

export function AuthProvider({ children }) {
  const value = useMemo(
    () => ({
      user: LOCAL_USER,
      isAuthenticated: true,
      isLoadingAuth: false,
      authError: null,
      refresh: async () => LOCAL_USER,
      logout: () => {},
      navigateToLogin: () => {},
    }),
    [],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within <AuthProvider>");
  return value;
}
