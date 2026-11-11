import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getGoogleUser, signOutFromGoogle, subscribeToGoogleSession } from "@/lib/googleAuth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getGoogleUser());

  useEffect(() => subscribeToGoogleSession(setUser), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoadingAuth: false,
      authError: null,
      refresh: async () => getGoogleUser(),
      logout: signOutFromGoogle,
      navigateToLogin: () => {
        window.location.href = `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within <AuthProvider>");
  return value;
}
