import api from "../lib/api";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  tipo: string;
  email: string;
  nome: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data; // token está no cookie HttpOnly — JS não tem acesso
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout"); // backend zera o cookie
  },

  getMe: async (): Promise<AuthResponse | null> => {
    try {
      const response = await api.get("/auth/me", { _silentAuth: true });
      return response.data;
    } catch {
      return null;
    }
  },
};
