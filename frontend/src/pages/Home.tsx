import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, cubicBezier, type Variants } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Zap,
  FileText,
  CheckCircle2,
  Clock,
  Bell,
  Users,
  ChevronRight,
  BarChart3,
  Layers,
  Lock,
  TrendingUp,
  Activity,
  Sparkles,
  Globe,
  Database,
} from "lucide-react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const EASE_SPRING = cubicBezier(0.16, 1, 0.3, 1);

const STAGGER_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 48, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_SPRING },
  },
};

// ─── NOISE TEXTURE ────────────────────────────────────────────────────────────

function NoiseTexture() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none" aria-hidden="true">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_SPRING }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? "bg-[#080B14]/90 backdrop-blur-2xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 h-[68px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F6EF7] to-[#7C3AED] flex items-center justify-center shadow-[0_0_20px_rgba(79,110,247,0.4)]">
            <Layers className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-bold text-white tracking-[-0.02em] text-[1.05rem]">
            Digi<span className="text-[#4F6EF7]">Desa</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {["Layanan", "Statistik", "Pengumuman", "Bantuan"].map((item) => (
            <button
              key={item}
              type="button"
              className="text-[13px] font-medium text-white/50 hover:text-white/90 px-4 py-2 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden sm:block text-[13px] font-medium text-white/50 hover:text-white/90 px-4 py-2 rounded-lg hover:bg-white/[0.06] transition-all">
            Masuk
          </button>
          <motion.button
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="text-[13px] font-semibold text-white bg-[#4F6EF7] hover:bg-[#3D5CE8] px-5 py-2.5 rounded-xl transition-all shadow-[0_4px_16px_rgba(79,110,247,0.35)]"
          >
            Portal RW/RT
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── GRID BACKGROUND ─────────────────────────────────────────────────────────

function GridBg() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "72px 72px",
        maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)",
      }}
    />
  );
}

// ─── AURORA ───────────────────────────────────────────────────────────────────

function Aurora() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.24, 0.18] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[20%] left-[10%] w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, #4F6EF7 0%, transparent 70%)", filter: "blur(80px)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.18, 0.12] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute -top-[10%] right-[5%] w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)", filter: "blur(90px)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        className="absolute top-[30%] left-[60%] w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, #06B6D4 0%, transparent 70%)", filter: "blur(100px)" }}
      />
    </div>
  );
}

// ─── FLOATING UI CARDS ────────────────────────────────────────────────────────

function ProgressBar({ value, delay = 0 }: Readonly<{ value: number; delay?: number }>) {
  return (
    <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.6, delay: 1 + delay, ease: EASE_SPRING }}
        className="h-full bg-gradient-to-r from-[#4F6EF7] to-[#7C3AED] rounded-full"
      />
    </div>
  );
}

