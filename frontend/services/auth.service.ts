import { api, setToken } from "./api";
import { AuthCredentials, AuthResponse, RegisterPayload, User } from "@/types/user";

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>("/user/login", credentials, {
      authenticated: false,
    });
    await setToken(data.token);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const data = await api.post<AuthResponse>("/user/register", payload, {
      authenticated: false,
    });
    await setToken(data.token);
    return data;
  },

  async logout(): Promise<void> {
    await setToken(null);
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>("/user/me");
  },

  async updateProfile(payload: Partial<Pick<User, "name" | "phone">>): Promise<User> {
    return api.patch<User>("/user/me", payload);
  },
};
