"use client";

import React, { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  Cpu,
  CalendarCheck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Lock,
  Play,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
  Zap,
  GraduationCap,
} from "lucide-react";

export default function HomePage() {
  const [role, setRole] = useState("STUDENT");
  const videoRef = useRef(null);

  const pillars = [
    {
      title: "Deterministic Booking",
      desc: "Zero-conflict mathematical scheduling rule: newStart < existingEnd && newEnd > existingStart. No ambiguity.",
      icon: CalendarCheck,
      color: "from-cyan-500/20 to-blue-500/20",
      border: "border-cyan-500/30",
      textColor: "text-cyan-400",
      href: "/availability",
    },
    {
      title: "QR Hardware Passport",
      desc: "Every equipment piece possesses a cryptographic QR identity for fast check-out, location tracking, and audit.",
      icon: ShieldCheck,
      color: "from-emerald-500/20 to-teal-500/20",
      border: "border-emerald-500/30",
      textColor: "text-emerald-400",
      href: "/scanner",
    },
    {
      title: "Equipment Inventory",
      desc: "Track telemetry from dispatch, usage cycle, condition inspection, to return confirmation and fine audits.",
      icon: Cpu,
      color: "from-purple-500/20 to-indigo-500/20",
      border: "border-purple-500/30",
      textColor: "text-purple-400",
      href: "/equipment",
    },
    {
      title: "Live Event Calendar",
      desc: "Full OpenAPI-compliant Calendar API: GET, POST, PUT, DELETE /calendar/events for lab sessions and orientations.",
      icon: Calendar,
      color: "from-pink-500/20 to-rose-500/20",
      border: "border-pink-500/30",
      textColor: "text-pink-400",
      href: "/calendar",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={role} setRole={setRole} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 pt-10 pb-16 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-500">
              EquipX
            </span>{" "}
            Lab Equipment Management
          </h1>

          <p className="text-slate-400 text-base sm:text-lg mt-3 max-w-xl font-normal">
            Deterministic conflict-free bookings, QR passport tracking, and lab operations.
          </p>

          {/* Centered QR Video Showcase Frame */}
          <div className="relative mt-8 w-full max-w-3xl rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] bg-slate-950 p-2 sm:p-2.5">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black">
              <video
                ref={videoRef}
                src="/QR.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Action Buttons with Separate Student & Staff Portals */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login?role=student"
              className="px-5 py-3 rounded-xl font-bold text-xs bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Student Login</span>
            </Link>

            <Link
              href="/login?role=staff"
              className="px-5 py-3 rounded-xl font-bold text-xs bg-purple-950/70 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Staff Login</span>
            </Link>

            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:opacity-95 transition-all flex items-center gap-2"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/booking"
              className="px-5 py-3 rounded-xl font-semibold text-xs bg-slate-900 border border-white/10 hover:border-cyan-400/50 text-slate-200 transition-all flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Book Equipment</span>
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">
              Core Modules
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Deterministic Booking",
                desc: "Real-time conflict detection and next available free slot recommendations.",
                icon: CalendarCheck,
                color: "from-cyan-500/20 to-blue-500/20",
                border: "border-cyan-500/30",
                textColor: "text-cyan-400",
                href: "/availability",
              },
              {
                title: "QR Passport",
                desc: "Scan hardware barcodes to view specifications, condition, and availability.",
                icon: ShieldCheck,
                color: "from-emerald-500/20 to-teal-500/20",
                border: "border-emerald-500/30",
                textColor: "text-emerald-400",
                href: "/scanner",
              },
              {
                title: "Equipment Inventory",
                desc: "Department-wise equipment catalog with live status and quantity tracking.",
                icon: Cpu,
                color: "from-purple-500/20 to-indigo-500/20",
                border: "border-purple-500/30",
                textColor: "text-purple-400",
                href: "/equipment",
              },
              {
                title: "Event Calendar",
                desc: "Scheduled orientations, workshops, and lab maintenance sessions.",
                icon: Calendar,
                color: "from-pink-500/20 to-rose-500/20",
                border: "border-pink-500/30",
                textColor: "text-pink-400",
                href: "/calendar",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="glass-card rounded-2xl p-6 flex flex-col justify-between group hover:border-cyan-400/50 transition-all duration-200"
                >
                  <div>
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} border ${item.border} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className={`w-5 h-5 ${item.textColor}`} />
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        <p>EquipX &copy; 2026. All rights reserved.</p>
      </footer>
    </div>
  );
}
