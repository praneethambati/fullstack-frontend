import React from "react";
import { AuthCtx } from "../auth/AuthContext";

const API_BASE = "http://localhost:8080";

type Audit = {
  id: number;
  action: string;      // e.g., "USER_CREATED", "LOGIN", "ROLE_CHANGED"
  details: string;     // free text summary
  whenAt: string;      // ISO date-time
  ip?: string;
  userAgent?: string;
  actor?: string;      // optional: who performed the action
};

type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;  // page index
  size: number;
};

export default function RecentAudits({
  title = "Recent Activity",
  pageSize = 10,
}: { title?: string; pageSize?: number }) {
  const { authFetch } = React.useContext(AuthCtx);
  const [rows, setRows] = React.useState<Audit[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${API_BASE}/audits`);
      url.searchParams.set("page", "0");
      url.searchParams.set("size", String(pageSize));
      const res = await authFetch(url.toString());
      if (!res.ok) throw new Error(`GET /audits ${res.status}`);
      const data: Page<Audit> = await res.json();
      setRows(data.content);
    } catch (e: any) {
      setError(e.message ?? "Failed to load audits");
    } finally {
      setLoading(false);
    }
  }, [authFetch, pageSize]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800">
        <h2 className="font-semibold text-slate-200">{title}</h2>
        <p className="text-xs text-slate-400">Overview of recent audit log entries</p>
      </div>

      {loading ? (
        <div className="p-6 text-slate-400 text-sm">Loading…</div>
      ) : error ? (
        <div className="p-6 text-rose-400 text-sm">Error: {error}</div>
      ) : rows.length === 0 ? (
        <div className="p-6 text-slate-400 text-sm">No recent activity.</div>
      ) : (
        <ul className="divide-y divide-slate-800">
          {rows.map(a => (
            <li key={a.id} className="px-6 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-violet-700/30 text-violet-200">
                    {a.action}
                  </span>
                  {a.actor && (
                    <span className="text-xs text-slate-400">by {a.actor}</span>
                  )}
                </div>
                <p className="text-sm text-slate-200 break-words">{a.details}</p>
                <div className="mt-1 text-xs text-slate-400 flex flex-wrap gap-3">
                  <span>{new Date(a.whenAt).toLocaleString()}</span>
                  {a.ip && <span>IP: {a.ip}</span>}
                  {a.userAgent && <span className="truncate">UA: {a.userAgent}</span>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="px-6 py-3 border-t border-slate-800 text-right">
        <button
          onClick={load}
          className="text-xs px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
