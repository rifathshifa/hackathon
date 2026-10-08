"use client";

import React, { useState, Suspense } from "react";
import Navbar from "@/components/Navbar";
import { useSearchParams } from "next/navigation";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { INITIAL_BOOKINGS, INITIAL_RETURNS, INITIAL_EQUIPMENT } from "@/lib/data";

function ReturnContent() {
  const searchParams = useSearchParams();
  const preselectedBookingId = searchParams.get("bookingId");

  const [bookingId, setBookingId] = useState(preselectedBookingId || INITIAL_BOOKINGS[0]?.id || "");
  const [condition, setCondition] = useState("EXCELLENT");
  const [damageFound, setDamageFound] = useState(false);
  const [damageNotes, setDamageNotes] = useState("");
  const [damageFine, setDamageFine] = useState(0);
  const [lateHours, setLateHours] = useState(0);
  const [returnsList, setReturnsList] = useState(INITIAL_RETURNS);
  const [successNotice, setSuccessNotice] = useState(null);

  const selectedBooking = INITIAL_BOOKINGS.find((b) => b.id === bookingId);

  // Fine calculation preview
  const lateFinePerHour = 25; // standard parameter
  const totalLateFine = lateHours * lateFinePerHour;
  const totalEstimatedFine = totalLateFine + Number(damageFine || 0);

  const handleReturnSubmit = (e) => {
    e.preventDefault();

    const returnRecord = {
      id: `RET-${Math.floor(100 + Math.random() * 900)}`,
      bookingId,
      equipmentId: selectedBooking?.equipmentId || "EQ-UNKNOWN",
      equipmentName: selectedBooking?.equipmentName || "Equipment Item",
      returnedBy: selectedBooking?.userName || "Operator",
      returnDate: new Date().toISOString(),
      conditionReported: condition,
      damageFound,
      damageNotes: damageFound ? damageNotes : "Clean return. No damage reported.",
      damageFine: Number(damageFine),
      lateHours: Number(lateHours),
      lateFine: totalLateFine,
      status: "VERIFIED_CLOSED",
    };

    setReturnsList([returnRecord, ...returnsList]);
    setSuccessNotice(`Equipment return completed and verified for ${returnRecord.equipmentName}. Record ID: ${returnRecord.id}`);

    // Update equipment status back to AVAILABLE
    const eq = INITIAL_EQUIPMENT.find((item) => item.id === returnRecord.equipmentId);
    if (eq) {
      eq.status = "AVAILABLE";
    }
  };

  return (
    <div className="space-y-8">
      {/* Return Form */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-10 border border-cyan-500/30 max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Return Equipment
          </h2>
        </div>

        {successNotice && (
          <div className="p-4 rounded-xl mb-6 bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-3 text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Return Confirmed</div>
              <div className="text-xs mt-0.5">{successNotice}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleReturnSubmit} className="space-y-6">
          {/* Select Booking */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">
              Select Booking
            </label>
            <select
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 font-sans"
            >
              {INITIAL_BOOKINGS.map((bk) => (
                <option key={bk.id} value={bk.id}>
                  {bk.id} — {bk.equipmentName} ({bk.userName})
                </option>
              ))}
            </select>
          </div>

          {/* Condition Radio Group */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">
              Physical Condition
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {["EXCELLENT", "GOOD", "NEEDS_SERVICE", "DAMAGED"].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => {
                    setCondition(lvl);
                    if (lvl === "DAMAGED") setDamageFound(true);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-mono transition-all ${
                    condition === lvl
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                      : "bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Damage Check Toggle */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Damage Reported?</div>
              </div>
              <input
                type="checkbox"
                checked={damageFound}
                onChange={(e) => setDamageFound(e.target.checked)}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            {damageFound && (
              <div className="pt-3 border-t border-white/5 space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Damage Details
                  </label>
                  <textarea
                    rows={2}
                    value={damageNotes}
                    onChange={(e) => setDamageNotes(e.target.value)}
                    placeholder="Describe specific damage..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-400 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Damage Fine ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={damageFine}
                    onChange={(e) => setDamageFine(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-400 font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Late return simulation */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">
              Late Return (Hours)
            </label>
            <input
              type="number"
              min="0"
              value={lateHours}
              onChange={(e) => setLateHours(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* Fee Summary */}
          {totalEstimatedFine > 0 && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-xs">
              <span className="text-rose-300 font-bold">TOTAL ASSESSED FINES (LATE + DAMAGE):</span>
              <span className="text-lg font-mono font-black text-rose-300">${totalEstimatedFine}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Complete Return & Certify Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Historical Return Records */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 max-w-4xl mx-auto">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <FileCheck className="w-5 h-5 text-cyan-400" />
          <span>Completed Equipment Return Ledger</span>
        </h3>

        <div className="space-y-3">
          {returnsList.map((ret) => (
            <div
              key={ret.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-cyan-400">{ret.id}</span>
                  <span className="text-slate-500">&bull;</span>
                  <span className="text-slate-300 font-medium">{ret.equipmentName}</span>
                </div>
                <div className="text-slate-400 mt-1">
                  Returned by {ret.returnedBy} &bull; Condition:{" "}
                  <span className="text-emerald-400 font-mono">{ret.conditionReported}</span>
                </div>
                <div className="text-slate-500 mt-0.5 italic">{ret.damageNotes}</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  {ret.status}
                </span>
                {ret.damageFine + ret.lateFine > 0 ? (
                  <div className="text-rose-400 font-mono font-bold mt-1">
                    Fine: ${ret.damageFine + ret.lateFine}
                  </div>
                ) : (
                  <div className="text-emerald-400 font-mono mt-1">Zero Fines</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReturnPage() {
  const [role, setRole] = useState("USER");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={role} setRole={setRole} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="text-white text-center py-20 font-mono">Loading return interface...</div>}>
          <ReturnContent />
        </Suspense>
      </main>
    </div>
  );
}
