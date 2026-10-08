"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Cpu,
  Layers,
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  Scan,
} from "lucide-react";

export default function CinematicHero() {
  const [currentStage, setCurrentStage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const stages = [
    {
      id: "equipment",
      title: "Equipment Awakening",
      subtitle: "Hardware node materialized & telemetry synced",
      badge: "STEP 1 // EQUIPMENT",
    },
    {
      id: "holographic",
      title: "Holographic Data Matrix",
      subtitle: "Sensor arrays & maintenance telemetry projected",
      badge: "STEP 2 // HOLOGRAPHIC DATA",
    },
    {
      id: "qr",
      title: "Cryptographic QR Scan",
      subtitle: "Unique hardware identity verified on-chain",
      badge: "STEP 3 // QR VERIFICATION",
    },
    {
      id: "aurora",
      title: "Aurora Resonance Flow",
      subtitle: "Dynamic energy mesh syncing reservation pipelines",
      badge: "STEP 4 // AURORA FLOW",
    },
    {
      id: "logo",
      title: "EquipX Nexus",
      subtitle: "Where Every Equipment Has a Journey",
      badge: "STEP 5 // EQUIPX LAUNCH",
    },
  ];

  // Auto-advance through cinematic stages
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % stages.length);
    }, 4200);
    return () => clearInterval(interval);
  }, [isAutoPlaying, stages.length]);

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden py-12">
      {/* Dynamic Background Light Bursts based on Stage */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${
          currentStage === 0
            ? "bg-radial-[at_50%_40%] from-cyan-950/40 to-transparent"
            : currentStage === 1
            ? "bg-radial-[at_50%_40%] from-purple-950/40 to-transparent"
            : currentStage === 2
            ? "bg-radial-[at_50%_40%] from-emerald-950/30 to-transparent"
            : currentStage === 3
            ? "bg-radial-[at_50%_40%] from-pink-950/40 via-purple-950/30 to-transparent"
            : "bg-radial-[at_50%_40%] from-cyan-900/30 via-purple-900/40 to-transparent"
        }`}
      />

      {/* Stage Progress Pills */}
      <div className="relative z-20 flex items-center gap-2 mb-8 bg-slate-900/80 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-xl">
        {stages.map((stage, idx) => (
          <button
            key={stage.id}
            onClick={() => {
              setCurrentStage(idx);
              setIsAutoPlaying(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all ${
              currentStage === idx
                ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] font-semibold"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <span>0{idx + 1}</span>
            <span className="hidden md:inline">{stage.id.toUpperCase()}</span>
          </button>
        ))}

        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          title={isAutoPlaying ? "Pause autoplay" : "Resume autoplay"}
          className="ml-2 p-1 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          {isAutoPlaying ? <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Interactive Cinematic Display Chamber */}
      <div className="relative z-20 w-full max-w-4xl h-[380px] sm:h-[420px] rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl p-6 sm:p-10 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_80px_-20px_rgba(6,182,212,0.25)]">
        {/* Hologram Scan Line */}
        <div className="hologram-line" />

        {/* Corner Cyber Accents */}
        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60" />
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60" />
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-purple-400/60" />
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-purple-400/60" />

        {/* STAGE 1: EQUIPMENT */}
        {currentStage === 0 && (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-slate-800 to-purple-500/20 border-2 border-cyan-400/50 flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.4)] animate-pulse">
                <Cpu className="w-14 h-14 text-cyan-300" />
              </div>
              <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-cyan-500 text-[10px] font-mono text-black font-bold">
                ONLINE
              </span>
            </div>
            <div className="inline-block px-3 py-1 mb-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              STAGE 1 // PHYSICAL ASSET ENGAGED
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Quantum Hardware Unit #EQ-8849
            </h3>
            <p className="text-slate-400 text-sm max-w-md mt-2">
              Next-generation laboratory rig initialized. State telemetry broadcasting at 60 Hz.
            </p>
          </div>
        )}

        {/* STAGE 2: HOLOGRAPHIC DATA */}
        {currentStage === 1 && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
            <div className="inline-block px-3 py-1 mb-4 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
              STAGE 2 // HOLOGRAPHIC TELEMETRY STREAM
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-lg mb-4">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-center">
                <div className="text-[10px] font-mono text-purple-300">HEALTH MATRIX</div>
                <div className="text-xl font-bold text-white mt-1">99.4%</div>
                <div className="text-[9px] text-emerald-400 font-mono">OPTIMAL</div>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-center">
                <div className="text-[10px] font-mono text-purple-300">CALIBRATION</div>
                <div className="text-xl font-bold text-white mt-1">2.4 GHz</div>
                <div className="text-[9px] text-cyan-400 font-mono">LOCKED</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-center">
                <div className="text-[10px] font-mono text-purple-300">JOURNEY STAGE</div>
                <div className="text-xl font-bold text-cyan-300 mt-1">AVAILABLE</div>
                <div className="text-[9px] text-slate-400 font-mono">BAY 04-A</div>
              </div>
            </div>

            <div className="w-full max-w-lg bg-slate-900/60 rounded-lg p-2.5 border border-white/5 font-mono text-[11px] text-cyan-400/90 flex justify-between items-center">
              <span>HOLO_STREAM // [SYNCED]</span>
              <span className="text-purple-400">LATENCY: 1.2ms</span>
              <span className="text-emerald-400">CHECKSUM: 0x9AFE</span>
            </div>
          </div>
        )}

        {/* STAGE 3: QR SCAN */}
        {currentStage === 2 && (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative mb-4 group">
              <div className="w-32 h-32 rounded-2xl bg-slate-900 border-2 border-emerald-400/60 p-3 relative flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                <QrCode className="w-20 h-20 text-emerald-400" />
                {/* Visual Laser Scanner Beam */}
                <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> VERIFIED
              </div>
            </div>

            <div className="inline-block px-3 py-1 mb-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              STAGE 3 // CRYPTOGRAPHIC QR VERIFICATION
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Instant Equipment Authentication
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mt-1">
              Scan QR to unlock equipment journey logs, check-out status, and instant return audits.
            </p>
          </div>
        )}

        {/* STAGE 4: AURORA FLOW */}
        {currentStage === 3 && (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-36 h-36 mb-4 flex items-center justify-center">
              {/* Concentric Aurora Rings */}
              <div className="absolute inset-0 rounded-full border border-pink-500/40 animate-ping opacity-30" />
              <div className="absolute inset-2 rounded-full border-2 border-purple-500/50 animate-spin duration-1000" />
              <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-cyan-500/30 via-purple-600/40 to-pink-500/40 blur-md" />
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-slate-900 border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.5)]">
                <Sparkles className="w-8 h-8 text-pink-300 animate-pulse" />
              </div>
            </div>

            <div className="inline-block px-3 py-1 mb-2 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono">
              STAGE 4 // AURORA RESONANCE WAVE
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Dynamic Booking Symphony
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mt-1">
              Deterministic collision prevention engine guaranteeing zero reservation clashes.
            </p>
          </div>
        )}

        {/* STAGE 5: EQUIPX LOGO */}
        {currentStage === 4 && (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 via-purple-600 to-pink-500 p-0.5 shadow-[0_0_50px_rgba(139,92,246,0.6)]">
                <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                  <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-400">
                    X
                  </span>
                </div>
              </div>
            </div>

            <div className="inline-block px-3 py-1 mb-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              STAGE 5 // THE FINAL DESTINATION
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              EQUIP<span className="text-cyan-400">X</span>
            </h2>

            <p className="italic text-sm sm:text-base text-purple-200/90 mt-1">
              &ldquo;Where Every Equipment Has a Journey.&rdquo;
            </p>

            {/* Book • Track • Verify • Return Pill Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold text-cyan-300">
              <span className="px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                Book
              </span>
              <span className="text-purple-400">•</span>
              <span className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30">
                Track
              </span>
              <span className="text-purple-400">•</span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                Verify
              </span>
              <span className="text-purple-400">•</span>
              <span className="px-3 py-1 rounded-full bg-pink-950/60 border border-pink-500/30 text-pink-300">
                Return
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Hero Header & Direct Call To Action */}
      <div className="relative z-20 text-center mt-10 max-w-3xl">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-500">
            EquipX
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-300 mt-3 font-light">
          <span className="italic text-cyan-300">&ldquo;Where Every Equipment Has a Journey.&rdquo;</span>
        </p>

        <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
          The next-generation equipment ecosystem. Deterministic conflict-free reservations, cryptographic QR identification, and continuous lifecycle tracking.
        </p>

        {/* Essential Action Button: Enter EquipX */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 text-white shadow-[0_0_35px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.7)] transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span>Enter EquipX</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>

          <Link
            href="/scanner"
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-medium text-sm text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/40 hover:text-white transition-all backdrop-blur-xl"
          >
            <QrCode className="w-4 h-4 text-cyan-400" />
            <span>Quick QR Scan</span>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Deterministic Conflict Detection</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-purple-400" />
            <span>PostgreSQL & Prisma Ready</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Locked OpenAPI Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
