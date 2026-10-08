"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  Cpu,
  Calendar,
  CheckCircle2,
  Clock,
  QrCode,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  ShieldAlert,
  Bell,
  RefreshCw,
  Wrench,
  AlertOctagon,
  FileText,
  UserCheck,
  Send,
} from "lucide-react";
import {
  fetchEquipment,
  fetchBookings,
  approveBookingById,
  updateBookingLifecycle,
  fetchDamageReports,
  fetchNotifications,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, role: authRole, switchRole } = useAuth();
  const [role, setRole] = useState(authRole || "STUDENT"); // STUDENT or STAFF
  const [equipmentList, setEquipmentList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [damageReports, setDamageReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authRole) {
      setRole(authRole);
    }
  }, [authRole]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    switchRole(newRole);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [eqs, bks, dmgs, notifs] = await Promise.all([
        fetchEquipment(),
        fetchBookings(),
        fetchDamageReports(),
        fetchNotifications(role),
      ]);
      setEquipmentList(eqs || []);
      setBookings(bks || []);
      setDamageReports(dmgs || []);
      setNotifications(notifs || []);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [role]);

  // Lifecycle state actions
  const handleApprove = async (id) => {
    try {
      await approveBookingById(id);
      loadAllData();
    } catch (e) {
      alert("Error approving: " + e.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateBookingLifecycle(id, status);
      loadAllData();
    } catch (e) {
      alert("Error updating status: " + e.message);
    }
  };

  // Metrics
  const availableCount = equipmentList.filter((e) => (e.status || "available") === "available").length;
  const maintenanceCount = equipmentList.filter((e) => e.status === "maintenance").length;
  const damagedCount = equipmentList.filter((e) => e.status === "damaged").length;

  // Overdue bookings calculation (issued bookings past their 'to' timestamp)
  const [currentTime, setCurrentTime] = useState(null);
  useEffect(() => {
    setCurrentTime(new Date());
  }, []);

  const overdueBookings = bookings.filter(
    (b) => b.status === "issued" && currentTime && new Date(b.to) < currentTime
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar with Role Switcher & Sync */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {role === "STUDENT" ? "Student Dashboard" : "Staff Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Role Switcher Pill */}
            <div className="flex items-center bg-slate-900 border border-white/10 rounded-xl p-1 text-xs font-mono">
              <button
                onClick={() => handleRoleChange("STUDENT")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  role === "STUDENT"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                STUDENT
              </button>
              <button
                onClick={() => handleRoleChange("STAFF")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  role === "STAFF"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                STAFF
              </button>
            </div>

            <button
              onClick={loadAllData}
              className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-cyan-400 transition-colors"
              title="Sync with database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            <Link
              href="/booking"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Slot</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-2xl p-5 border border-cyan-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>AVAILABLE</span>
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {availableCount}{" "}
              <span className="text-xs font-normal text-slate-400">/ {equipmentList.length}</span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-purple-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>BOOKINGS</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {bookings.length}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-pink-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>MAINTENANCE</span>
              <Wrench className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {maintenanceCount + damagedCount}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-amber-500/20">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>OVERDUE</span>
              <AlertOctagon className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white mt-2">
              {overdueBookings.length}
            </div>
          </div>
        </div>

        {/* Notifications Ribbon */}
        {notifications.length > 0 && (
          <div className="glass-panel rounded-2xl p-4 mb-8 border border-cyan-500/20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-white font-mono mr-2">[{notifications[0].title}]:</span>
                <span className="text-slate-300">{notifications[0].message}</span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 shrink-0">
              {notifications.length} NOTIFICATIONS
            </span>
          </div>
        )}

        {/* STUDENT DASHBOARD VIEW */}
        {role === "STUDENT" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Equipment Fleet Status & Direct Booking */}
              <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" />
                    <span>Equipment</span>
                  </h3>
                  <Link href="/catalog" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono">
                    <span>View All &rarr;</span>
                  </Link>
                </div>

                <div className="space-y-3">
                  {equipmentList.map((eq) => (
                    <div
                      key={eq.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shrink-0">
                          <Cpu className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link href={`/catalog/${eq.id}`} className="font-bold text-white text-sm hover:text-cyan-400 transition-colors">
                              {eq.name}
                            </Link>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-cyan-500/20">
                              {eq.id}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2 font-mono">
                            <span>{eq.department || "Physics & Tech"}</span>
                            <span>&bull;</span>
                            <span>{eq.lab || "Main Lab"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase ${
                            eq.status === "available" || !eq.status
                              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                              : eq.status === "maintenance"
                              ? "bg-pink-950/60 border-pink-500/40 text-pink-400"
                              : "bg-amber-950/60 border-amber-500/40 text-amber-400"
                          }`}
                        >
                          {eq.status || "available"} (QTY: {eq.quantity})
                        </span>

                        <Link
                          href={`/booking?equipmentId=${eq.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all"
                        >
                          Book Slot
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Quick Tools */}
              <div className="space-y-6">
                {/* QR Scanner Tool */}
                <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">QR Scanner</h4>
                    </div>
                  </div>
                  <Link
                    href="/scanner"
                    className="w-full mt-3 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-all font-mono"
                  >
                    <span>Launch Scanner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Calendar Events Tool */}
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>Calendar</span>
                    </h4>
                    <Link href="/calendar" className="text-xs text-cyan-400 font-mono">
                      View &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* My Active Bookings */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span>My Bookings</span>
                </h3>
                <Link href="/my-bookings" className="text-xs text-cyan-400 font-mono">
                  Full List &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-cyan-300 font-bold">{b.id}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                          b.status === "approved"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                            : b.status === "issued"
                            ? "bg-cyan-950 text-cyan-300 border-cyan-500/40 font-bold"
                            : b.status === "returned"
                            ? "bg-slate-800 text-slate-400 border-white/10"
                            : "bg-purple-950 text-purple-300 border-purple-500/40"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white">
                      NODE: {b.equipment_id}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {new Date(b.from).toLocaleString()} &rarr; {new Date(b.to).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STAFF DASHBOARD VIEW */}
        {role === "STAFF" && (
          <div className="space-y-8">
            {/* Booking Requests Queue */}
            <div className="glass-panel-purple rounded-2xl p-6 sm:p-8 border border-purple-500/30">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-400" />
                  <span>Booking Requests</span>
                </h3>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                  {bookings.filter((b) => b.status === "pending").length} PENDING
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
                        <span className="text-xs font-mono font-bold text-cyan-300">{booking.id}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                            booking.status === "approved"
                              ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                              : booking.status === "issued"
                              ? "bg-cyan-950 text-cyan-300 border-cyan-500/40 font-bold"
                              : booking.status === "returned"
                              ? "bg-slate-800 text-slate-400 border-white/10"
                              : booking.status === "rejected"
                              ? "bg-rose-950 text-rose-300 border-rose-500/40"
                              : "bg-amber-950 text-amber-300 border-amber-500/40"
                          }`}
                        >
                          {booking.status}
                        </span>
                        <span className="text-xs font-mono text-slate-400">NODE: {booking.equipment_id}</span>
                      </div>

                      <div className="text-xs text-slate-300 font-mono">
                        {new Date(booking.from).toLocaleString()} &rarr; {new Date(booking.to).toLocaleString()}
                      </div>

                      <div className="text-xs text-slate-400">
                        Student: <span className="text-slate-200 font-semibold">{booking.user}</span>
                      </div>
                    </div>

                    {/* Staff Workflow Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(booking.id)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, "rejected")}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {booking.status === "approved" && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, "issued")}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-all flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Issue</span>
                        </button>
                      )}

                      {booking.status === "issued" && (
                        <button
                          onClick={() => handleUpdateStatus(booking.id, "returned")}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Return</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Overdue Tracking & Damage Reports Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Overdue Tracking */}
              <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                  <span>Overdue Equipment Tracking</span>
                </h3>

                {overdueBookings.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-900/40 border border-white/5 text-center text-xs text-slate-400">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <span>No overdue equipment. All return periods currently valid.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overdueBookings.map((ob) => (
                      <div key={ob.id} className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-rose-300 font-mono">{ob.equipment_id} ({ob.id})</div>
                          <div className="text-slate-300 mt-0.5">Holder: {ob.user}</div>
                          <div className="text-[11px] text-rose-400 font-mono">Overdue since: {new Date(ob.to).toLocaleString()}</div>
                        </div>
                        <button
                          onClick={() => handleUpdateStatus(ob.id, "returned")}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[11px]"
                        >
                          Force Return
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Damage & Maintenance Log */}
              <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-pink-400" />
                    <span>Damage Inspection & Maintenance Log</span>
                  </h3>
                  <Link href="/return" className="text-xs text-cyan-400 font-mono">
                    Report &rarr;
                  </Link>
                </div>

                <div className="space-y-3">
                  {damageReports.map((dr) => (
                    <div key={dr.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-cyan-300">{dr.id} &bull; {dr.equipment_id}</span>
                        <span className="text-pink-400 font-bold">{dr.severity}</span>
                      </div>
                      <div className="text-slate-300">{dr.description}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Reported by {dr.reported_by}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
