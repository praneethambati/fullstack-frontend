import React from "react";

const API_BASE = "http://localhost:8080";

type AuthState = {
  token: string | null;
  setToken: (t: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  validating?: boolean; // optional flag if you add /auth/me check
};

export const AuthCtx = React.createContext<AuthState>({
  token: null,
  setToken: () => {},
  login: async () => {},
  logout: () => {},
  authFetch: async () => new Response(null, { status: 501 }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(() => localStorage.getItem("jwt"));
  const [validating, setValidating] = React.useState(false); // set true if you implement /auth/me

  React.useEffect(() => {
    if (token) localStorage.setItem("jwt", token);
    else localStorage.removeItem("jwt");
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || `Login failed: ${res.status}`);
    }
    const data = (await res.json()) as { token: string };
    setToken(data.token);
  };

  const logout = () => setToken(null);

  const authFetch: AuthState["authFetch"] = async (input, init = {}) => {
    const headers = new Headers(init.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401) setToken(null);
    return res;
  };

  return (
    <AuthCtx.Provider value={{ token, setToken, login, logout, authFetch, validating }}>
      {children}
    </AuthCtx.Provider>
  );
}
