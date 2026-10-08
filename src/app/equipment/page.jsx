"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  Cpu,
  Search,
  Filter,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  RefreshCw,
  Plus,
  CheckCircle2,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { fetchEquipment, addEquipment } from "@/lib/api";

export default function EquipmentPage() {
  const [role, setRole] = useState("STUDENT");
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("CSE");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [newDept, setNewDept] = useState("CSE");

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await fetchEquipment();
      setEquipmentList(list || []);
    } catch (err) {
      console.error("Failed to load equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName) return;
    try {
      await addEquipment({
        name: newName,
        quantity: Number(newQuantity),
        department: newDept,
      });
      setShowAddModal(false);
      setNewName("");
      setNewQuantity(1);
      loadData();
    } catch (err) {
      alert("Failed to create equipment: " + err.message);
    }
  };

  const departments = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "ALL"];

  const filteredEquipment = equipmentList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      (item.department && item.department.toLowerCase().includes(search.toLowerCase()));

    const matchesDept = selectedDept === "ALL" || item.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Equipment Catalog
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-cyan-400 transition-colors"
              title="Refresh inventory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Equipment</span>
            </button>

            <Link
              href="/booking"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Slot</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-panel rounded-2xl p-5 mb-8 border border-white/10 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by equipment name, node ID, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/60 font-mono"
              />
            </div>

            {/* Department Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    selectedDept === dept
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-semibold"
                      : "text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-white/5"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Equipment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((eq) => (
            <div
              key={eq.id}
              className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/10 group hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded bg-slate-800/80 text-cyan-400 border border-cyan-500/20">
                    {eq.id}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                    QTY: {eq.quantity}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {eq.name}
                </h3>

                <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Department</span>
                    <span className="text-slate-200">{eq.department || "General Lab"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Lab</span>
                    <span className="text-slate-200">{eq.lab || "Main Lab"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className="text-emerald-400 uppercase font-bold">
                      {eq.status || "available"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <Link
                  href={`/catalog/${eq.id}`}
                  className="flex-1 py-2 rounded-xl text-center text-xs font-semibold bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Passport & QR</span>
                </Link>

                <Link
                  href={`/booking?equipmentId=${eq.id}`}
                  className="px-4 py-2 rounded-xl text-center text-xs font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredEquipment.length === 0 && !loading && (
          <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 max-w-md mx-auto my-12">
            <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">No equipment matches found</p>
            <p className="text-xs mt-1">Try searching another keyword or clear filters.</p>
          </div>
        )}

        {/* Add Equipment Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 max-w-md w-full border border-purple-500/40">
              <h3 className="text-xl font-bold text-white mb-4">Add Equipment</h3>
              <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Equipment Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Laser Metrology Array"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-sans"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold"
                  >
                    Save
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
