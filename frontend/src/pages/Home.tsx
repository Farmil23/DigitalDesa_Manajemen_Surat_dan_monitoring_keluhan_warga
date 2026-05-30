import { useEffect, useState } from "react";
import { motion, cubicBezier } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import PanduanWarga from "../components/PanduanWarga";
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
  TrendingUp,
  Activity,
  Globe,
  Database,
  UserCircle,
  LogOut,
  LayoutDashboard,
  Mail,
  MapPin,
  Phone,
  MailOpen,
  AlertTriangle
} from "lucide-react";

const EASE_SPRING = cubicBezier(0.16, 1, 0.3, 1);

const FADE_UP = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE_SPRING } }
};

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try { setUserData(JSON.parse(userStr)); } catch(e){}
    }

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUserData(null);
    navigate("/");
  };

  const navItems = [
    { name: "Beranda", id: "hero" },
    { name: "Layanan", id: "layanan" },
    { name: "Panduan", id: "panduan" },
    { name: "Statistik", id: "statistik" },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_SPRING }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-[72px] flex items-center justify-between">
        <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-[-0.02em] text-xl">
            Digi<span className="text-red-600">Desa</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-1 bg-slate-50/50 rounded-2xl p-1 border border-slate-100">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.id)}
              className="text-[13px] font-bold text-slate-500 hover:text-slate-900 hover:bg-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-none hover:shadow-sm"
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {userData ? (
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 bg-white/50 hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full transition-all shadow-sm">
                <img className="w-8 h-8 rounded-full bg-slate-100 object-cover" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.nama_lengkap || 'Warga'}`} alt="Avatar" />
                <span className="text-sm font-bold text-slate-700 hidden sm:block pr-2">{userData.nama_lengkap?.split(' ')[0] || "Warga"}</span>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Akun Saya</p>
                    <p className="text-sm font-bold text-slate-900 mt-1 truncate">{userData?.nama_lengkap || "Warga"}</p>
                  </div>
                  <button onClick={() => navigate(localStorage.getItem('role') === 'ADMIN' ? '/admin/dashboard' : '/dashboard-warga')} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3 transition-colors">
                    <LayoutDashboard size={16} /> Buka Dashboard
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors border-t border-slate-50 mt-1">
                    <LogOut size={16} /> Keluar Sistem
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="hidden sm:block text-[14px] font-bold text-slate-500 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all">
                Masuk
              </button>
              <motion.button
                onClick={() => navigate("/login")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="text-[14px] font-bold text-white bg-red-600 hover:bg-red-700 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-red-600/20"
              >
                Mulai Sekarang
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function Hero() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative pt-[140px] pb-24 lg:pt-[180px] lg:pb-32 bg-slate-50 overflow-hidden flex items-center min-h-[90vh]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-10 right-0 w-[600px] h-[600px] bg-red-100 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 opacity-50 animate-pulse" />
      <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3 opacity-70" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Content */}
        <motion.div initial="hidden" animate="visible" variants={FADE_UP} className="lg:col-span-6">
          <div className="inline-flex items-center gap-2 mb-6 bg-white border border-slate-200 rounded-full p-1.5 shadow-sm">
            <span className="flex h-6 w-6 items-center justify-center relative bg-red-50 rounded-full">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-50"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest pr-4">
              Pembaruan Sistem 2026
            </span>
          </div>
          
          <h1 className="text-[3.5rem] sm:text-[4.5rem] font-extrabold leading-[1.05] tracking-tight text-slate-900 mb-6">
            Birokrasi Desa <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
              Era Digital.
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-lg font-medium">
            Tinggalkan cara lama. Ajukan surat, bayar iuran warga, dan lapor keluhan cukup melalui satu platform terpadu. Lebih cepat, transparan, dan dapat dipantau 24/7.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="group flex w-full sm:w-auto justify-center items-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-xl shadow-red-600/20"
            >
              Ajukan Surat Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection("panduan")}
              className="flex w-full sm:w-auto justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-8 py-4 rounded-2xl border border-slate-200 shadow-sm transition-all"
            >
              Pelajari Cara Kerja
            </button>
          </div>
          
          <div className="mt-12 flex items-center gap-6 pt-8 border-t border-slate-200/60">
            <div className="flex -space-x-3">
               {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-50 bg-slate-200 flex items-center justify-center overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=warga${i}`} alt="user" className="w-full h-full object-cover opacity-80" />
                </div>
               ))}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Bergabung dengan 4.821+ Warga</p>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Terdaftar dan terverifikasi kelurahan
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Content - Mockup Floating Card */}
        <motion.div initial={{ opacity: 0, x: 40, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ duration: 1.2, ease: EASE_SPRING }} className="relative hidden lg:block lg:col-span-6">
           <div className="absolute inset-0 bg-gradient-to-tr from-red-600/5 to-transparent rounded-[3rem] -z-10 translate-x-4 translate-y-4" />
           
           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-2xl shadow-slate-200/80 relative">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-4">
                 <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                   <FileText className="text-red-600 w-7 h-7" />
                 </div>
                 <div>
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Live Tracking</p>
                   <h4 className="font-bold text-slate-900 text-lg">Pengantar SKCK</h4>
                 </div>
               </div>
               <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-lg uppercase tracking-wider">
                 DIPROSES
               </span>
             </div>
             
             <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {/* Timeline Items */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-emerald-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10" />
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl border border-slate-100 ml-4 md:ml-0">
                    <p className="font-bold text-slate-900 text-sm">Validasi RT 01</p>
                    <p className="text-xs text-slate-500 mt-1">Selesai • 14:30 WIB</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-red-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                    <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-2xl border-2 border-red-100 ml-4 md:ml-0 shadow-lg shadow-red-500/10">
                    <p className="font-bold text-slate-900 text-sm">Tanda Tangan Kades</p>
                    <p className="text-xs text-slate-500 mt-1">Sedang berlangsung</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group py-4 opacity-50">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-white bg-slate-200 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10" />
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-2xl border border-slate-100 ml-4 md:ml-0">
                    <p className="font-bold text-slate-900 text-sm">Dokumen Siap</p>
                    <p className="text-xs text-slate-500 mt-1">Menunggu tahapan sebelumnya</p>
                  </div>
                </div>
             </div>
             
             <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                 <Shield className="w-4 h-4 text-emerald-500" /> Tervalidasi SSL
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Resmi Desa</p>
             </div>
           </div>
           
           {/* Decorative floating widgets */}
           <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -bottom-10 -left-10 bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
             <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
               <CheckCircle2 size={20} />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-900">Notifikasi Masuk</p>
               <p className="text-xs font-medium text-slate-500">Surat telah dicetak</p>
             </div>
           </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

function BentoLayanan() {
  const navigate = useNavigate();
  return (
    <section id="layanan" className="py-24 bg-white relative z-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-sm font-black text-red-600 uppercase tracking-[0.2em] mb-4">Pusat Layanan</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Satu Pintu Beragam Solusi</h2>
          <p className="text-slate-500 text-lg">Semua urusan birokrasi dan transparansi desa kini dapat diakses secara real-time dari perangkat apa pun.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {/* Fitur 1 - Pengajuan Surat (Besar) */}
          <div className="md:col-span-2 bg-slate-50 rounded-[2rem] p-10 border border-slate-100 flex flex-col justify-between group hover:bg-red-50 hover:border-red-100 transition-all duration-300 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-all translate-x-10 translate-y-10 group-hover:scale-110">
              <FileText size={200} />
            </div>
            <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center border border-slate-200 group-hover:border-red-200 mb-6 relative z-10">
              <FileText className="text-red-600 w-7 h-7" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-red-900">Pengajuan Surat Online</h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm group-hover:text-red-700/70">Urus SKTM, Surat Domisili, dan Pengantar SKCK tanpa perlu bolak-balik ke kantor desa. Pantau status validasinya secara live.</p>
            </div>
          </div>

          {/* Fitur 2 - Pelaporan Warga */}
          <div className="bg-slate-50 rounded-[2rem] p-10 border border-slate-100 flex flex-col justify-between group hover:bg-amber-50 hover:border-amber-100 transition-all duration-300 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-20 transition-all translate-x-5 translate-y-5 group-hover:scale-110">
              <Activity size={150} />
            </div>
            <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center border border-slate-200 group-hover:border-amber-200 mb-6 relative z-10">
              <AlertTriangle className="text-amber-500 w-7 h-7" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-amber-900">Lapor Warga</h3>
              <p className="text-sm font-medium text-slate-500 group-hover:text-amber-700/70">Laporkan insiden, fasilitas rusak, atau masalah keamanan langsung ke petugas.</p>
            </div>
          </div>

          {/* Fitur 3 - Keuangan Desa */}
          <div className="bg-slate-50 rounded-[2rem] p-10 border border-slate-100 flex flex-col justify-between group hover:bg-emerald-50 hover:border-emerald-100 transition-all duration-300 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-5 group-hover:opacity-20 transition-all translate-x-5 translate-y-5 group-hover:scale-110">
              <BarChart3 size={150} />
            </div>
            <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center border border-slate-200 group-hover:border-emerald-200 mb-6 relative z-10">
              <TrendingUp className="text-emerald-500 w-7 h-7" />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-emerald-900">Transparansi Dana</h3>
              <p className="text-sm font-medium text-slate-500 group-hover:text-emerald-700/70">Pantau laporan pengeluaran, pemasukan, dan saldo kas desa secara terbuka.</p>
            </div>
          </div>

          {/* Fitur 4 - Layanan Kependudukan */}
          <div className="md:col-span-2 bg-slate-900 rounded-[2rem] p-10 border border-slate-800 flex flex-col justify-between group hover:bg-slate-800 transition-all duration-300 relative overflow-hidden">
             <div className="absolute right-10 inset-y-0 flex items-center opacity-20 group-hover:opacity-100 transition-all group-hover:translate-x-5">
              <ArrowRight size={100} className="text-slate-700" />
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Database className="text-white w-7 h-7" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-white tracking-tight mb-2">Sistem Kependudukan Valid</h3>
              <p className="text-sm font-medium text-slate-400 max-w-md">Data warga tersinkronisasi. Verifikasi menggunakan KTP menjamin sistem bebas dari akun fiktif, meningkatkan keamanan lingkungan.</p>
              
              <button onClick={() => navigate('/login')} className="mt-6 px-6 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm">
                Gabung Sistem Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const metrics = [
    { value: "4.821+", label: "Warga Terverifikasi", icon: Users },
    { value: "98.7%", label: "Tingkat Kepuasan", icon: TrendingUp },
    { value: "<2 Jam", label: "Waktu Proses Surat", icon: Clock },
    { value: "100%", label: "Transparansi Dana", icon: Shield },
  ];

  return (
    <div id="statistik" className="bg-red-600 py-16 relative z-20 overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
        {metrics.map((m, i) => (
          <div key={i} className="text-center flex flex-col items-center">
             <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
               <m.icon className="text-white w-7 h-7" />
             </div>
             <h4 className="text-3xl font-black text-white mb-1 tracking-tight">{m.value}</h4>
             <p className="text-sm font-bold text-red-200 uppercase tracking-widest">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MegaFooter() {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white tracking-[-0.02em] text-xl">
                Digi<span className="text-red-500">Desa</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
              Platform pelayanan publik desa terintegrasi. Menghadirkan inovasi birokrasi yang cepat, transparan, dan dapat diakses dari mana saja.
            </p>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6">Tautan Cepat</h4>
            <ul className="space-y-4">
              {['Beranda', 'Ajukan Surat', 'Lapor Keluhan', 'Cek Saldo Desa'].map((item) => (
                <li key={item}>
                  <button onClick={() => window.scrollTo(0,0)} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6">Dukungan</h4>
            <ul className="space-y-4">
              {['Panduan Pengguna', 'FAQ', 'Kebijakan Privasi', 'Syarat & Ketentuan'].map((item) => (
                <li key={item}>
                  <button onClick={() => scrollToSection('panduan')} className="text-slate-400 hover:text-white transition-colors text-sm font-medium">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-sm mb-6">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-400 text-sm font-medium">
                <MapPin size={18} className="text-red-500 shrink-0 mt-0.5" />
                <span>Kantor Kepala Desa Cisaladah<br/>Jl. Cisaladah No. 1, Bandung</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                <Phone size={18} className="text-red-500 shrink-0" />
                <span>(022) 8765 4321</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                <Mail size={18} className="text-red-500 shrink-0" />
                <span>cs@cisaladah.desa.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm font-medium">© 2026 Pemerintah Kelurahan DigiDesa. Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-2">
             <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sistem Online & Stabil</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-red-200 selection:text-red-900 font-sans scroll-smooth">
      <Navbar />
      <Hero />
      
      <BentoLayanan />

      <div id="panduan" className="py-24 max-w-7xl mx-auto px-6 md:px-8 relative z-20">
        <div className="text-center mb-16">
          <p className="text-sm font-black text-red-600 uppercase tracking-[0.2em] mb-4">Panduan Singkat</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Mudah, Bahkan Bagi Pemula</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">Sistem kami dirancang sangat intuitif. Anda hanya butuh KTP untuk mendaftar dan mulai mengakses layanan administrasi.</p>
        </div>
        
        {/* Panduan Penggunaan Non-IT */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-2 md:p-8">
          <PanduanWarga />
        </div>
      </div>

      <TrustStrip />
      <MegaFooter />
    </div>
  );
}