"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Tag,
  Plus,
  Trash2,
  Edit,
  Sparkles,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/api";

export default function CalendarPage() {
  const [role, setRole] = useState("STUDENT");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("ALL");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("2026-10-14T09:00");
  const [end, setEnd] = useState("2026-10-14T11:00");
  const [venue, setVenue] = useState("");
  const [category, setCategory] = useState("WORKSHOP");
  const [allDay, setAllDay] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchCalendarEvents();
      setEvents(data || []);
    } catch (err) {
      console.error("Failed to load calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setStart("2026-10-14T09:00");
    setEnd("2026-10-14T11:00");
    setVenue("");
    setCategory("WORKSHOP");
    setAllDay(false);
    setShowModal(true);
  };

  const openEditModal = (evt) => {
    setEditingEventId(evt.id);
    setTitle(evt.title);
    setDescription(evt.description || "");
    setStart(evt.start ? evt.start.slice(0, 16) : "");
    setEnd(evt.end ? evt.end.slice(0, 16) : "");
    setVenue(evt.venue || "");
    setCategory(evt.category || "GENERAL");
    setAllDay(Boolean(evt.all_day));
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        venue,
        category,
        all_day: allDay,
      };

      if (editingEventId) {
        // PUT /calendar/events/{eventId}
        await updateCalendarEvent(editingEventId, payload);
      } else {
        // POST /calendar/events
        await createCalendarEvent(payload);
      }

      setShowModal(false);
      loadEvents();
    } catch (err) {
      alert("Failed to save event: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this calendar event?")) {
      try {
        // DELETE /calendar/events/{eventId}
        await deleteCalendarEvent(id);
        loadEvents();
      } catch (err) {
        alert("Failed to delete event: " + err.message);
      }
    }
  };

  const categories = ["ALL", "ORIENTATION", "MAINTENANCE", "WORKSHOP", "GENERAL"];

  const filtered = events.filter((e) =>
    filterCategory === "ALL" ? true : e.category === filterCategory
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={role} setRole={setRole} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Calendar
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadEvents}
              className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-cyan-400 transition-colors"
              title="Refresh events"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filterCategory === c
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] font-semibold"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((evt) => (
            <div
              key={evt.id}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/10 hover:border-cyan-500/40 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30 font-semibold">
                    {evt.category || "GENERAL"}
                  </span>
                  {evt.all_day && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                      ALL DAY
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-500">{evt.id}</span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {evt.title}
                </h3>

                {evt.description && (
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                    {evt.description}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {new Date(evt.start).toLocaleString()} &rarr;{" "}
                      {new Date(evt.end).toLocaleTimeString()}
                    </span>
                  </div>
                  {evt.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-pink-400" />
                      <span>{evt.venue}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(evt)}
                  className="p-2 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 transition-colors"
                  title="Edit event"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(evt.id)}
                  className="p-2 rounded-lg bg-slate-900 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-400 transition-colors"
                  title="Delete event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 col-span-full">
              <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white">No calendar events found</p>
              <p className="text-xs text-slate-400 mt-1">Create an event using the button above.</p>
            </div>
          )}
        </div>

        {/* Modal: Add / Edit Calendar Event */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-cyan-500/40">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-cyan-400" />
                  <span>{editingEventId ? "Edit Event" : "Create Event"}</span>
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Cryogenic Analysis Seminar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Event objectives and notes..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Venue</label>
                    <input
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      placeholder="e.g. Room 402 / Quantum Vault"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
                    >
                      <option value="WORKSHOP">Workshop</option>
                      <option value="ORIENTATION">Orientation</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="GENERAL">General</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="allDayCheckbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                  <label htmlFor="allDayCheckbox" className="text-slate-300 cursor-pointer font-sans">
                    All-Day Event
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:opacity-95"
                  >
                    {editingEventId ? "Save Changes" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
