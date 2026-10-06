import { request } from "@/api/client";
import type { User } from "@/types/user";

export const fetchMe = () => request<User>("/auth/me");

export const login = (username: string, password: string) =>
  request<User>("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });

export const logout = () => request<void>("/auth/logout", { method: "POST" });
