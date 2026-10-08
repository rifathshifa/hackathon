"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth, DEFAULT_STUDENT, DEFAULT_STAFF } from "@/context/AuthContext";
import {
  GraduationCap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Layers,
  ShieldAlert,
} from "lucide-react";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role");

  const { user, login, loginAsDemo } = useAuth();

  const [activeTab, setActiveTab] = useState(
    requestedRole?.toUpperCase() === "STAFF" ? "STAFF" : "STUDENT"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Update defaults when activeTab changes
  useEffect(() => {
    setError("");
    setSuccessMsg("");
    if (activeTab === "STUDENT") {
      setEmail("student@equipx.edu");
      setPassword("student123");
    } else {
      setEmail("staff@equipx.edu");
      setPassword("staff123");
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const result = await login(activeTab, email, password);

    setLoading(false);
    if (result.success) {
      setSuccessMsg(`Authenticated as ${result.user.name} (${result.user.role})`);
      setTimeout(() => {
        if (result.user.role === "STAFF") {
          router.push("/dashboard");
        } else {
          router.push("/dashboard");
        }
      }, 700);
    } else {
      setError(result.error || "Authentication failed. Please verify credentials.");
    }
  };

  const handleQuickDemo = (roleToLogin) => {
    const demo = loginAsDemo(roleToLogin);
    setSuccessMsg(`Logged in as demo ${roleToLogin.toLowerCase()}: ${demo.name}`);
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  const isStudentTab = activeTab === "STUDENT";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-lg">
          {/* Header Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Role-Based Access Control
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              EquipX Portal Login
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select your role to access laboratory resources and permissions.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 mb-6 shadow-xl">
            <button
              type="button"
              onClick={() => setActiveTab("STUDENT")}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isStudentTab
                  ? "bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${isStudentTab ? "text-cyan-400" : "text-slate-400"}`} />
              <span>Student Login</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("STAFF")}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                !isStudentTab
                  ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-300 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${!isStudentTab ? "text-purple-400" : "text-slate-400"}`} />
              <span>Staff Login</span>
            </button>
          </div>

          {/* Login Card */}
          <div className={`glass-panel-glow rounded-3xl p-6 sm:p-8 border transition-all duration-300 ${
            isStudentTab ? "border-cyan-500/30" : "border-purple-500/30"
          }`}>
            {/* Role Header Banner */}
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-base font-bold ${isStudentTab ? "text-cyan-300" : "text-purple-300"}`}>
                    {isStudentTab ? "Student Verification" : "Staff & Faculty Access"}
                  </span>
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                    isStudentTab
                      ? "bg-cyan-950/60 text-cyan-400 border-cyan-500/40"
                      : "bg-purple-950/60 text-purple-400 border-purple-500/40"
                  }`}>
                    {activeTab}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isStudentTab
                    ? "Book apparatus, scan equipment QR codes, and view reservations."
                    : "Approve checkouts, manage lab inventory, and log returns/damage."}
                </p>
              </div>
            </div>

            {/* Notification messages */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {isStudentTab ? "Student ID / Campus Email" : "Staff ID / Work Email"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={isStudentTab ? "student@equipx.edu or STU-2026-081" : "staff@equipx.edu or FAC-2026-902"}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  isStudentTab
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:brightness-110 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                }`}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In as {isStudentTab ? "Student" : "Staff"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative px-3 bg-slate-950 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Instant Demo Access
              </span>
            </div>

            {/* Quick Demo Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("STUDENT")}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <span>1-Click Demo: Alex Rivera (Student)</span>
                </div>
                <span className="text-[10px] text-cyan-400/80 group-hover:translate-x-1 transition-transform">
                  Instant &rarr;
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("STAFF")}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-mono flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  <span>1-Click Demo: Dr. Evelyn Vance (Staff)</span>
                </div>
                <span className="text-[10px] text-purple-400/80 group-hover:translate-x-1 transition-transform">
                  Instant &rarr;
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#030712]" />}>
      <LoginPageInner />
    </React.Suspense>
  );
}
