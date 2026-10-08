"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import QRCode from "qrcode";
import {
  QrCode,
  Scan,
  ShieldCheck,
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Camera,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { INITIAL_EQUIPMENT } from "@/lib/data";
import { fetchEquipment } from "@/lib/api";

export default function QRScannerPage() {
  const [role, setRole] = useState("USER");
  const [equipmentList, setEquipmentList] = useState(INITIAL_EQUIPMENT);
  const [activeEquipment, setActiveEquipment] = useState(INITIAL_EQUIPMENT[0]);
  const [scannedCode, setScannedCode] = useState(INITIAL_EQUIPMENT[0]?.id || "EQ-1");
  const [verifiedItem, setVerifiedItem] = useState(INITIAL_EQUIPMENT[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  // Load equipment from API to ensure sync with database items
  useEffect(() => {
    async function load() {
      try {
        const list = await fetchEquipment();
        if (list && list.length > 0) {
          setEquipmentList(list);
          setActiveEquipment(list[0]);
          setScannedCode(list[0].id);
          setVerifiedItem(list[0]);
        }
      } catch (err) {
        console.warn("Using default equipment dataset for QR scanner:", err.message);
      }
    }
    load();
  }, []);

  // Generate real, functional, scannable QR code for the active equipment
  useEffect(() => {
    if (!activeEquipment) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const payload = `${origin}/catalog/${activeEquipment.id}`;

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: {
        dark: "#030712",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [activeEquipment]);

  const handleSimulateScan = (tagOrId) => {
    setIsScanning(true);
    setScannedCode(tagOrId);

    const matched =
      equipmentList.find(
        (eq) =>
          eq.id.toLowerCase() === tagOrId.toLowerCase() ||
          (eq.qrCode && eq.qrCode.toLowerCase() === tagOrId.toLowerCase()) ||
          (eq.name && eq.name.toLowerCase().includes(tagOrId.toLowerCase()))
      ) ||
      INITIAL_EQUIPMENT.find(
        (eq) =>
          eq.id.toLowerCase() === tagOrId.toLowerCase() ||
          (eq.qrCode && eq.qrCode.toLowerCase() === tagOrId.toLowerCase())
      );

    if (matched) {
      setActiveEquipment(matched);
    }

    setTimeout(() => {
      setIsScanning(false);
      setVerifiedItem(matched || null);
    }, 900);
  };

  const handleManualInput = (e) => {
    e.preventDefault();
    if (!scannedCode) return;
    handleSimulateScan(scannedCode);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={role} setRole={setRole} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tight">
            QR Scanner
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Scanner Viewport */}
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/30">
            {/* Viewfinder */}
            <div className="relative w-full aspect-square max-w-md mx-auto rounded-2xl bg-slate-950 border-2 border-dashed border-cyan-500/30 p-6 flex flex-col items-center justify-center overflow-hidden">
              {/* Corner Reticles */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-cyan-400 z-10" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-cyan-400 z-10" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-cyan-400 z-10" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-cyan-400 z-10" />

              {/* Animated Laser Scanning Beam */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#06b6d4] animate-bounce z-20 pointer-events-none" />
              )}

              {/* Real Scannable QR Code */}
              {qrDataUrl ? (
                <div className="relative p-3.5 bg-white rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.35)] transition-all duration-300 flex flex-col items-center">
                  <img
                    src={qrDataUrl}
                    alt={`Real Scannable QR code for ${activeEquipment?.name || "Equipment"}`}
                    className={`w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg transition-transform duration-300 ${
                      isScanning ? "scale-105" : "hover:scale-102"
                    }`}
                  />
                  <div className="absolute -bottom-3 inset-x-0 flex justify-center">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-950 border border-cyan-500/50 text-cyan-300 font-bold shadow-md">
                      {activeEquipment?.id}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-52 h-52 flex items-center justify-center text-slate-500 font-mono text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                </div>
              )}
            </div>

            {/* Quick Select Tags */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="text-xs font-mono text-slate-400 mb-2">
                Quick Select:
              </div>
              <div className="flex flex-wrap gap-2">
                {equipmentList.map((eq) => (
                  <button
                    key={eq.id}
                    onClick={() => handleSimulateScan(eq.id)}
                    disabled={isScanning}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                      activeEquipment?.id === eq.id
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                        : "bg-slate-900 border-white/10 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-300"
                    }`}
                  >
                    {eq.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Entry */}
            <form onSubmit={handleManualInput} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Or paste QR tag / ID..."
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400 font-sans"
              />
              <button
                type="submit"
                disabled={isScanning}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold"
              >
                Scan
              </button>
            </form>
          </div>

          {/* Verification Results Panel */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Equipment Details</span>
            </h3>

            {isScanning ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
                <p className="text-xs font-mono">Verifying QR code...</p>
              </div>
            ) : verifiedItem ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-emerald-300 font-mono">
                      Verified Equipment
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5 font-mono">
                      {verifiedItem.qrCode}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">ID:</span>
                    <span className="text-white font-mono font-bold">{verifiedItem.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Name:</span>
                    <span className="text-white font-semibold">{verifiedItem.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Category:</span>
                    <span className="text-slate-200">{verifiedItem.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Status:</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                        verifiedItem.status === "AVAILABLE"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                          : "bg-purple-950 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {verifiedItem.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Location:</span>
                    <span className="text-slate-200">{verifiedItem.location || verifiedItem.lab || "Main Lab"}</span>
                  </div>
                </div>

                {/* Quick action buttons for the verified equipment */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/booking?equipmentId=${verifiedItem.id}`}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold text-xs text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:opacity-95"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book Slot</span>
                  </Link>

                  <Link
                    href={`/catalog/${verifiedItem.id}`}
                    className="flex-1 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white font-semibold text-xs text-center flex items-center justify-center gap-2"
                  >
                    <Cpu className="w-4 h-4" />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 rounded-2xl bg-slate-900/40 border border-white/5">
                <QrCode className="w-12 h-12 mx-auto mb-2 text-slate-700" />
                <p className="text-sm text-slate-400 font-medium">No Equipment Tag Scanned</p>
                <p className="text-xs text-slate-600 mt-1">
                  Point sensor at a tag or select a sample node on the left.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
