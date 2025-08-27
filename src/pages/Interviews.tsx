import React from "react";
import { AuthCtx } from "../auth/AuthContext";

const API_BASE = "http://localhost:8080";

type Interview = {
  id: number;
  candidate: string;
  position: string;
  type: "VIDEO" | "PHONE" | "IN_PERSON";
  startAt: string; // ISO
  interviewer: string;
  status: "SCHEDULED" | "COMPLETED" | "IN_PROGRESS" | "CANCELLED";
};

type Page<T> = { content: T[]; totalElements: number; totalPages: number; number: number; size: number };

export default function Interviews() {
  const { authFetch } = React.useContext(AuthCtx);
  const [rows, setRows] = React.useState<Interview[]>([]);
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [size] = React.useState(20);

  // form
  const [candidate, setCandidate] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [type, setType] = React.useState<Interview["type"]>("VIDEO");
  const [startAt, setStartAt] = React.useState("");
  const [interviewer, setInterviewer] = React.useState("");
  const [status, setStatus] = React.useState<Interview["status"]>("SCHEDULED");

  const load = React.useCallback(async () => {
    const url = new URL(`${API_BASE}/interviews`);
    if (q) url.searchParams.set("q", q);
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", String(size));
    const res = await authFetch(url.toString());
    if (!res.ok) throw new Error(`GET /interviews ${res.status}`);
    const data: Page<Interview> = await res.json();
    setRows(data.content);
  }, [authFetch, q, page, size]);

  React.useEffect(()=>{ load().catch(console.error); }, [load]);

  const create = async () => {
    const res = await authFetch(`${API_BASE}/interviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate, position, type, startAt, interviewer, status }),
    });
    if (!res.ok) { alert("Create failed"); return; }
    setCandidate(""); setPosition(""); setType("VIDEO"); setStartAt(""); setInterviewer(""); setStatus("SCHEDULED");
    load().catch(console.error);
  };

  const setStatusFor = async (id: number, next: Interview["status"]) => {
    const res = await authFetch(`${API_BASE}/interviews/${id}/status?status=${next}`, { method: "PATCH" });
    if (!res.ok) { alert("Update status failed"); return; }
    load().catch(console.error);
  };

  return (
    <div className="p-6 text-slate-200">
      <h1 className="text-2xl font-semibold mb-4">Interviews</h1>

      <div className="flex gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search candidate or position..."
               className="bg-slate-800 rounded px-3 py-2 w-80" />
        <button onClick={()=>{ setPage(0); load().catch(console.error); }}
                className="bg-violet-600 rounded px-4 py-2">Search</button>
      </div>

      <table className="w-full text-sm border-separate border-spacing-y-2">
        <thead className="text-slate-400">
          <tr>
            <th className="text-left px-3">Candidate</th>
            <th className="text-left px-3">Position</th>
            <th className="text-left px-3">Type</th>
            <th className="text-left px-3">Date & Time</th>
            <th className="text-left px-3">Interviewer</th>
            <th className="text-left px-3">Status</th>
            <th className="px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(i => (
            <tr key={i.id} className="bg-slate-900">
              <td className="px-3 py-3">{i.candidate}</td>
              <td className="px-3">{i.position}</td>
              <td className="px-3">{i.type}</td>
              <td className="px-3">{new Date(i.startAt).toLocaleString()}</td>
              <td className="px-3">{i.interviewer}</td>
              <td className="px-3"><span className="px-2 py-1 rounded bg-purple-700/40">{i.status}</span></td>
              <td className="px-3">
                <div className="flex gap-2">
                  <button onClick={()=>setStatusFor(i.id,"IN_PROGRESS")} className="px-2 py-1 bg-slate-700 rounded">Start</button>
                  <button onClick={()=>setStatusFor(i.id,"COMPLETED")} className="px-2 py-1 bg-green-700 rounded">Complete</button>
                  <button onClick={()=>setStatusFor(i.id,"CANCELLED")} className="px-2 py-1 bg-red-700 rounded">Cancel</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-8 mb-2 font-semibold">Schedule Interview</h2>
      <div className="flex flex-wrap gap-2">
        <input value={candidate} onChange={e=>setCandidate(e.target.value)} placeholder="Candidate" className="bg-slate-800 rounded px-3 py-2" />
        <input value={position} onChange={e=>setPosition(e.target.value)} placeholder="Position" className="bg-slate-800 rounded px-3 py-2" />
        <select value={type} onChange={e=>setType(e.target.value as Interview["type"])} className="bg-slate-800 rounded px-3 py-2">
          <option>VIDEO</option><option>PHONE</option><option>IN_PERSON</option>
        </select>
        {/* Local datetime input expects 'YYYY-MM-DDTHH:mm' */}
        <input type="datetime-local" value={startAt} onChange={e=>setStartAt(e.target.value)} className="bg-slate-800 rounded px-3 py-2" />
        <input value={interviewer} onChange={e=>setInterviewer(e.target.value)} placeholder="Interviewer" className="bg-slate-800 rounded px-3 py-2" />
        <select value={status} onChange={e=>setStatus(e.target.value as Interview["status"])} className="bg-slate-800 rounded px-3 py-2">
          <option>SCHEDULED</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option>
        </select>
        <button onClick={create} className="bg-violet-600 rounded px-4 py-2">Create</button>
      </div>
    </div>
  );
}
