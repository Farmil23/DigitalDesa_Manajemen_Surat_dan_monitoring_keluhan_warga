import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Lock,
  ShieldCheck,
  User,
  Users,
  CheckCircle2,
  Building2,
  Fingerprint,
  TrendingUp,
  MapPin,
  Sparkles,
  ChevronRight,
  UserPlus,
  Phone
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

const stats = [
  { icon: FileText, value: "138", label: "Pengajuan aktif", color: "#60A5FA" },
  { icon: Users, value: "4.821", label: "Warga terdata", color: "#34D399" },
  { icon: TrendingUp, value: "97%", label: "Tingkat kepuasan", color: "#F472B6" },
];

const features = [
  "Pengajuan surat online 24/7",
  "Notifikasi status real-time",
  "Arsip dokumen digital",
  "Laporan transparan & akuntabel",
];

export default function Login() {
  const navigate = useNavigate();
  
  const [isRegister, setIsRegister] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [noHp, setNoHp] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setNik("");
    setPassword("");
    setNamaLengkap("");
    setNoHp("");
    setShowPassword(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegister) {
        const response = await api.post("/auth/register", {
          nama_lengkap: namaLengkap,
          nik: nik,
          username: nik,
          no_hp: noHp,
          password: password
        });

        if (response.data.success || response.data) {
          toast.success("Akun warga berhasil didaftarkan! Tunggu persetujuan awal dari Admin RT.");
          toggleMode();
        }
      } else {
        const response = await api.post("/auth/login", {
          username: nik,
          password: password
        });

        const resData = response.data;
        if (resData.success || resData.token) {
          localStorage.clear();

          const loggedUser = resData.data?.user || resData.user;

          // ambil status_akun dari payload user + fallback aman
          let statusAkunActual =
            loggedUser?.status_akun ||
            resData.user?.status_akun ||
            resData.data?.user?.status_akun ||
            resData.data?.statusAkun ||
            loggedUser?.statusAkun ||
            "INCOMPLETE";

          const roleActual =
            loggedUser?.role === "ADMIN_RT" ? "ADMIN" : (loggedUser?.role || "WARGA");

          const normalizeStatus = (raw: string) => {
            const s = (raw || "").toString().trim().toUpperCase();
            if (s.includes("VERIFIED")) return "VERIFIED";
            if (s === "INCOMPLETE") return "INCOMPLETE";
            if (s === "PENDING" || s === "PENDING_ADMIN" || s === "PENDING_VERIFICATION") return "PENDING";
            if (s === "REJECTED" || s === "REJECTED_ADMIN") return "REJECTED";
            return s || "INCOMPLETE";
          };

          statusAkunActual = normalizeStatus(statusAkunActual);

          localStorage.setItem("token", resData.token);
          localStorage.setItem("role", roleActual);
          localStorage.setItem("statusAkun", statusAkunActual);
          localStorage.setItem("user", JSON.stringify(loggedUser));

          toast.success("Login Berhasil!");

          if (roleActual === "ADMIN") {
            navigate("/admin/dashboard");
          } else {
            if (statusAkunActual === "INCOMPLETE") navigate("/onboarding");
            else if (statusAkunActual === "VERIFIED") navigate("/dashboard-warga");
            else navigate("/onboarding"); // PENDING / REJECTED juga tetap ke onboarding
          }
        }
      }
    } catch (error: any) {
      console.error("ERROR PADA MESIN AUTH SYSTEM FE:", error);
      toast.error(error.response?.data?.message || "Gagal memproses permohonan, cek koneksi server Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080C14",
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', system-ui, sans-serif",
        color: "#F8FAFC",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "55%", width: "700px", height: "700px", background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.15), rgba(59,130,246,0.2), rgba(99,102,241,0.15), transparent)" }} />
      </div>

      <header style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(12px)", background: "rgba(8,12,20,0.6)" }}>
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#94A3B8", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }} whileHover={{ color: "#F8FAFC", borderColor: "rgba(255,255,255,0.2)" }}>
          <ArrowLeft size={15} /> Kembali
        </motion.button>

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(37,99,235,0.4)" }}>
            <Building2 size={18} color="white" style={{ margin: "auto" }} />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1, margin: 0 }}>DigiDesa</p>
            <p style={{ fontSize: "11px", color: "#64748B", marginTop: "2px", margin: 0 }}>Portal Administrasi</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "100px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", fontSize: "12px", color: "#34D399" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34D399", boxShadow: "0 0 6px #34D399" }} /> System aktif
        </motion.div>
      </header>

      <main style={{ position: "relative", zIndex: 5, display: "grid", gridTemplateColumns: "1fr 480px", gap: 0, minHeight: "calc(100vh - 73px)", maxWidth: "1400px", margin: "0 auto", padding: "0 40px" }}>
        <motion.section variants={stagger} initial="hidden" animate="visible" style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: "80px", paddingTop: "40px", paddingBottom: "40px" }}>
          <motion.div variants={fadeUp} style={{ marginBottom: "28px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "100px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", fontSize: "12px", fontWeight: 600, color: "#818CF8", letterSpacing: "0.02em" }}>
              <Sparkles size={13} /> Platform Digital Pemerintahan Desa
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(42px, 4.5vw, 64px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.08, margin: 0, marginBottom: "20px" }}>
            Administrasi desa <br />
            <span style={{ background: "linear-gradient(135deg, #60A5FA 0%, #818CF8 50%, #A78BFA 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {isRegister ? "selangkah lebih dekat." : "kini digital."}
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{ fontSize: "17px", color: "#64748B", lineHeight: 1.7, maxWidth: "480px", marginBottom: "40px", margin: 0 }}>
            Satu portal untuk seluruh layanan administrasi — dari pengajuan surat hingga laporan kependudukan, semua tersedia secara real-time.
          </motion.p>

          <motion.div variants={fadeUp} style={{ marginBottom: "48px" }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", fontSize: "14px", color: "#94A3B8" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle2 size={11} color="#818CF8" />
                </div>
                {f}
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} style={{ display: "flex", gap: "16px" }}>
            {stats.map((s, i) => (
              <div key={i} style={{ flex: 1, padding: "16px 20px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(8px)" }}>
                <s.icon size={18} color={s.color} style={{ marginBottom: "8px" }} />
                <p style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, color: "#F1F5F9" }}>{s.value}</p>
                <p style={{ fontSize: "12px", color: "#475569", marginTop: "2px", margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.section>

        <section style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0", borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: "60px" }}>
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            style={{ width: "100%", maxWidth: "400px", background: "rgba(15,20,30,0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "28px", padding: "36px", boxShadow: "0 40px 80px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "200px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)" }} />
            
            <div style={{ marginBottom: "28px" }}>
              <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #2563EB, #4F46E5)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", boxShadow: "0 8px 24px rgba(79,70,229,0.35)" }}>
                {isRegister ? <UserPlus size={22} color="white" /> : <Fingerprint size={24} color="white" />}
              </div>
              <h2 style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0, marginBottom: "6px" }}>
                {isRegister ? "Buat Akun" : "Masuk Portal"}
              </h2>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5, margin: 0 }}>
                {isRegister ? "Lengkapi nomor KTP dan WhatsApp aktif Anda." : "Gunakan NIK atau username untuk akses layanan DigiDesa."}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <AnimatePresence>
                {isRegister && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>Nama Lengkap (Sesuai KTP)</label>
                    <div style={{ position: "relative" }}>
                      <UserPlus size={16} color={focused === "nama" ? "#818CF8" : "#334155"} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                      <input type="text" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} onFocus={() => setFocused("nama")} onBlur={() => setFocused(null)} required placeholder="Contoh: Uzumaki Bayu" style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px 12px 42px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", color: "#F1F5F9", fontSize: "14px", outline: "none" }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>NIK KTP / Username</label>
                <div style={{ position: "relative" }}>
                  <User size={16} color={focused === "nik" ? "#818CF8" : "#334155"} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                  <input type="text" value={nik} onChange={(e) => setNik(e.target.value)} onFocus={() => setFocused("nik")} onBlur={() => setFocused(null)} required placeholder="Masukkan NIK 16 digit..." style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px 12px 42px", background: focused === "nik" ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${focused === "nik" ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "14px", color: "#F1F5F9", fontSize: "14px", outline: "none" }} />
                </div>
              </div>

              <AnimatePresence>
                {isRegister && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>No WhatsApp Aktif</label>
                    <div style={{ position: "relative" }}>
                      <Phone size={16} color={focused === "hp" ? "#818CF8" : "#334155"} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                      <input type="tel" value={noHp} onChange={(e) => setNoHp(e.target.value)} onFocus={() => setFocused("hp")} onBlur={() => setFocused(null)} required placeholder="Contoh: 08xxxxxxxxxx" style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px 12px 42px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", color: "#F1F5F9", fontSize: "14px", outline: "none" }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#94A3B8" }}>Kata Sandi</label>
                  {!isRegister && (
                    <button type="button" onClick={() => toast.info("Pemulihan akun silakan lapor RT setempat.")} style={{ fontSize: "12px", fontWeight: 600, color: "#6366F1", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Lupa sandi?</button>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color={focused === "password" ? "#818CF8" : "#334155"} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} required placeholder={isRegister ? "Buat kata sandi aman..." : "Masukkan kata sandi..."} style={{ width: "100%", boxSizing: "border-box", padding: "12px 44px 12px 42px", background: focused === "password" ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${focused === "password" ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "14px", color: "#F1F5F9", fontSize: "14px", outline: "none" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#475569", padding: 0, display: "flex" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {!isRegister && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                  <input type="checkbox" id="remember" style={{ width: "15px", height: "15px", accentColor: "#6366F1", cursor: "pointer" }} />
                  <label htmlFor="remember" style={{ fontSize: "12px", color: "#475569", cursor: "pointer" }}>Ingat perangkat ini selama 30 hari</label>
                </div>
              )}

              <motion.button
                type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                style={{ marginTop: "8px", width: "100%", padding: "14px", border: "none", borderRadius: "14px", color: "white", fontSize: "14px", fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", background: isLoading ? "rgba(79,70,229,0.5)" : "linear-gradient(135deg, #3B82F6 0%, #4F46E5 50%, #7C3AED 100%)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", letterSpacing: "-0.01em", boxShadow: isLoading ? "none" : "0 8px 24px rgba(79,70,229,0.3)" }}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Loader2 size={16} className="animate-spin" />
                      {isRegister ? "Mendaftarkan..." : "Memverifikasi Kredensial..."}
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {isRegister ? "Daftar Akun Baru" : "Masuk ke Portal"}
                      <ArrowRight size={16} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "18px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: "12px", color: "#334155" }}>atau</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
            </div>

            <motion.button type="button" onClick={toggleMode} whileHover={{ borderColor: "rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.06)" }} style={{ width: "100%", padding: "13px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", color: "#94A3B8", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} >
              {isRegister ? "Sudah punya akun? Masuk sekarang" : "Belum punya akun? Daftar sekarang"}
              <ChevronRight size={14} />
            </motion.button>

            <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#475569" }}><ShieldCheck size={12} color="#4F46E5" /> SSL 256-bit</div>
              <div style={{ width: "1px", height: "10px", background: "rgba(255,255,255,0.05)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#475569" }}><Lock size={12} color="#4F46E5" /> Terenkripsi</div>
              <div style={{ width: "1px", height: "10px", background: "rgba(255,255,255,0.05)" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#475569" }}><CheckCircle2 size={12} color="#4F46E5" /> Secure BSrE</div>
            </div>
          </motion.div>
        </section>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        input::placeholder { color: #475569 !important; font-weight: 500; }
        input:focus { box-shadow: 0 0 0 3px rgba(99,102,241,0.25) !important; }
      `}</style>
    </div>
  );
}