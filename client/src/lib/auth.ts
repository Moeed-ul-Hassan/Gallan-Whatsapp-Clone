import { apiRequest } from "./queryClient";
import { InsertUser, User } from "@shared/schema";

export async function loginUser(username: string, password: string): Promise<User> {
  try {
    const res = await apiRequest("POST", "/api/auth/login", { username, password });
    return await res.json();
  } catch (error) {
    throw new Error("Invalid username or password");
  }
}

export async function registerUser(userData: InsertUser): Promise<User> {
  try {
    const res = await apiRequest("POST", "/api/auth/register", userData);
    return await res.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes("409")) {
      throw new Error("Username already exists");
    }
    throw new Error("Failed to register user");
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await apiRequest("GET", "/api/auth/me", undefined);
    return await res.json();
  } catch (error) {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest("POST", "/api/auth/logout", undefined);
  } catch (error) {
    console.error("Logout failed:", error);
    throw new Error("Failed to logout");
  }
}