function CardMainApplication() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48, x: -8 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: EASE_SPRING }}
      className="relative w-[340px] bg-[#0E1320]/90 backdrop-blur-2xl rounded-[20px] border border-white/[0.08] shadow-[0_24px_80px_rgba(0,0,0,0.6)] p-5 z-20"
      style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-widest">Diproses</span>
          </div>
          <h4 className="text-[13px] font-bold text-white/90 leading-snug">Surat Keterangan Domisili</h4>
          <p className="text-[11px] text-white/30 mt-0.5 font-mono">SKD-2026-00841</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#4F6EF7]/15 border border-[#4F6EF7]/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-[#4F6EF7]" />
        </div>
      </div>

      <div className="h-px bg-white/[0.05] mb-5" />

      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
          <div className="w-8 h-8 rounded-xl bg-[#4F6EF7]/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-[#4F6EF7]" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-white/30">Pemohon · RT 01/RW 10</p>
            <p className="text-[12px] font-bold text-white/80">Budi Santoso</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-white/30">Estimasi Selesai</p>
            <p className="text-[12px] font-bold text-white/80">Hari ini 14:00 WIB</p>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-white/40">Progress Verifikasi</p>
          <p className="text-[11px] font-bold text-[#4F6EF7]">65%</p>
        </div>
        <ProgressBar value={65} />
      </div>

      <div className="flex items-center gap-1.5">
        {["Terima", "Verifikasi", "TTD", "Selesai"].map((step, i) => {
          const isDone = i < 2;
          const isCurrent = i === 2;

          let circleClass = "bg-white/[0.06] border border-white/10";
          if (isDone) {
            circleClass = "bg-[#4F6EF7] shadow-[0_0_8px_rgba(79,110,247,0.5)]";
          } else if (isCurrent) {
            circleClass = "bg-amber-400/30 border border-amber-400/50";
          }

          return (
            <div key={step} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${circleClass}`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                  )}
                </div>
                <p className="text-[9px] font-bold text-white/30 text-center">{step}</p>
              </div>
              {i < 3 && (
                <div
                  className={`h-px flex-1 mb-4 mx-1 ${i < 1 ? "bg-[#4F6EF7]/40" : "bg-white/[0.06]"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function CardStats() {
  const stats = [
    { label: "Warga Terdaftar", value: "4.821", delta: "+12", icon: Users },
    { label: "Pengajuan Aktif", value: "138", delta: "23 pending", icon: FileText },
    { label: "Completion Rate", value: "96.4%", delta: "↑ 2.1%", icon: TrendingUp },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, x: -20, rotate: 0 }}
      animate={{ opacity: 1, y: 0, x: 0, rotate: -3 }}
      transition={{ duration: 1, delay: 0.3, ease: EASE_SPRING }}
      className="absolute -left-10 top-4 w-[260px] bg-[#0C1019]/95 backdrop-blur-2xl rounded-[18px] border border-white/[0.07] p-5 z-10"
      style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-[#4F6EF7]/15 flex items-center justify-center">
          <BarChart3 className="w-3.5 h-3.5 text-[#4F6EF7]" />
        </div>
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Analytics</span>
        <span className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-bold text-emerald-400">Live</span>
        </span>
      </div>
      <div className="space-y-3">
        {stats.map(({ label, value, delta, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-white/40" />
              </div>
              <div>
                <p className="text-[10px] font-medium text-white/30 leading-none mb-1">{label}</p>
                <p className="text-[13px] font-bold text-white/90 leading-none">{value}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-lg">
              {delta}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function CardNotification() {
  const items = [
    {
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
      text: "SK Usaha Dewi R. diterbitkan",
      time: "2m lalu",
    },
    {
      icon: Bell,
      color: "text-[#4F6EF7]",
      bg: "bg-[#4F6EF7]/10",
      border: "border-[#4F6EF7]/20",
      text: "3 pengajuan baru butuh verifikasi",
      time: "11m lalu",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 32, y: 16 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.9, delay: 0.7, ease: EASE_SPRING }}
      className="absolute -right-8 bottom-8 w-[240px] bg-[#0C1019]/95 backdrop-blur-2xl rounded-[16px] border border-white/[0.07] p-4 z-30"
      style={{ boxShadow: "0 16px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)" }}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <Activity className="w-3.5 h-3.5 text-white/30" />
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Aktivitas</span>
        <span className="ml-auto text-[9px] font-bold text-white bg-[#4F6EF7] px-1.5 py-0.5 rounded-md">2 baru</span>
      </div>
      <div className="space-y-2.5">
        {items.map(({ icon: Icon, color, bg, border, text, time }) => (
          <div key={text} className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${border} ${bg}`}>
            <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0 mt-0.5`} />
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-white/70 leading-tight">{text}</p>
              <p className="text-[10px] font-semibold text-white/30 mt-0.5">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SecurityBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.5, ease: EASE_SPRING }}
      className="absolute top-0 right-8 bg-[#0C1019]/95 backdrop-blur-xl border border-white/[0.07] rounded-xl px-3 py-2 z-40 flex items-center gap-2"
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)" }}
    >
      <div className="w-4 h-4 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center">
        <Lock className="w-2.5 h-2.5 text-emerald-400" />
      </div>
      <span className="text-[11px] font-bold text-white/70">Encrypted · TLS 1.3</span>
    </motion.div>
  );
}

function FloatingCards() {
  return (
    <div className="relative w-full h-full min-h-[580px] flex items-center justify-center">
      <CardStats />
      <div className="relative z-20 mt-8">
        <CardMainApplication />
      </div>
      <CardNotification />
      <SecurityBadge />
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────────────────

function AnnouncementBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_SPRING }}
      className="inline-flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.1] rounded-full px-4 py-2 mb-8 hover:bg-white/[0.06] transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#4F6EF7]" />
        <span className="text-[11px] font-bold text-[#4F6EF7] uppercase tracking-widest">Baru</span>
      </div>
      <div className="w-px h-3.5 bg-white/[0.1]" />
      <span className="text-[12px] font-medium text-white/60">
        Integrasi sistem kependudukan v2.0 telah tersedia
      </span>
      <ChevronRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
    </motion.div>
  );
}

// ─── TRUST STRIP ──────────────────────────────────────────────────────────────

function TrustStrip() {
  const items = [
    { icon: Shield, label: "SOC 2 Compliant" },
    { icon: Lock, label: "End-to-End Encrypted" },
    { icon: Globe, label: "99.9% Uptime SLA" },
    { icon: Database, label: "Data Sovereignty" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.1, duration: 0.8 }}
      className="mt-16 pt-10 border-t border-white/[0.06]"
    >
      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em] mb-6">
        Infrastruktur Berstandar Enterprise
      </p>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors">
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[12px] font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-[68px] bg-[#080B14]">
      <NoiseTexture />
      <GridBg />
      <Aurora />

      <div className="max-w-7xl mx-auto px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[56fr_44fr] gap-16 items-center min-h-[calc(100vh-68px)] py-24">
          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.div variants={FADE_UP}>
              <AnnouncementBadge />
            </motion.div>

            <motion.div variants={FADE_UP} className="mb-8">
              <h1
                className="text-[3.6rem] sm:text-[4.5rem] lg:text-[5.2rem] font-extrabold leading-[0.95] tracking-[-0.04em] text-white"
                style={{ fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif" }}
              >
                <span className="block">Birokrasi</span>
                <span className="block">Desa Masuk</span>
                <span
                  className="block"
                  style={{
                    background: "linear-gradient(135deg, #4F6EF7 0%, #7C3AED 40%, #06B6D4 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Era Digital.
                </span>
              </h1>
            </motion.div>

            <motion.p
              variants={FADE_UP}
              className="text-[1.05rem] text-white/45 leading-[1.75] max-w-lg mb-10 font-medium"
            >
              DigiDesa menyederhanakan administrasi menjadi pengalaman yang
              cepat, transparan, dan terstruktur — dari pengajuan surat warga
              hingga persetujuan RT/RW, semua dalam satu platform terintegrasi.
            </motion.p>

            <motion.div variants={FADE_UP} className="flex flex-col sm:flex-row items-start gap-3 mb-6">
              <motion.button
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="group flex w-full sm:w-auto justify-center items-center gap-2.5 bg-[#4F6EF7] hover:bg-[#3D5CE8] text-white font-bold px-8 py-3.5 rounded-xl transition-all text-[14px] shadow-[0_0_32px_rgba(79,110,247,0.35)]"
              >
                Layanan Surat
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>

              <motion.button
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex w-full sm:w-auto justify-center items-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.07] text-white/70 hover:text-white font-semibold px-8 py-3.5 rounded-xl border border-white/[0.08] hover:border-white/[0.14] transition-all text-[14px]"
              >
                Lapor Warga
                <ChevronRight className="w-4 h-4 text-white/30" />
              </motion.button>
            </motion.div>

            <motion.div variants={FADE_UP} className="flex items-center gap-5">
              <div className="flex -space-x-2.5">
                {["BW", "SA", "MR", "DP"].map((initials, i) => (
                  <div
                    key={initials}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4F6EF7] to-[#7C3AED] border-2 border-[#080B14] flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ backgroundImage: `hue-rotate(${i * 40}deg)` }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-white/30 font-medium">
                <span className="text-white/60 font-bold">4.821+</span> warga aktif terdaftar
              </p>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 16 16">
                    <path d="M8 0l2 5h5l-4 3 1.5 5L8 10l-4.5 3L5 8 1 5h5z" />
                  </svg>
                ))}
                <span className="text-[11px] text-white/30 font-medium ml-1">4.9/5</span>
              </div>
            </motion.div>

            <TrustStrip />
          </motion.div>

          <div className="relative hidden lg:block">
            <FloatingCards />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── METRICS STRIP ────────────────────────────────────────────────────────────

function MetricsStrip() {
  const metrics = [
    { value: "4.821+", label: "Warga Terdaftar", icon: Users },
    { value: "98.7%", label: "Kepuasan Layanan", icon: TrendingUp },
    { value: "<2 jam", label: "Waktu Proses Rata-rata", icon: Clock },
    { value: "24/7", label: "Sistem Tersedia", icon: Activity },
  ];

  return (
    <div className="relative bg-[#0A0D17] border-y border-white/[0.05]">
      <NoiseTexture />
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map(({ value, label, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_SPRING }}
              className="text-center lg:text-left"
            >
              <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
                <div className="w-6 h-6 rounded-lg bg-[#4F6EF7]/10 border border-[#4F6EF7]/20 flex items-center justify-center">
                  <Icon className="w-3 h-3 text-[#4F6EF7]" />
                </div>
              </div>
              <p className="text-[2rem] font-extrabold text-white tracking-tight leading-none mb-1.5">
                {value}
              </p>
              <p className="text-[12px] font-medium text-white/35">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FEATURES SECTION ─────────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: "Pengajuan Surat Digital",
      desc: "Warga mengajukan dokumen kapan saja, proses persetujuan RT/RW berjalan otomatis tanpa antre.",
      color: "blue",
      tag: "Core",
    },
    {
      icon: Users,
      title: "Manajemen Terpusat",
      desc: "Data profil warga dan keluarga tersimpan rapi dan mudah diakses oleh perangkat berwenang.",
      color: "violet",
      tag: "Data",
    },
    {
      icon: BarChart3,
      title: "Dashboard Analytics",
      desc: "Statistik real-time mengenai pengajuan surat dan laporan masalah lingkungan sekitar.",
      color: "cyan",
      tag: "Insight",
    },
    {
      icon: Shield,
      title: "Zero-Trust Security",
      desc: "Autentikasi multi-layer dengan enkripsi end-to-end untuk keamanan data warga.",
      color: "green",
      tag: "Security",
    },
    {
      icon: Bell,
      title: "Push Notification",
      desc: "Notifikasi real-time ketika surat selesai diproses atau laporan ditindaklanjuti perangkat.",
      color: "amber",
      tag: "Automation",
    },
    {
      icon: Activity,
      title: "Transparansi Laporan",
      desc: "Pantau tindak lanjut perbaikan fasilitas desa dari laporan yang diajukan bersama warga.",
      color: "red",
      tag: "Civic",
    },
  ];

  const colorMap: Record<string, { icon: string; tag: string; border: string; glow: string; radial: string }> = {
    blue: {
      icon: "text-[#4F6EF7] bg-[#4F6EF7]/10 border-[#4F6EF7]/20",
      tag: "text-[#4F6EF7] bg-[#4F6EF7]/10",
      border: "hover:border-[#4F6EF7]/25",
      glow: "hover:shadow-[0_8px_40px_rgba(79,110,247,0.1)]",
      radial: "rgba(79,110,247,0.06)",
    },
    violet: {
      icon: "text-violet-400 bg-violet-400/10 border-violet-400/20",
      tag: "text-violet-400 bg-violet-400/10",
      border: "hover:border-violet-400/25",
      glow: "hover:shadow-[0_8px_40px_rgba(139,92,246,0.1)]",
      radial: "rgba(139,92,246,0.06)",
    },
    cyan: {
      icon: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
      tag: "text-cyan-400 bg-cyan-400/10",
      border: "hover:border-cyan-400/25",
      glow: "hover:shadow-[0_8px_40px_rgba(34,211,238,0.1)]",
      radial: "rgba(34,211,238,0.06)",
    },
    green: {
      icon: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      tag: "text-emerald-400 bg-emerald-400/10",
      border: "hover:border-emerald-400/25",
      glow: "hover:shadow-[0_8px_40px_rgba(52,211,153,0.1)]",
      radial: "rgba(52,211,153,0.06)",
    },
    amber: {
      icon: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      tag: "text-amber-400 bg-amber-400/10",
      border: "hover:border-amber-400/25",
      glow: "hover:shadow-[0_8px_40px_rgba(251,191,36,0.1)]",
      radial: "rgba(251,191,36,0.06)",
    },
    red: {
      icon: "text-rose-400 bg-rose-400/10 border-rose-400/20",
      tag: "text-rose-400 bg-rose-400/10",
      border: "hover:border-rose-400/25",
      glow: "hover:shadow-[0_8px_40px_rgba(251,113,133,0.1)]",
      radial: "rgba(251,113,133,0.06)",
    },
  };

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden bg-[#080B14]">
      <NoiseTexture />
      <motion.div
        style={{
          y,
          background: "radial-gradient(circle, rgba(79,110,247,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE_SPRING }}
          className="max-w-2xl mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-5 bg-[#4F6EF7]/10 border border-[#4F6EF7]/20 rounded-full px-4 py-1.5">
            <div className="w-1 h-1 rounded-full bg-[#4F6EF7] animate-pulse" />
            <span className="text-[11px] font-bold text-[#4F6EF7] uppercase tracking-widest">
              Platform Capabilities
            </span>
          </div>
          <h2 className="text-[2.8rem] md:text-[3.2rem] font-extrabold tracking-[-0.035em] leading-[1.05] text-white mb-5">
            Semua yang dibutuhkan{" "}
            <span className="text-white/25">untuk pengelolaan lingkungan modern.</span>
          </h2>
          <p className="text-[15px] text-white/40 font-medium leading-relaxed max-w-xl">
            Dirancang khusus agar pengurus RW dan RT dapat berkoordinasi dengan mudah melayani warga.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, color, tag }, i) => {
            const c = colorMap[color];
            return (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: EASE_SPRING }}
                whileHover={{ y: -4, transition: { duration: 0.25 } }}
                className={`group relative bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/[0.06] ${c.border} ${c.glow} p-7 cursor-pointer transition-all duration-300 overflow-hidden`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${c.radial} 0%, transparent 60%)`,
                  }}
                />
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl border ${c.icon} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg ${c.tag}`}>
                    {tag}
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-white/90 mb-2.5 leading-snug">{title}</h3>
                <p className="text-[13px] text-white/35 font-medium leading-relaxed">{desc}</p>
                <div className="mt-5 flex items-center gap-1.5 text-[12px] font-bold text-white/25 group-hover:text-white/50 transition-colors">
                  Pelajari selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── CTA SECTION ──────────────────────────────────────────────────────────────

function CtaSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-8 bg-[#080B14]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE_SPRING }}
          className="relative rounded-[28px] border border-white/[0.07] overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D1020 0%, #0F1428 50%, #0D1020 100%)" }}
        >
          <NoiseTexture />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,110,247,0.2) 0%, transparent 60%)",
            }}
          />
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 100%, rgba(124,58,237,0.1) 0%, transparent 70%)",
            }}
          />

          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative z-10 text-center px-12 py-20">
            <div className="inline-flex items-center gap-2 mb-6 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2">
              <Globe className="w-3.5 h-3.5 text-[#4F6EF7]" />
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                Portal Warga & Pengurus
              </span>
            </div>
            <h2 className="text-[2.8rem] md:text-[3.4rem] font-extrabold tracking-[-0.035em] text-white leading-[1.05] mb-6">
              Siap mempermudah
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #4F6EF7 0%, #7C3AED 50%, #06B6D4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                birokrasi lingkunganmu?
              </span>
            </h2>
            <p className="text-[15px] text-white/35 max-w-xl mx-auto mb-10 font-medium leading-relaxed">
              Gabung sekarang dan nikmati kemudahan akses informasi serta administrasi dalam satu platform terintegrasi.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2.5 bg-[#4F6EF7] hover:bg-[#3D5CE8] text-white font-bold px-8 py-3.5 rounded-xl transition-all text-[14px] w-full sm:w-auto justify-center shadow-[0_0_40px_rgba(79,110,247,0.3)]"
              >
                Masuk Portal Sekarang
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <button className="text-white/35 font-semibold text-[14px] hover:text-white/60 transition-colors px-6 py-3.5">
                Lihat Panduan →
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 pt-10 border-t border-white/[0.05]">
              {[
                { icon: Shield, text: "Keamanan Terjamin" },
                { icon: Zap, text: "Setup Dalam Menit" },
                { icon: Users, text: "Dukungan 24/7" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-white/25">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[12px] font-semibold">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-12 px-8 bg-[#080B14]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#4F6EF7] to-[#7C3AED] flex items-center justify-center shadow-[0_0_12px_rgba(79,110,247,0.4)]">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-white/80 tracking-tight">
            Digi<span className="text-[#4F6EF7]">Desa</span>
          </span>
          <span className="text-white/20 text-[12px] font-medium ml-1">· Administrasi Terpadu</span>
        </div>
        <p className="text-[12px] font-medium text-white/20">
          © {new Date().getFullYear()} DigiDesa Lingkungan. Hak Cipta Dilindungi.
        </p>
        <div className="flex gap-6">
          {["Tentang", "Bantuan", "Privasi", "Status"].map((l) => (
            <button
              key={l}
              type="button"
              className="text-[12px] text-white/25 hover:text-white/60 transition-colors font-semibold"
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div
      className="min-h-screen antialiased overflow-x-hidden"
      style={{ backgroundColor: "#080B14", fontFamily: "'DM Sans', 'Geist', system-ui, sans-serif" }}
    >
      <Navbar />
      <main>
        <Hero />
        <MetricsStrip />
        <FeaturesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}