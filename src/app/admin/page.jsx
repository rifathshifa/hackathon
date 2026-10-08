"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Cpu,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { fetchBookings, approveBookingById, fetchEquipment } from "@/lib/api";

export default function AdminApprovalPage() {
  const { user, isStaff, switchRole } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bks, eqs] = await Promise.all([fetchBookings(), fetchEquipment()]);
      setBookings(bks || []);
      setEquipmentList(eqs || []);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      // Strictly calls POST /bookings/{id}/approve per OpenAPI F4 contract
      const result = await approveBookingById(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: result.status } : b))
      );
    } catch (err) {
      alert("Approval error: " + (err.response?.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isStaff ? (
          <div className="max-w-xl mx-auto my-12 glass-panel-glow rounded-3xl p-8 border border-purple-500/30 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-4 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Staff Authorization Required
            </h2>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              This approval terminal is restricted to lab administrators and faculty. You are currently logged in as a <span className="text-cyan-400 font-semibold">{user?.name || "Student"}</span> with student permissions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => switchRole("STAFF")}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Switch to Staff Account</span>
              </button>
              <Link
                href="/login?role=staff"
                className="py-2.5 px-5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 font-mono text-xs flex items-center justify-center gap-2 hover:text-white transition-colors"
              >
                <span>Staff Login Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <React.Fragment>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Staff Approvals
                </h1>
              </div>

              <button
                onClick={loadData}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2 text-xs font-mono self-start sm:self-auto"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
                <span>Sync</span>
              </button>
            </div>

            {/* Section 1: Reservation Approval Queue */}
            <div className="glass-panel-purple rounded-2xl p-6 sm:p-8 border border-purple-500/30 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Pending Approvals</span>
            </h2>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
              {pendingBookings.length} PENDING
            </span>
          </div>

          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {booking.id}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border uppercase ${
                        booking.status === "approved"
                          ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                          : booking.status === "pending"
                          ? "bg-amber-950 text-amber-300 border-amber-500/40 animate-pulse"
                          : "bg-purple-950 text-purple-300 border-purple-500/40"
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-xs font-mono text-cyan-400">
                      [{booking.equipment_id}]
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-mono">
                    Window: {new Date(booking.from).toLocaleString()} &rarr;{" "}
                    {new Date(booking.to).toLocaleString()}
                  </div>

                  <div className="text-xs text-slate-400">
                    User: <span className="text-slate-200 font-semibold">{booking.user}</span>
                  </div>
                </div>

                {/* Approval Action Button */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                  {booking.status === "pending" ? (
                    <button
                      onClick={() => handleApprove(booking.id)}
                      disabled={processingId === booking.id}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:opacity-95 transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{processingId === booking.id ? "Approving..." : "Approve"}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>APPROVED</span>
                    </span>
                  )}
                </div>
              </div>
            ))}

            {bookings.length === 0 && !loading && (
              <div className="p-8 rounded-xl bg-slate-900/40 text-center text-slate-400 text-xs">
                Zero reservations found in database.
              </div>
            )}
          </div>
        </div>
        </React.Fragment>
        )}
      </main>
    </div>
  );
}
