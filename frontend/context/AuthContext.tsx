import React, { createContext, useCallback, useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { setToken } from "@/services/api";
import { AuthCredentials, RegisterPayload, User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (credentials: AuthCredentials) => {
    const { user: loggedInUser } = await authService.login(credentials);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: registeredUser } = await authService.register(payload);
    setUser(registeredUser);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    await setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser: restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
