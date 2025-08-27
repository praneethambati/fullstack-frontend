// src/pages/Login.tsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthCtx } from "../auth/AuthContext";

export default function Login() {
  const { login } = useContext(AuthCtx);
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@test.com"); // demo default
  const [password, setPassword] = useState("admintest");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      nav("/dashboard", { replace: true });
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 rounded-md bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 rounded-md bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-purple-500 outline-none"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 py-2 px-4 rounded-md font-semibold"
          >
            Access Dashboard
          </button>
        </form>
        <p className="text-xs text-center mt-4 text-slate-400">
          Demo credentials: admin@example.com / password
        </p>
      </div>
    </div>
  );
}
