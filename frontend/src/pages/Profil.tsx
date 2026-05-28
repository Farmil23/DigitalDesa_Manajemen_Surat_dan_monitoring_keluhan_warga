import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ArrowLeft, 
  Camera, 
  Edit3, 
  Lock, 
  CreditCard,
  CheckCircle2,
  Fingerprint,
  Calendar,
  Building,
  History,      
  ChevronRight, 
  TrendingUp    
} from "lucide-react";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

const EASE_SPRING = [0.16, 1, 0.3, 1];

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: EASE_SPRING }
  })
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

export default function Profil() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-sans antialiased pb-20">
      
      {/* ── HEADER & COVER ── */}
      <div className="h-64 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-indigo-900/50" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20" />
        
        <header className="max-w-6xl mx-auto px-8 pt-8 relative z-10 flex justify-between items-center text-white">
          <button 
            onClick={() => navigate('/dashboard-warga')}
            className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/30">
            <Edit3 size={14} /> Edit Profil
          </button>
        </header>
      </div>

      <main className="max-w-5xl mx-auto px-8 -mt-24 relative z-20">
        
        {/* ── PROFILE INFO CARD ── */}
        <motion.div 
          initial="hidden" animate="visible" variants={FADE_UP} custom={0}
          className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center md:items-end gap-8"
        >
          <div className="relative group">
            <img 
              className="w-40 h-40 rounded-[2.5rem] border-8 border-white shadow-xl ring-1 ring-slate-100" 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi" 
              alt="Avatar" 
            />
            <button className="absolute bottom-2 right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
              <Camera size={18} strokeWidth={2.5} />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left pb-4">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Budi Santoso</h2>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100 flex items-center gap-1">
                <ShieldCheck size={12} /> Terverifikasi
              </span>
            </div>
            <p className="text-slate-400 font-bold flex items-center justify-center md:justify-start gap-2">
              <Fingerprint size={16} /> 3273012903100004
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
          
          {/* ── DATA PERSONAL ── */}
          <motion.div 
            initial="hidden" animate="visible" variants={FADE_UP} custom={1}
            className="lg:col-span-2 space-y-8"
          >
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Informasi Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} className="text-blue-500" /> Email
                  </p>
                  <p className="text-sm font-bold text-slate-800">budi.santoso@email.com</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Phone size={12} className="text-blue-500" /> WhatsApp
                  </p>
                  <p className="text-sm font-bold text-slate-800">+62 812-3456-7890</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} className="text-blue-500" /> Tanggal Lahir
                  </p>
                  <p className="text-sm font-bold text-slate-800">12 Maret 1990</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} className="text-blue-500" /> Alamat KTP
                  </p>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">Jl. Cisaladah No. 42, Kel. Jatimekar</p>
                </div>
              </div>
            </div>

            {/* ── SECURITY SETTINGS ── */}
            <div className="bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Keamanan Akun</h3>
              <div className="space-y-4">
                {[
                  { l: "Ubah Kata Sandi", i: Lock, c: "blue" },
                  { l: "Autentikasi Dua Faktor (2FA)", i: ShieldCheck, c: "emerald" },
                  { l: "Log Aktivitas Login", i: History, c: "indigo" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:border-blue-200 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-${item.c}-50 flex items-center justify-center`}>
                        <item.i size={18} className={`text-${item.c}-600`} />
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">{item.l}</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── DATA WILAYAH ── */}
          <motion.div 
            initial="hidden" animate="visible" variants={FADE_UP} custom={2}
            className="space-y-8"
          >
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-20" />
              <h3 className="text-xl font-black mb-8 tracking-tight flex items-center gap-3">
                <Building size={22} className="text-blue-400" strokeWidth={3} /> Wilayah RT/RW
              </h3>
              
              <div className="space-y-8">
                <div className="border-l-2 border-slate-700 pl-6">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Ketua RT 01</p>
                  <p className="text-sm font-bold mt-1">Bpk. H. Ahmad Subarjo</p>
                </div>
                <div className="border-l-2 border-slate-700 pl-6">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Ketua RW 10</p>
                  <p className="text-sm font-bold mt-1">Bpk. Ir. Mulyadi</p>
                </div>
                <div className="border-l-2 border-slate-700 pl-6">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Wilayah Desa</p>
                  <p className="text-sm font-bold mt-1">Cisaladah Digital</p>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl">
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />
                  <p className="text-[10px] font-medium text-slate-300">Anda tercatat sebagai penduduk aktif di wilayah ini sejak 2018.</p>
                </div>
              </div>
            </div>

            {/* Badge Card */}
            <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CreditCard size={28} strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">E-KTP Digital</h4>
              <p className="text-xs text-slate-500 mt-2 font-medium">QR-Code identitas Anda dapat dipindai oleh petugas desa.</p>
              <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20">
                Tampilkan QR-Code
              </button>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}