"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Cpu,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { fetchEquipment, fetchBookings } from "@/lib/api";
import { findBookingConflict } from "@/lib/conflictDetection";

function AvailabilityContent() {
  const searchParams = useSearchParams();

  const [equipmentList, setEquipmentList] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedDept, setSelectedDept] = useState("CSE");
  const [selectedEqId, setSelectedEqId] = useState(searchParams.get("equipmentId") || "EQ-1");
  const [loading, setLoading] = useState(true);

  // Verifier Inputs
  const [testStart, setTestStart] = useState("2026-10-09T10:00");
  const [testEnd, setTestEnd] = useState("2026-10-09T14:00");

  const loadData = async () => {
    try {
      setLoading(true);
      const [eqs, bks] = await Promise.all([fetchEquipment(), fetchBookings()]);
      setEquipmentList(eqs || []);
      setBookings(bks || []);
      if (eqs?.length > 0 && !searchParams.get("equipmentId") && !selectedEqId) {
        setSelectedEqId(eqs[0].id);
      }
    } catch (err) {
      console.error("Error loading availability data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "ALL"];

  const filteredEquipment = equipmentList.filter((eq) => {
    return selectedDept === "ALL" || eq.department === selectedDept;
  });

  const currentEquipment =
    equipmentList.find((e) => e.id === selectedEqId) ||
    filteredEquipment[0] ||
    equipmentList[0] || { id: selectedEqId, name: "Equipment Node", quantity: 1 };

  const equipmentBookings = bookings.filter((b) => b.equipment_id === selectedEqId);

  // Conflict evaluation for test interval
  let conflictResult = { hasConflict: false };
  let conflictError = null;
  try {
    if (testStart && testEnd) {
      conflictResult = findBookingConflict(testStart, testEnd, equipmentBookings);
    }
  } catch (err) {
    conflictError = err.message;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Equipment Availability
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-2 text-xs font-mono"
            title="Sync with database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <Link
            href={`/booking?equipmentId=${selectedEqId}`}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:opacity-95 transition-all flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>Book Equipment</span>
          </Link>
        </div>
      </div>

      {/* Department & Equipment Selector Ribbon */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-8 border border-white/10 space-y-4">
        {/* Department Categories Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>DEPARTMENT CATEGORY:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  setSelectedDept(dept);
                  const firstOfDept = equipmentList.find((e) => dept === "ALL" || e.department === dept);
                  if (firstOfDept) setSelectedEqId(firstOfDept.id);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  selectedDept === dept
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-semibold"
                    : "text-slate-400 hover:text-white bg-slate-900/60 border border-white/5"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Filtered Equipment Units */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredEquipment.map((eq) => {
            const count = bookings.filter((b) => b.equipment_id === eq.id).length;
            return (
              <button
                key={eq.id}
                onClick={() => setSelectedEqId(eq.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedEqId === eq.id
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    : "bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">{eq.id}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    QTY: {eq.quantity}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate mt-1">{eq.name}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono flex items-center justify-between">
                  <span>{eq.department}</span>
                  <span className="text-slate-500">{count} booked</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Existing Schedule vs Conflict Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Bookings on Equipment */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span>Current Database Reservations ({currentEquipment.id})</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              {equipmentBookings.length} Active Slots
            </span>
          </div>

          {equipmentBookings.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-900/40 text-center border border-white/5">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">Full Schedule Open</p>
              <p className="text-xs text-slate-400 mt-1">
                Zero active bookings in the database for this node. Any valid time slot can be reserved.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {equipmentBookings.map((bk) => (
                <div
                  key={bk.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-cyan-300 font-bold">{bk.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 uppercase">
                        {bk.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-200 mt-1 font-mono">
                      {new Date(bk.from).toLocaleString()} &rarr; {new Date(bk.to).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Reserved by: <span className="text-slate-200">{bk.user}</span>
                    </div>
                  </div>

                  <div className="self-end sm:self-center text-right">
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300">
                      LOCKED SLOT
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conflict Check */}
        <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/30">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">
              Check Availability
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                value={testStart}
                onChange={(e) => setTestStart(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                value={testEnd}
                onChange={(e) => setTestEnd(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {/* Status Outcome */}
            {conflictError ? (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-rose-300">VALIDATION FAULT</div>
                  <div className="text-xs text-rose-200 mt-0.5">{conflictError}</div>
                </div>
              </div>
            ) : conflictResult.hasConflict ? (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-rose-300">
                      This equipment is already booked for the selected time.
                    </div>
                    <div className="text-xs text-slate-300 mt-1 font-mono">
                      Clash with booking: {conflictResult.conflictingBooking?.id} (
                      {new Date(conflictResult.conflictingBooking?.from).toLocaleTimeString()} -{" "}
                      {new Date(conflictResult.conflictingBooking?.to).toLocaleTimeString()})
                    </div>
                  </div>
                </div>

                {/* Suggested Free Slot */}
                {conflictResult.suggestedSlot && (
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>SUGGESTED NEXT FREE SLOT:</span>
                      </div>
                      <div className="font-mono text-white text-[11px] mt-0.5">
                        {conflictResult.suggestedSlot.formattedFrom} &rarr;{" "}
                        {conflictResult.suggestedSlot.formattedTo}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTestStart(conflictResult.suggestedSlot.localInputFrom);
                        setTestEnd(conflictResult.suggestedSlot.localInputTo);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-mono text-[11px]"
                    >
                      Use Slot
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-300">
                    SLOT 100% AVAILABLE
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    No collision detected. Eligible for instant confirmation.
                  </div>
                </div>
              </div>
            )}

            <Link
              href={`/booking?equipmentId=${selectedEqId}&start=${testStart}&end=${testEnd}`}
              className={`w-full py-3 rounded-xl font-semibold text-xs text-center flex items-center justify-center gap-2 transition-all ${
                conflictResult.hasConflict || conflictError
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none"
                  : "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:opacity-95"
              }`}
            >
              <span>Book Validated Slot</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AvailabilityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="text-white text-center py-20 font-mono">Loading availability matrix...</div>}>
          <AvailabilityContent />
        </Suspense>
      </main>
    </div>
  );
}
