"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Cpu,
  QrCode,
  Calendar,
  Clock,
  ArrowLeft,
  Activity,
  MapPin,
  Zap,
} from "lucide-react";
import { fetchEquipment } from "@/lib/api";

import QRCode from "qrcode";

function CatalogDetailContent() {
  const params = useParams();
  const id = params?.id;
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await fetchEquipment();
        const found = list.find((e) => e.id === id) || list[0];
        setEquipment(found);

        if (found) {
          const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
          const url = await QRCode.toDataURL(`${origin}/catalog/${found.id}`, {
            width: 200,
            margin: 1,
            color: { dark: "#030712", light: "#ffffff" },
          });
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading || !equipment) {
    return (
      <div className="text-white text-center py-20 font-mono">
        Loading equipment...
      </div>
    );
  }

  const qrString = `EQUIPX://${equipment.id}`;

  return (
    <>
      <Link
        href="/catalog"
        className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO CATALOG</span>
      </Link>

      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/30 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                {equipment.id}
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold">
                Available: {equipment.quantity}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {equipment.name}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-4 bg-slate-900/80 border border-white/10 p-5 rounded-2xl shrink-0">
            <div className="relative w-36 h-36 bg-white p-2 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${equipment.name}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-full h-full text-slate-950" />
              )}
              <div className="absolute inset-0 border-2 border-cyan-500/40 rounded-xl pointer-events-none" />
            </div>

            <div className="text-center">
              <div className="text-xs font-mono text-cyan-300 font-semibold">{qrString}</div>
            </div>

            <Link
              href={`/booking?equipmentId=${equipment.id}`}
              className="w-full py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-95 text-white font-semibold text-xs text-center shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Equipment</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CatalogDetailPage() {
  const [role, setRole] = useState("USER");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={role} setRole={setRole} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<div className="text-white text-center py-20 font-mono">Loading telemetry...</div>}>
          <CatalogDetailContent />
        </Suspense>
      </main>
    </div>
  );
}
