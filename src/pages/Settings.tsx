import React from "react";
import Layout from "../components/Layout";
import { AuthCtx } from "../auth/AuthContext";

export default function Settings() {
  const { logout } = React.useContext(AuthCtx);

  return (
    <Layout title="Settings">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-4 text-lg font-semibold">User Profile</h3>
          <label className="block text-sm mb-1 text-slate-300">Full Name</label>
          <input className="mb-3 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2" defaultValue="John Smith" />

          <label className="block text-sm mb-1 text-slate-300">Email Address</label>
          <input className="mb-3 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2" defaultValue="john.smith@example.com" />

          <label className="block text-sm mb-1 text-slate-300">Role</label>
          <input className="mb-4 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2" defaultValue="Admin" disabled />

          <button className="rounded-md bg-purple-600 px-4 py-2 font-semibold hover:bg-purple-700">
            Save Profile Changes
          </button>
          <button onClick={logout} className="ml-3 rounded-md border border-slate-700 px-4 py-2 hover:bg-slate-800">
            Logout
          </button>
        </div>

        {/* Change Password (placeholder) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h3 className="mb-4 text-lg font-semibold">Change Password</h3>
          <label className="block text-sm mb-1 text-slate-300">Current Password</label>
          <input type="password" className="mb-3 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2" />

          <label className="block text-sm mb-1 text-slate-300">New Password</label>
          <input type="password" className="mb-3 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2" />

          <label className="block text-sm mb-1 text-slate-300">Confirm New Password</label>
          <input type="password" className="mb-4 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2" />

          <button disabled className="rounded-md bg-slate-700 px-4 py-2 font-semibold opacity-60">
            Change Password (later)
          </button>
        </div>
      </div>
    </Layout>
  );
}
