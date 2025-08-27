import React from "react";
import { AuthCtx } from "../auth/AuthContext";

const API_BASE = "http://localhost:8080";

type Candidate = {
  id: number;
  name: string;
  contact: string;
  position: string;
  yearsExp: number;
  status: "INTERVIEWED" | "HIRED" | "NEW" | "REJECTED";
  appliedOn: string; // yyyy-MM-dd
};

type Page<T> = { content: T[]; totalElements: number; totalPages: number; number: number; size: number };

export default function Candidates() {
  const { authFetch } = React.useContext(AuthCtx);
  const [rows, setRows] = React.useState<Candidate[]>([]);
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(20);

  // form
  const [name, setName] = React.useState("");
  const [contact, setContact] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [yearsExp, setYearsExp] = React.useState<number>(0);
  const [status, setStatus] = React.useState<Candidate["status"]>("NEW");
  const [appliedOn, setAppliedOn] = React.useState("");

  const load = React.useCallback(async () => {
    const url = new URL(`${API_BASE}/candidates`);
    if (q) url.searchParams.set("q", q);
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", String(size));
    const res = await authFetch(url.toString());
    if (!res.ok) throw new Error(`GET /candidates ${res.status}`);
    const data: Page<Candidate> = await res.json();
    setRows(data.content);
  }, [authFetch, q, page, size]);

  React.useEffect(() => { load().catch(console.error); }, [load]);

  const create = async () => {
    const res = await authFetch(`${API_BASE}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contact, position, yearsExp, status, appliedOn }),
    });
    if (!res.ok) { alert("Create failed"); return; }
    setName(""); setContact(""); setPosition(""); setYearsExp(0); setStatus("NEW"); setAppliedOn("");
    load().catch(console.error);
  };

  const setStatusFor = async (id: number, next: Candidate["status"]) => {
    const res = await authFetch(`${API_BASE}/candidates/${id}/status?status=${next}`, { method: "PATCH" });
    if (!res.ok) { alert("Update status failed"); return; }
    load().catch(console.error);
  };

  return (
    <div className="p-6 text-slate-200">
      <h1 className="text-2xl font-semibold mb-4">Candidates</h1>

      <div className="flex gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name or position..."
               className="bg-slate-800 rounded px-3 py-2 w-80" />
        <button onClick={()=>{ setPage(0); load().catch(console.error); }}
                className="bg-violet-600 rounded px-4 py-2">Search</button>
      </div>

      <table className="w-full text-sm border-separate border-spacing-y-2">
        <thead className="text-slate-400">
          <tr>
            <th className="text-left px-3">Name</th>
            <th className="text-left px-3">Contact</th>
            <th className="text-left px-3">Position</th>
            <th className="text-left px-3">Exp</th>
            <th className="text-left px-3">Status</th>
            <th className="text-left px-3">Applied</th>
            <th className="px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.id} className="bg-slate-900">
              <td className="px-3 py-3">{c.name}</td>
              <td className="px-3">{c.contact}</td>
              <td className="px-3">{c.position}</td>
              <td className="px-3">{c.yearsExp}</td>
              <td className="px-3">
                <span className="px-2 py-1 rounded bg-purple-700/40">{c.status}</span>
              </td>
              <td className="px-3">{c.appliedOn}</td>
              <td className="px-3">
                <div className="flex gap-2">
                  <button onClick={()=>setStatusFor(c.id,"INTERVIEWED")} className="px-2 py-1 bg-slate-700 rounded">Interviewed</button>
                  <button onClick={()=>setStatusFor(c.id,"HIRED")} className="px-2 py-1 bg-green-700 rounded">Hire</button>
                  <button onClick={()=>setStatusFor(c.id,"REJECTED")} className="px-2 py-1 bg-red-700 rounded">Reject</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-8 mb-2 font-semibold">Add Candidate</h2>
      <div className="flex flex-wrap gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="bg-slate-800 rounded px-3 py-2" />
        <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Contact" className="bg-slate-800 rounded px-3 py-2" />
        <input value={position} onChange={e=>setPosition(e.target.value)} placeholder="Position" className="bg-slate-800 rounded px-3 py-2" />
        <input type="number" value={yearsExp} onChange={e=>setYearsExp(Number(e.target.value))} placeholder="Years Exp" className="bg-slate-800 rounded px-3 py-2 w-32" />
        <select value={status} onChange={e=>setStatus(e.target.value as Candidate["status"])} className="bg-slate-800 rounded px-3 py-2">
          <option>NEW</option><option>INTERVIEWED</option><option>HIRED</option><option>REJECTED</option>
        </select>
        <input type="date" value={appliedOn} onChange={e=>setAppliedOn(e.target.value)} className="bg-slate-800 rounded px-3 py-2" />
        <button onClick={create} className="bg-violet-600 rounded px-4 py-2">Create</button>
      </div>
    </div>
  );
}
