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
} from "lucide-react";
import { fetchEquipment, addEquipment } from "@/lib/api";

export default function EquipmentCatalogPage() {
  const [role, setRole] = useState("USER");
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);

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
      await addEquipment({ name: newName, quantity: Number(newQuantity) });
      setShowAddModal(false);
      setNewName("");
      setNewQuantity(1);
      loadData();
    } catch (err) {
      alert("Failed to create equipment: " + err.message);
    }
  };

  const filteredEquipment = equipmentList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={role} setRole={setRole} />

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
              title="Refresh database records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            {role === "ADMIN" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:opacity-95 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Equipment</span>
              </button>
            )}

            <Link
              href="/booking"
              className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Slot</span>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 mb-8 border border-white/10">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by equipment name or node ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/60 font-mono"
            />
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
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                    QTY: {eq.quantity}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {eq.name}
                </h3>

                <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">QR PASSPORT:</span>
                    <span className="text-cyan-400 font-semibold">EQUIPX://{eq.id}</span>
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
                  <span>Reserve</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredEquipment.length === 0 && !loading && (
          <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 max-w-md mx-auto my-12">
            <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">No equipment matches found</p>
          </div>
        )}

        {/* Add Equipment Modal (Admin) */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 max-w-md w-full border border-purple-500/40">
              <h3 className="text-lg font-bold text-white mb-4">Add Equipment (POST /equipment)</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">EQUIPMENT NAME</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Laser Interferometer X4"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">QUANTITY</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold"
                  >
                    Create
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
