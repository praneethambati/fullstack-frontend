export const BASE_URL = "http://localhost:8080";

export const authHeaders = (token: string | null, json = false): HeadersInit => {
  const h: Record<string,string> = {};
  if (json) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

export const timeAgo = (iso: string | number | Date) => {
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  const m = Math.floor(s/60), h = Math.floor(m/60), d2 = Math.floor(h/24);
  if (s < 60) return `${s}s ago`;
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d2}d ago`;
};