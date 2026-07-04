export type User = {
  id: number;
  email: string;
  is_active: boolean;
  role: string;
  created_at: string;
};

export type AuthMode = "login" | "register";

export type SecurityReport = {
  id: number;
  tool: string;
  category: string;
  status: "passed" | "running" | "attention" | "failed";
  summary: string;
  findings_count: number;
  created_at: string;
};

export type SecurityFinding = {
  id: number;
  report_id: number;
  title: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  status: string;
  target: string;
  description: string;
  recommendation: string;
  created_at: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

type ApiErrorBody = {
  detail?: string | Array<{ loc?: string[]; msg?: string }>;
};

function formatApiError(body: ApiErrorBody): string {
  if (typeof body.detail === "string") {
    return body.detail;
  }

  if (Array.isArray(body.detail)) {
    return body.detail
      .map((item) => {
        const field = item.loc?.at(-1);
        return field && item.msg ? `${field}: ${item.msg}` : item.msg;
      })
      .filter(Boolean)
      .join(", ");
  }

  return "Request failed";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(formatApiError(body));
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

export async function fetchSecurityReports(token: string): Promise<SecurityReport[]> {
  return request<SecurityReport[]>("/security/reports", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchSecurityFindings(token: string): Promise<SecurityFinding[]> {
  return request<SecurityFinding[]>("/security/findings", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function runSecurityScan(token: string): Promise<SecurityReport> {
  const response = await request<{ report: SecurityReport }>("/security/scans/run", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.report;
}
