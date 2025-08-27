import React from "react";
import Layout from "../components/Layout";
import { AuthCtx } from "../auth/AuthContext";

type User = { id: number; email: string; role: "ADMIN" | "USER" | string; active: boolean };

export default function Users() {
  const { authFetch } = React.useContext(AuthCtx);
  const [rows, setRows] = React.useState<User[]>([]);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"ADMIN" | "USER">("USER");
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch("http://localhost:8080/users");
      if (!r.ok) throw new Error("failed");
      setRows((await r.json()) as User[]);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  React.useEffect(() => { load(); }, [load]);

  const createUser = async () => {
    setCreating(true);
    try {
      const r = await authFetch("http://localhost:8080/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      if (!r.ok) throw new Error("create failed");
      setEmail(""); setPassword(""); setRole("USER");
      await load();
    } finally {
      setCreating(false);
    }
  };

  const deactivate = async (id: number) => {
    await authFetch(`http://localhost:8080/users/${id}/deactivate`, { method: "POST" });
    await load();
  };

  return (
    <Layout title="Users">
      {/* Create row */}
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]">
        <input
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-600"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-purple-600"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button
          onClick={createUser}
          disabled={!email || !password || creating}
          className="rounded-md bg-purple-600 px-4 py-2 font-semibold hover:bg-purple-700 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create"}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-800/60">
            <tr>
              <Th>ID</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900">
            {loading ? (
              <tr><Td colSpan={5}>Loading…</Td></tr>
            ) : rows.length === 0 ? (
              <tr><Td colSpan={5} className="text-slate-400">No users</Td></tr>
            ) : rows.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40">
                <Td className="text-slate-400">{u.id}</Td>
                <Td className="font-medium">{u.email}</Td>
                <Td><Badge tone={u.role === "ADMIN" ? "red" : "slate"}>{u.role}</Badge></Td>
                <Td><Badge tone={u.active ? "purple" : "slate"}>{u.active ? "Active" : "Inactive"}</Badge></Td>
                <Td>
                  <button
                    onClick={() => deactivate(u.id)}
                    className="rounded-md border border-slate-700 px-2 py-1 hover:bg-slate-800"
                  >
                    Deactivate
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
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
