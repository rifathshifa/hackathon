"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  Calendar,
  Clock,
  RotateCcw,
  QrCode,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Compass,
  RefreshCw,
} from "lucide-react";
import { fetchBookings } from "@/lib/api";

export default function BookingsPage() {
  const [role, setRole] = useState("STUDENT");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filterOptions = ["ALL", "pending", "approved", "issued", "returned", "rejected"];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchBookings();
      setBookings(data || []);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = bookings.filter((b) =>
    statusFilter === "ALL" ? true : b.status === statusFilter
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={role} setRole={setRole} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              My Bookings
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-cyan-400 transition-colors"
              title="Refresh database records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            <Link
              href="/booking"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>New Booking</span>
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all uppercase ${
                statusFilter === f
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Bookings Card List */}
        <div className="space-y-4">
          {filtered.map((booking) => (
            <div
              key={booking.id}
              className="glass-card rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-500/20">
                    {booking.id}
                  </span>
                  {booking.registration_type === "TEAM" || booking.user?.startsWith("Team") ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300">
                      TEAM
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
                      INDIVIDUAL
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                      booking.status === "approved"
                        ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
                        : booking.status === "issued"
                        ? "bg-cyan-950/80 border-cyan-500/50 text-cyan-300 font-bold animate-pulse"
                        : booking.status === "pending"
                        ? "bg-purple-950/80 border-purple-500/50 text-purple-300"
                        : booking.status === "returned"
                        ? "bg-slate-800 border-white/10 text-slate-400"
                        : "bg-rose-950/80 border-rose-500/50 text-rose-300"
                    }`}
                  >
                    {booking.status}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-semibold">
                    NODE: {booking.equipment_id}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {new Date(booking.from).toLocaleString()} &rarr;{" "}
                    {new Date(booking.to).toLocaleString()}
                  </span>
                  <span>&bull;</span>
                  <span>
                    Registrant: <strong className="text-white">{booking.user}</strong>
                  </span>
                  {booking.department && (
                    <>
                      <span>&bull;</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-cyan-300 font-mono text-[10px]">
                        {booking.department}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
                <Link
                  href={`/catalog/${booking.equipment_id}`}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Passport & QR</span>
                </Link>

                <Link
                  href={`/booking?equipmentId=${booking.equipment_id}`}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Re-Book</span>
                </Link>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No bookings matching filter</p>
              <p className="text-xs text-slate-400 mt-1">Book an equipment slot to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
