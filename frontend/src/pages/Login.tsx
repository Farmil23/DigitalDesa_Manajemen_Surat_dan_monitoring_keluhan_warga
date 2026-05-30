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
  Loader2,
  Lock,
  User,
  CheckCircle2,
  Building2,
  UserPlus,
  Phone,
  ShieldCheck,
  TrendingUp,
  FileText
} from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function Login() {
  const navigate = useNavigate();
  
  const [isRegister, setIsRegister] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [noHp, setNoHp] = useState("");

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
          toast.success("Akun berhasil didaftarkan! Silakan masuk dengan NIK Anda.");
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
          const roleActual = loggedUser?.role === "ADMIN_RT" ? "ADMIN" : (loggedUser?.role || "WARGA");

          localStorage.setItem("token", resData.token);
          localStorage.setItem("role", roleActual);
          localStorage.setItem("user", JSON.stringify(loggedUser));

          toast.success("Login Berhasil!");

          if (roleActual === "ADMIN") {
            navigate("/admin/dashboard");
          } else {
            navigate("/dashboard-warga");
          }
        }
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast.error(error.response?.data?.message || "Gagal memproses, cek NIK dan Sandi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* ── KIRI: BRANDING & ILUSTRASI ── */}
      <div className="hidden lg:flex w-1/2 bg-red-600 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-500 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-black/10">
            <Building2 className="w-6 h-6 text-red-600" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">DigiDesa</span>
        </div>

        <div className="relative z-10 mb-20">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
              Portal Warga
            </span>
            <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
              Sistem Desa<br />Lebih Cepat, Transparan.
            </h1>
            <p className="text-red-100 text-lg font-medium max-w-md leading-relaxed">
              Ajukan surat, laporkan masalah, dan pantau transparansi dana desa secara real-time.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <FileText className="text-white mb-3" size={24} />
              <p className="text-2xl font-black text-white">2.5k+</p>
              <p className="text-xs font-bold text-red-200 mt-1 uppercase tracking-widest">Surat Selesai</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <TrendingUp className="text-white mb-3" size={24} />
              <p className="text-2xl font-black text-white">99%</p>
              <p className="text-xs font-bold text-red-200 mt-1 uppercase tracking-widest">Tingkat Kepuasan</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-red-200 text-xs font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2"><ShieldCheck size={14} /> Keamanan Data</span>
          <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Sistem Terverifikasi</span>
        </div>
      </div>

      {/* ── KANAN: FORM AUTH ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <button 
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-md bg-white rounded-[2.5rem] p-10 sm:p-12 border border-slate-100 shadow-2xl shadow-slate-200/50"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isRegister ? "Daftar Akun" : "Selamat Datang"}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-2">
              {isRegister ? "Lengkapi data diri Anda sesuai dengan KTP domisili desa." : "Masuk menggunakan NIK dan kata sandi yang telah terdaftar."}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {/* Field Register */}
            <AnimatePresence>
              {isRegister && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="space-y-4 pb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nama Lengkap</label>
                      <div className="relative">
                        <UserPlus size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === "nama" ? "text-red-600" : "text-slate-400"}`} />
                        <input type="text" required value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} onFocus={() => setFocused("nama")} onBlur={() => setFocused(null)} placeholder="Sesuai KTP" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white outline-none transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">No. WhatsApp</label>
                      <div className="relative">
                        <Phone size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === "hp" ? "text-red-600" : "text-slate-400"}`} />
                        <input type="tel" required value={noHp} onChange={(e) => setNoHp(e.target.value)} onFocus={() => setFocused("hp")} onBlur={() => setFocused(null)} placeholder="Contoh: 08123..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nomor Induk Kependudukan (NIK)</label>
              <div className="relative">
                <User size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === "nik" ? "text-red-600" : "text-slate-400"}`} />
                <input type="text" required value={nik} onChange={(e) => setNik(e.target.value)} onFocus={() => setFocused("nik")} onBlur={() => setFocused(null)} placeholder="16 Digit NIK" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white outline-none transition-all" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Kata Sandi</label>
                {!isRegister && (
                  <button type="button" onClick={() => toast.info("Hubungi RT/Admin Desa untuk pemulihan.")} className="text-xs font-bold text-red-600 hover:text-red-700">Lupa sandi?</button>
                )}
              </div>
              <div className="relative">
                <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${focused === "password" ? "text-red-600" : "text-slate-400"}`} />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} placeholder={isRegister ? "Buat kata sandi yang kuat" : "Masukkan kata sandi"} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-12 text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={isLoading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl py-4 font-bold transition-all shadow-lg shadow-red-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={18} /> Memproses...</>
              ) : (
                <>{isRegister ? "Daftar Sekarang" : "Masuk ke Sistem"} <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-500">
              {isRegister ? "Sudah memiliki akun?" : "Belum punya akun warga?"}{" "}
              <button onClick={toggleMode} className="font-bold text-red-600 hover:text-red-700 hover:underline">
                {isRegister ? "Masuk di sini" : "Daftar sekarang"}
              </button>
            </p>
          </div>

        </motion.div>
      </div>
    </div>
  );
}