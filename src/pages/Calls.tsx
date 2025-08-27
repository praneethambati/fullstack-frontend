import React from "react";
import { AuthCtx } from "../auth/AuthContext";

const API_BASE = "http://localhost:8080";

type CallLog = {
  id: number;
  kind: "INCOMING" | "OUTGOING" | "MISSED";
  caller: string;
  receiver: string;
  purpose: string;
  duration: string;
  whenAt: string; // ISO
  notes: string;
};

type Page<T> = { content: T[]; totalElements: number; totalPages: number; number: number; size: number };

export default function Calls() {
  const { authFetch } = React.useContext(AuthCtx);
  const [rows, setRows] = React.useState<CallLog[]>([]);
  const [q, setQ] = React.useState("");
  const [type, setType] = React.useState<"ALL"|"INCOMING"|"OUTGOING"|"MISSED">("ALL");
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(20);

  // form
  const [kind, setKind] = React.useState<CallLog["kind"]>("INCOMING");
  const [caller, setCaller] = React.useState("");
  const [receiver, setReceiver] = React.useState("");
  const [purpose, setPurpose] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [whenAt, setWhenAt] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const load = React.useCallback(async () => {
    const url = new URL(`${API_BASE}/calls`);
    if (q) url.searchParams.set("q", q);
    url.searchParams.set("type", type);
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", String(size));
    const res = await authFetch(url.toString());
    if (!res.ok) throw new Error(`GET /calls ${res.status}`);
    const data: Page<CallLog> = await res.json();
    setRows(data.content);
  }, [authFetch, q, type, page, size]);

  React.useEffect(()=>{ load().catch(console.error); }, [load]);

  const create = async () => {
    const res = await authFetch(`${API_BASE}/calls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, caller, receiver, purpose, duration, whenAt, notes }),
    });
    if (!res.ok) { alert("Create failed"); return; }
    setKind("INCOMING"); setCaller(""); setReceiver(""); setPurpose(""); setDuration(""); setWhenAt(""); setNotes("");
    load().catch(console.error);
  };

  const remove = async (id: number) => {
    const res = await authFetch(`${API_BASE}/calls/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Delete failed"); return; }
    load().catch(console.error);
  };

  return (
    <div className="p-6 text-slate-200">
      <h1 className="text-2xl font-semibold mb-4">Calls</h1>

      <div className="flex gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by caller..."
               className="bg-slate-800 rounded px-3 py-2 w-80" />
        <select value={type} onChange={e=>setType(e.target.value as any)} className="bg-slate-800 rounded px-3 py-2">
          <option value="ALL">All</option><option>INCOMING</option><option>OUTGOING</option><option>MISSED</option>
        </select>
        <button onClick={()=>{ setPage(0); load().catch(console.error); }}
                className="bg-violet-600 rounded px-4 py-2">Filter</button>
      </div>

      <table className="w-full text-sm border-separate border-spacing-y-2">
        <thead className="text-slate-400">
          <tr>
            <th className="text-left px-3">Type</th>
            <th className="text-left px-3">Caller</th>
            <th className="text-left px-3">Receiver</th>
            <th className="text-left px-3">Purpose</th>
            <th className="text-left px-3">Duration</th>
            <th className="text-left px-3">When</th>
            <th className="px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.id} className="bg-slate-900">
              <td className="px-3 py-3">{c.kind}</td>
              <td className="px-3">{c.caller}</td>
              <td className="px-3">{c.receiver}</td>
              <td className="px-3">{c.purpose}</td>
              <td className="px-3">{c.duration}</td>
              <td className="px-3">{new Date(c.whenAt).toLocaleString()}</td>
              <td className="px-3">
                <button onClick={()=>remove(c.id)} className="px-2 py-1 bg-red-700 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-8 mb-2 font-semibold">Log Call</h2>
      <div className="flex flex-wrap gap-2">
        <select value={kind} onChange={e=>setKind(e.target.value as CallLog["kind"])} className="bg-slate-800 rounded px-3 py-2">
          <option>INCOMING</option><option>OUTGOING</option><option>MISSED</option>
        </select>
        <input value={caller} onChange={e=>setCaller(e.target.value)} placeholder="Caller" className="bg-slate-800 rounded px-3 py-2" />
        <input value={receiver} onChange={e=>setReceiver(e.target.value)} placeholder="Receiver" className="bg-slate-800 rounded px-3 py-2" />
        <input value={purpose} onChange={e=>setPurpose(e.target.value)} placeholder="Purpose" className="bg-slate-800 rounded px-3 py-2" />
        <input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Duration (e.g. 15:32)" className="bg-slate-800 rounded px-3 py-2" />
        <input type="datetime-local" value={whenAt} onChange={e=>setWhenAt(e.target.value)} className="bg-slate-800 rounded px-3 py-2" />
        <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes" className="bg-slate-800 rounded px-3 py-2 w-96" />
        <button onClick={create} className="bg-violet-600 rounded px-4 py-2">Create</button>
      </div>
    </div>
  );
}
