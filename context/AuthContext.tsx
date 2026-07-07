import { createContext, useState, useEffect, type ReactNode } from "react";
import { authService, type AuthResponse } from "../services/authService";

interface AuthUser {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica sessão ativa ao carregar a aplicação
  useEffect(() => {
    authService
      .getMe()
      .then((data: AuthResponse | null) => {
        if (data) setUser({ email: data.email, name: data.nome });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser({ email: response.email, name: response.nome });
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
