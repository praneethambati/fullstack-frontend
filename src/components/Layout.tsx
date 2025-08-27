import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthCtx } from "../auth/AuthContext";

export default function Layout({ title, children }: { title?: string; children: React.ReactNode }) {
  const { logout } = React.useContext(AuthCtx);
  const { pathname } = useLocation();

  const Item = ({ to, label }: { to: string; label: string }) => {
    const active = pathname.startsWith(to);
    return (
      <Link
        to={to}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          active ? "bg-purple-600 text-white" : "text-slate-200 hover:bg-slate-700"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-semibold">User Management</div>
            <div className="hidden sm:block text-slate-400 text-sm ml-2">Manage users and permissions</div>
          </div>
          <nav className="flex items-center gap-2">
            <Item to="/dashboard" label="Dashboard" />
            <Item to="/users" label="Users" />
            <Item to="/interviews" label="Interviews" />
            <Item to="/candidates" label="Candidates" />
            <Item to="/calls" label="Calls" />
            <Item to="/settings" label="Settings" />
            <button
              onClick={logout}
              className="ml-2 rounded-md border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {title && <h1 className="mb-6 text-2xl font-bold">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
