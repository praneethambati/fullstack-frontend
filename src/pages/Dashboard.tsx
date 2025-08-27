import React from "react";
import Layout from "../components/Layout";
import { AuthCtx } from "../auth/AuthContext";

type User = { id: number; email: string; role: "ADMIN" | "USER" | string; active: boolean };
type Audit = {
    id: number;
    action: string;   // e.g. "USER_CREATED", "LOGIN"
    details: string;  // summary message
    whenAt: string;   // ISO datetime string
    actor?: string;   // who performed it
  };

export default function Dashboard() {
  const { authFetch } = React.useContext(AuthCtx);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<Audit[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const r = await authFetch("http://localhost:8080/users");
        if (!r.ok) throw new Error("Failed to load users");
        const data = (await r.json()) as User[];
        if (!ignore) setUsers(data);
      } catch {
        // gracefully degrade if backend route not ready
        if (!ignore) setUsers([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [authFetch]);
  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`http://localhost:8080/audits?page=0&size=10`);
        if (!res.ok) throw new Error(`GET /audits ${res.status}`);
        const data = await res.json();
        setRows(data.content ?? []); // Spring Data Page shape
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authFetch]);

  const total = users.length;
  const active = users.filter((u) => u.active).length;
  const admins = users.filter((u) => (u.role || "").toUpperCase() === "ADMIN").length;

  return (
    <Layout title="Dashboard">
      {/* KPI Cards */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Users" value={loading ? "…" : total} sub="+2 from last month" />
        <KpiCard label="Active Users" value={loading ? "…" : active} dot="green" sub="100% active rate" />
        <KpiCard label="Admins" value={loading ? "…" : admins} sub="System administrators" />
        <KpiCard label="New This Month" value={2} sub="Recently added users" />
      </section>

      {/* Navigation tiles */}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Tile title="Interviews" to="/interviews" desc="Searchable, paginated interview list" icon="📅" />
        <Tile title="Candidates" to="/candidates" desc="CRUD form + listing for candidates" icon="👥" />
        <Tile title="Calls" to="/calls" desc="Seeded data with filters" icon="📞" />
        <Tile title="Settings" to="/settings" desc="User profile + password change" icon="⚙️" className="md:col-span-3" />
      </section>

      {/* Recent Activity (hook up to /audits later) */}
      <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">Recent Activity</h2>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : error ? (
        <div className="text-rose-400 text-sm">Error: {error}</div>
      ) : rows.length === 0 ? (
        <div className="text-slate-400 text-sm">No recent activity.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200"
            >
              <span className="font-medium">{row.action}:</span>{" "}
              {row.actor ?? "unknown"} – {row.details}
              <span className="float-right text-slate-400">
                {new Date(row.whenAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>

    
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Users</h2>
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-800/60">
              <tr>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-900">
              {(loading ? [] : users.slice(0, 4)).map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <Td className="font-medium">{u.email}</Td>
                  <Td><Badge tone={u.role === "ADMIN" ? "red" : "slate"}>{u.role}</Badge></Td>
                  <Td>
                    <Badge tone={u.active ? "purple" : "slate"}>{u.active ? "Active" : "Inactive"}</Badge>
                  </Td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <Td colSpan={3} className="text-slate-400">
                    No users loaded yet.
                  </Td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

/* --- small atoms --- */
function KpiCard({ label, value, sub, dot }: { label: string; value: React.ReactNode; sub?: string; dot?: "green" | "yellow" }) {
  const Dot = dot ? (
    <span className={`ml-2 inline-block h-2 w-2 rounded-full ${dot === "green" ? "bg-green-500" : "bg-yellow-400"}`} />
  ) : null;
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="text-sm text-slate-400 flex items-center">{label}{Dot}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function Tile({ title, desc, to, icon, className = "" }: { title: string; desc: string; to: string; icon: string; className?: string }) {
  return (
    <a href={to} className={`rounded-xl border border-slate-800 bg-slate-900 p-5 hover:bg-slate-800/60 ${className}`}>
      <div className="text-2xl">{icon}</div>
      <div className="mt-2 text-lg font-semibold">{title}</div>
      <div className="text-sm text-slate-400">{desc}</div>
    </a>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</th>;
}
function Td({ children, className = "", colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`px-4 py-3 ${className}`}>{children}</td>;
}
function Badge({ children, tone = "purple" }: { children: React.ReactNode; tone?: "purple" | "red" | "slate" }) {
  const map = {
    purple: "bg-purple-700/30 text-purple-300 border-purple-700/50",
    red: "bg-red-700/30 text-red-300 border-red-700/50",
    slate: "bg-slate-700/30 text-slate-300 border-slate-700/50",
  } as const;
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
}
