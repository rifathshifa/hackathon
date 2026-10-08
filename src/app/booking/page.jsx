"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  ArrowRight,
  Sparkles,
  Zap,
  RefreshCw,
  User,
  Users,
  Plus,
  X,
  ShieldCheck,
  Layers,
  GraduationCap,
} from "lucide-react";
import { fetchEquipment, fetchBookings, requestBooking } from "@/lib/api";
import { findBookingConflict, checkDailyLimit, DAILY_LIMIT_HOURS } from "@/lib/conflictDetection";
import { useAuth } from "@/context/AuthContext";

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: authUser } = useAuth();

  // Registration Mode: INDIVIDUAL vs TEAM
  const [regMode, setRegMode] = useState("INDIVIDUAL"); // "INDIVIDUAL" or "TEAM"

  // Department selection (5 Categories: CSE, ECE, EEE, MECH, CIVIL)
  const [selectedDept, setSelectedDept] = useState("CSE");

  // Equipment & Schedule
  const [equipmentList, setEquipmentList] = useState([]);
  const [equipmentId, setEquipmentId] = useState(searchParams.get("equipmentId") || "EQ-1");
  const [startTime, setStartTime] = useState(searchParams.get("start") || "2026-10-10T14:00");
  const [endTime, setEndTime] = useState(searchParams.get("end") || "2026-10-10T16:00");

  // Individual Registration Fields
  const [studentName, setStudentName] = useState(authUser?.name || "Alex Rivera");
  const [studentId, setStudentId] = useState(authUser?.id || "STU-2026-081");
  const [individualNotes, setIndividualNotes] = useState("Academic lab research project");

  // Team Registration Fields
  const [teamName, setTeamName] = useState("Robotics Core Delta");
  const [teamLeaderName, setTeamLeaderName] = useState(authUser?.name || "Alex Rivera");
  const [teamLeaderId, setTeamLeaderId] = useState(authUser?.id || "STU-2026-081");
  const [teamMembers, setTeamMembers] = useState([
    "Samantha Fox (STU-2026-092)",
    "Kevin Patel (STU-2026-114)",
  ]);
  const [newMemberInput, setNewMemberInput] = useState("");
  const [teamNotes, setTeamNotes] = useState("Interdisciplinary senior capstone project");

  const [existingBookings, setExistingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Status and conflict alerts
  const [conflictAlert, setConflictAlert] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  useEffect(() => {
    if (authUser?.name) {
      setStudentName(authUser.name);
      setTeamLeaderName(authUser.name);
    }
    if (authUser?.id) {
      setStudentId(authUser.id);
      setTeamLeaderId(authUser.id);
    }
  }, [authUser]);

  // Load equipment and current bookings
  const loadDatabaseData = async () => {
    try {
      setLoading(true);
      const [eqs, bks] = await Promise.all([fetchEquipment(), fetchBookings()]);
      setEquipmentList(eqs || []);
      setExistingBookings(bks || []);

      // If equipment ID provided in query params, sync department
      const preselected = (eqs || []).find((e) => e.id === searchParams.get("equipmentId"));
      if (preselected?.department) {
        setSelectedDept(preselected.department);
        setEquipmentId(preselected.id);
      } else if (eqs?.length > 0) {
        const cseEquip = eqs.find((e) => e.department === "CSE") || eqs[0];
        setEquipmentId(cseEquip.id);
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  // Filter equipment strictly by the selected department
  const departmentEquipment = equipmentList.filter((e) => e.department === selectedDept);

  // When selected department changes, auto-select first item of that department
  const handleDepartmentChange = (dept) => {
    setSelectedDept(dept);
    const firstOfDept = equipmentList.find((e) => e.department === dept);
    if (firstOfDept) {
      setEquipmentId(firstOfDept.id);
    }
  };

  // Filter existing bookings for currently selected equipment
  const selectedEquipmentBookings = existingBookings.filter(
    (b) => b.equipment_id === equipmentId
  );

  // Live deterministic conflict check whenever inputs change
  useEffect(() => {
    if (!startTime || !endTime || selectedEquipmentBookings.length === 0) {
      setConflictAlert(null);
      return;
    }

    try {
      const evaluation = findBookingConflict(startTime, endTime, selectedEquipmentBookings);
      if (evaluation.hasConflict) {
        setConflictAlert({
          message: evaluation.message, // "This equipment is already booked for the selected time."
          conflictingBooking: evaluation.conflictingBooking,
          suggestedSlot: evaluation.suggestedSlot,
        });
      } else {
        setConflictAlert(null);
      }
    } catch (err) {
      setConflictAlert({ message: err.message, isValidation: true });
    }
  }, [equipmentId, startTime, endTime, existingBookings]);

  // Apply suggested free slot with one click
  const handleApplySuggestedSlot = (slot) => {
    if (slot?.localInputFrom && slot?.localInputTo) {
      setStartTime(slot.localInputFrom);
      setEndTime(slot.localInputTo);
    } else if (slot?.from && slot?.to) {
      setStartTime(slot.from.slice(0, 16));
      setEndTime(slot.to.slice(0, 16));
    }
    setConflictAlert(null);
  };

  // Add a team member
  const handleAddMember = (e) => {
    e?.preventDefault();
    const trimmed = newMemberInput.trim();
    if (!trimmed) return;
    if (!teamMembers.includes(trimmed)) {
      setTeamMembers([...teamMembers, trimmed]);
    }
    setNewMemberInput("");
  };

  // Remove a team member
  const handleRemoveMember = (idxToRemove) => {
    setTeamMembers(teamMembers.filter((_, idx) => idx !== idxToRemove));
  };

  // Current user/team identifier for daily limit tracking
  const activeIdentity =
    regMode === "TEAM" ? teamName.trim() : studentName.trim();

  // Evaluate daily booking limit in real-time as user selects dates and times
  const dailyLimitStatus = checkDailyLimit({
    user: activeIdentity,
    from: startTime,
    to: endTime,
    existingBookings,
    limitHours: DAILY_LIMIT_HOURS,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessNotice(null);

    // Enforce daily booking limit
    if (!dailyLimitStatus.allowed) {
      setConflictAlert({
        message: dailyLimitStatus.message,
      });
      return;
    }

    // Conflict check
    const localCheck = findBookingConflict(startTime, endTime, selectedEquipmentBookings);
    if (localCheck.hasConflict) {
      setConflictAlert({
        message: localCheck.message,
        conflictingBooking: localCheck.conflictingBooking,
        suggestedSlot: localCheck.suggestedSlot,
      });
      return;
    }

    // Build payload complying strictly with openapi.yaml F4 contract
    const formattedUserString =
      regMode === "TEAM"
        ? `Team ${teamName.trim()} [Lead: ${teamLeaderName.trim()} | Members: ${teamMembers.join(", ")}]`
        : `${studentName.trim()} (${studentId.trim()})`;

    const bookingPayload = {
      equipment_id: equipmentId,
      user: formattedUserString,
      from: new Date(startTime).toISOString(),
      to: new Date(endTime).toISOString(),
      department: selectedDept,
      registration_type: regMode,
      notes: regMode === "TEAM" ? teamNotes : individualNotes,
      team_name: regMode === "TEAM" ? teamName : null,
      team_leader: regMode === "TEAM" ? teamLeaderName : null,
      team_members: regMode === "TEAM" ? teamMembers : [],
    };

    try {
      setSubmitting(true);
      const result = await requestBooking(bookingPayload);

      if (!result.success) {
        setConflictAlert({
          message: result.message || "This equipment is already booked for the selected time.",
          suggestedSlot: result.suggestedSlot,
          conflictingBooking: result.conflictingBooking,
        });
        return;
      }

      setSuccessNotice({
        title: `${regMode === "TEAM" ? "Team Registration" : "Individual Registration"} Confirmed`,
        booking: result.data,
        regMode,
      });

      await loadDatabaseData();

      setTimeout(() => {
        router.push(`/availability?equipmentId=${equipmentId}`);
      }, 1500);
    } catch (err) {
      setConflictAlert({
        message: err.message || "Failed to process registration booking.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const activeEquipment = equipmentList.find((e) => e.id === equipmentId);

  return (
    <div className="glass-panel-glow rounded-3xl p-6 sm:p-10 border border-cyan-500/30 max-w-3xl mx-auto shadow-2xl">
      {/* Title */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-2">
          <GraduationCap className="w-3.5 h-3.5" />
          Student Registration & Equipment Booking
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Equipment Reservation Hub
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Select between Individual or Collaborative Team registration, choose your department, and book verified lab apparatus.
        </p>
      </div>

      {/* Registration Mode Selector */}
      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-white/10 mb-8 shadow-inner">
        <button
          type="button"
          onClick={() => setRegMode("INDIVIDUAL")}
          className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
            regMode === "INDIVIDUAL"
              ? "bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.25)] font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <User className={`w-4 h-4 ${regMode === "INDIVIDUAL" ? "text-cyan-400" : "text-slate-400"}`} />
          <span>Individual Registration</span>
        </button>

        <button
          type="button"
          onClick={() => setRegMode("TEAM")}
          className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
            regMode === "TEAM"
              ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-300 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.25)] font-bold"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Users className={`w-4 h-4 ${regMode === "TEAM" ? "text-purple-400" : "text-slate-400"}`} />
          <span>Team Registration</span>
        </button>
      </div>

      {/* Success Notification */}
      {successNotice && (
        <div className="p-4 rounded-2xl mb-6 bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm text-emerald-300">
              {successNotice.title}
            </div>
            <div className="text-xs mt-0.5">
              Booking ID: <span className="font-mono font-bold text-white">{successNotice.booking.id}</span> for{" "}
              <span className="font-mono text-cyan-300">{successNotice.booking.equipment_id}</span>.
            </div>
          </div>
        </div>
      )}

      {/* Conflict / Rejection Alert with Suggested Free Slot */}
      {conflictAlert && (
        <div className="p-5 rounded-2xl mb-6 bg-rose-950/50 border border-rose-500/50 text-rose-200 animate-in fade-in space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-rose-300">
                {conflictAlert.message || "This equipment is already booked for the selected time."}
              </div>
              {conflictAlert.conflictingBooking && (
                <div className="text-xs text-slate-300 mt-1 font-mono">
                  Existing reservation: {conflictAlert.conflictingBooking.id} (
                  {new Date(conflictAlert.conflictingBooking.from).toLocaleTimeString()} &rarr;{" "}
                  {new Date(conflictAlert.conflictingBooking.to).toLocaleTimeString()})
                </div>
              )}
            </div>
          </div>

          {/* Automatic Free Slot Suggestion */}
          {conflictAlert.suggestedSlot && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next available free time slot:</span>
                </div>
                <div className="text-xs text-white font-mono mt-1">
                  {conflictAlert.suggestedSlot.formattedFrom} &rarr; {conflictAlert.suggestedSlot.formattedTo}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleApplySuggestedSlot(conflictAlert.suggestedSlot)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:opacity-95 transition-all shrink-0 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Use Slot</span>
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Department Selection (5 Categories: CSE, ECE, EEE, MECH, CIVIL) */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2.5">
          <label className="block text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            1. Select Department Category
          </label>
          <div className="grid grid-cols-5 gap-2">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => handleDepartmentChange(dept)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedDept === dept
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-cyan-400"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Showing only <span className="text-cyan-300 font-bold">{selectedDept}</span> laboratory equipment and verified quantities.
          </div>
        </div>

        {/* Required Equipment (Filtered strictly to selected department) */}
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-2 font-bold">
            2. Required Equipment ({selectedDept})
          </label>
          <select
            value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-white text-sm focus:outline-none focus:border-cyan-400 font-sans"
          >
            {departmentEquipment.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.id} — {eq.name} (QTY: {eq.quantity})
              </option>
            ))}
            {departmentEquipment.length === 0 && (
              <option value="">No equipment available for {selectedDept}</option>
            )}
          </select>

          {activeEquipment && (
            <div className="mt-2 p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
              <div>
                Location: <span className="text-slate-200">{activeEquipment.location || "Main Bay"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Quantity:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold">
                  {activeEquipment.quantity} Units
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Registration Specific Fields */}
        {regMode === "INDIVIDUAL" ? (
          /* Individual Student Section */
          <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-4 animate-fade-in">
            <div className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>3. Individual Student Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. STU-2026-081"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Research / Experiment Notes
              </label>
              <input
                type="text"
                value={individualNotes}
                onChange={(e) => setIndividualNotes(e.target.value)}
                placeholder="Brief description of planned apparatus use"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        ) : (
          /* Team Registration Section */
          <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-4 animate-fade-in">
            <div className="text-xs font-mono text-purple-300 font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>3. Team Registration Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Robotics Core Delta"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Team Leader (Name & ID)
                </label>
                <input
                  type="text"
                  required
                  value={teamLeaderName}
                  onChange={(e) => setTeamLeaderName(e.target.value)}
                  placeholder="e.g. Alex Rivera (STU-2026-081)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* Team Members List */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Team Members ({teamMembers.length} enrolled)
              </label>

              {/* Member chips */}
              <div className="flex flex-wrap gap-2 mb-2">
                {teamMembers.map((member, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-mono"
                  >
                    <span>{member}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="text-purple-400 hover:text-red-400 transition-colors"
                      title="Remove member"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add member input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMemberInput}
                  onChange={(e) => setNewMemberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                  placeholder="Add member name & ID (e.g. Lin Zhao (STU-2026-140))"
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project Scope / Purpose
              </label>
              <input
                type="text"
                value={teamNotes}
                onChange={(e) => setTeamNotes(e.target.value)}
                placeholder="e.g. Capstone Project: Autonomous Terrain Rover"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        )}

        {/* Daily Booking Time Limit Telemetry */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          !dailyLimitStatus.allowed
            ? "bg-rose-950/40 border-rose-500/50 text-rose-200"
            : "bg-slate-900/90 border-cyan-500/30 text-slate-300"
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${!dailyLimitStatus.allowed ? "text-rose-400" : "text-cyan-400"}`} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                Daily Booking Limit Quota
              </span>
            </div>
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
              !dailyLimitStatus.allowed
                ? "bg-rose-900/60 text-rose-300 border-rose-500/40 font-bold animate-pulse"
                : "bg-cyan-950/60 text-cyan-300 border-cyan-500/40"
            }`}>
              {dailyLimitStatus.allowed ? "WITHIN DAILY LIMIT" : "DAILY LIMIT EXCEEDED"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center mb-3">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
              <div className="text-[10px] font-mono text-slate-400">Daily Allowed</div>
              <div className="text-sm font-mono font-black text-white">{DAILY_LIMIT_HOURS}.0h</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
              <div className="text-[10px] font-mono text-slate-400">Already Used</div>
              <div className="text-sm font-mono font-bold text-amber-300">{dailyLimitStatus.usedHours}h</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5">
              <div className="text-[10px] font-mono text-slate-400">This Request</div>
              <div className={`text-sm font-mono font-bold ${!dailyLimitStatus.allowed ? "text-rose-400" : "text-cyan-300"}`}>
                {dailyLimitStatus.requestedHours}h
              </div>
            </div>
            <div className={`p-2 rounded-xl border ${
              dailyLimitStatus.remainingHours > 0
                ? "bg-emerald-950/40 border-emerald-500/30"
                : "bg-rose-950/40 border-rose-500/30"
            }`}>
              <div className="text-[10px] font-mono text-slate-400">Remaining Available</div>
              <div className={`text-sm font-mono font-black ${
                dailyLimitStatus.remainingHours > 0 ? "text-emerald-400" : "text-rose-400"
              }`}>
                {dailyLimitStatus.remainingHours}h
              </div>
            </div>
          </div>

          {/* Quota Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5 mb-2">
            <div
              className={`h-full transition-all duration-300 ${
                !dailyLimitStatus.allowed
                  ? "bg-gradient-to-r from-amber-500 to-rose-500"
                  : "bg-gradient-to-r from-cyan-500 to-emerald-400"
              }`}
              style={{
                width: `${Math.min(100, ((dailyLimitStatus.usedHours + dailyLimitStatus.requestedHours) / DAILY_LIMIT_HOURS) * 100)}%`,
              }}
            />
          </div>

          {!dailyLimitStatus.allowed && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{dailyLimitStatus.message}</span>
            </div>
          )}
        </div>

        {/* Start and End Times */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">
              4. Start Time
            </label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={Boolean(conflictAlert?.message) || !dailyLimitStatus.allowed || submitting || departmentEquipment.length === 0}
          className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            conflictAlert?.message || !dailyLimitStatus.allowed || submitting || departmentEquipment.length === 0
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
              : regMode === "TEAM"
              ? "bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] hover:scale-[1.01]"
              : "bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:scale-[1.01]"
          }`}
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Confirming {regMode === "TEAM" ? "Team" : "Individual"} Registration...</span>
            </>
          ) : !dailyLimitStatus.allowed ? (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Daily Limit Exceeded ({dailyLimitStatus.remainingHours}h Available Today)</span>
            </>
          ) : (
            <>
              <span>Confirm {regMode === "TEAM" ? "Team Registration" : "Individual Registration"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="text-white text-center py-20 font-mono">Loading reservation interface...</div>}>
          <BookingForm />
        </Suspense>
      </main>
    </div>
  );
}
