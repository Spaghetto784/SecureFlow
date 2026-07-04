export type User = {
  id: number;
  email: string;
  is_active: boolean;
  role: string;
  created_at: string;
};

export type AuthMode = "login" | "register";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(body.detail ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function healthCheck(): Promise<{ status: string; service: string; environment: string }> {
  return request("/health");
}

export async function authenticate(mode: AuthMode, email: string, password: string): Promise<string> {
  if (mode === "register") {
    await request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  const tokenResponse = await request<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return tokenResponse.access_token;
}

export async function fetchCurrentUser(token: string): Promise<User> {
  return request<User>("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
