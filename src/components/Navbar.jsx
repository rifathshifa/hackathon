"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  Layers,
  Calendar,
  QrCode,
  RotateCcw,
  ShieldAlert,
  Menu,
  X,
  Compass,
  Cpu,
  GraduationCap,
  ShieldCheck,
  LogOut,
  User,
  LogIn,
} from "lucide-react";

function NavbarInner({ role: propRole, setRole: propSetRole }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Auth context integration
  let authContext = null;
  try {
    authContext = useAuth();
  } catch (e) {
    // Graceful fallback if rendered outside AuthProvider
  }

  const user = authContext?.user || null;
  const authRole = authContext?.role || "STUDENT";
  const switchRole = authContext?.switchRole || (() => {});
  const logout = authContext?.logout || (() => {});

  // Current effective role (supports both context and prop overrides)
  const currentRole = propRole
    ? propRole === "ADMIN" ? "STAFF" : propRole === "USER" ? "STUDENT" : propRole
    : authRole;

  const isStaff = currentRole === "STAFF" || currentRole === "ADMIN";

  const handleRoleToggle = (targetRole) => {
    if (propSetRole) {
      propSetRole(targetRole === "STAFF" ? "ADMIN" : "USER");
    }
    if (authContext) {
      switchRole(targetRole);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: Layers },
    { label: "Equipment", href: "/equipment", icon: Cpu },
    { label: "Availability", href: "/availability", icon: Calendar },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "My Bookings", href: "/bookings", icon: Compass },
    { label: "QR Scanner", href: "/scanner", icon: QrCode },
    { label: "Staff Approvals", href: "/admin", icon: ShieldAlert, staffOnly: true },
    { label: "Return Hub", href: "/return", icon: RotateCcw },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#030712]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-purple-600/30 to-pink-500/20 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all">
            <Sparkles className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-xl border border-white/20 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400">
              EQUIP<span className="text-cyan-400">X</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              v2.0
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            if (item.staffOnly && !isStaff) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Role Authentication */}
        <div className="flex items-center gap-3">
          {/* Active User / Role Badge */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center gap-2 py-1 px-2.5 rounded-xl border transition-all text-xs font-mono ${
                  isStaff
                    ? "bg-purple-950/40 border-purple-500/40 text-purple-300 hover:bg-purple-900/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    : "bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                }`}
              >
                <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                  isStaff ? "bg-purple-500/30 text-purple-200" : "bg-cyan-500/30 text-cyan-200"
                }`}>
                  {isStaff ? <ShieldCheck className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                </div>
                <span className="hidden sm:inline font-sans font-semibold text-slate-200 max-w-[100px] truncate">
                  {user.name}
                </span>
                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded-md font-mono ${
                  isStaff ? "bg-purple-500/20 text-purple-300" : "bg-cyan-500/20 text-cyan-300"
                }`}>
                  {isStaff ? "STAFF" : "STUDENT"}
                </span>
              </button>

              {/* Profile / Switcher Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950/95 border border-white/10 shadow-2xl backdrop-blur-2xl p-3 z-50 animate-fade-in">
                  <div className="pb-2.5 mb-2.5 border-b border-white/10">
                    <div className="text-xs font-semibold text-white">{user.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">{user.email}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{user.department}</div>
                  </div>

                  <div className="text-[10px] uppercase font-mono text-slate-500 px-1 mb-1.5">
                    Switch Role:
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                    <button
                      onClick={() => {
                        handleRoleToggle("STUDENT");
                        setProfileDropdownOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                        !isStaff
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      <GraduationCap className="w-3 h-3" />
                      Student
                    </button>
                    <button
                      onClick={() => {
                        handleRoleToggle("STAFF");
                        setProfileDropdownOpen(false);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                        isStaff
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      Staff
                    </button>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex flex-col gap-1">
                    <Link
                      href="/login"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900 flex items-center gap-2"
                    >
                      <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Switch Account Portal</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login?role=student"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </Link>
              <Link
                href="/login?role=staff"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)]"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Staff Login</span>
              </Link>
            </div>
          )}

          {/* Quick Scan QR link */}
          <Link
            href="/scanner"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 text-slate-300 border border-white/10 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-slate-950/95 border-b border-cyan-500/20 backdrop-blur-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            if (item.staffOnly && !isStaff) return null;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
            <Link
              href="/login?role=student"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-cyan-500/10 border border-cyan-500/30 text-cyan-300"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Student Login
            </Link>
            <Link
              href="/login?role=staff"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-purple-500/10 border border-purple-500/30 text-purple-300"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Staff Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default function Navbar(props) {
  return (
    <React.Suspense fallback={<header className="sticky top-0 z-50 h-16 w-full border-b border-white/10 bg-[#030712]/80 backdrop-blur-xl" />}>
      <NavbarInner {...props} />
    </React.Suspense>
  );
}
