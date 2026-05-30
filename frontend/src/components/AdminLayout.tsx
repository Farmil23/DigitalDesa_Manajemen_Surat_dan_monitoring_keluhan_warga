import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Files, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  Settings,
  Building2,
  ShieldCheck,
  Search,
  Bell,
  LogOut,
  Menu,
  X
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  title: string;
  subtitle: string;
}

export default function AdminLayout({ children, activeMenu, title, subtitle }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try { setUserData(JSON.parse(userStr)); } catch(e){}
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const MENU_ITEMS = [
    { n: "Overview", i: LayoutDashboard, p: "/admin/dashboard" },
    { n: "Validasi Surat", i: Files, p: "/admin/validasi" },
    { n: "Moderasi Lapor", i: AlertTriangle, p: "/admin/laporan" },
    { n: "Data Penduduk", i: Users, p: "/admin/penduduk" },
    { n: "Keuangan Desa", i: BarChart3, p: "/admin/keuangan" },
    { n: "Pengaturan", i: Settings, p: "/admin/pengaturan" },   
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased flex text-slate-900 selection:bg-red-200">
      
      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-50">
        <div className="px-8 py-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg leading-none">ADMIN</span>
            <span className="text-[10px] font-bold text-red-600 tracking-[0.2em] mt-1">DIGIDESA</span>
          </div>
        </div>

        <nav className="flex-1 px-5 space-y-1 mt-4 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-3">Menu Navigasi</p>
          {MENU_ITEMS.map((item) => (
            <button
              key={item.n}
              onClick={() => navigate(item.p)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeMenu === item.n 
                ? "bg-red-50 text-red-600 shadow-sm" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.i size={18} strokeWidth={activeMenu === item.n ? 2.5 : 2} />
              {item.n}
            </button>
          ))}         
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
               <ShieldCheck className="text-emerald-500" size={16} />
            </div>
            <div>
              <p className="text-slate-900 text-[10px] font-bold uppercase tracking-wide">Sistem Terenkripsi</p>
              <p className="text-slate-500 text-[10px] font-medium">Otoritas Pusat</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE MENU OVERLAY ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] lg:hidden" />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="fixed top-0 left-0 bottom-0 w-72 bg-white flex flex-col z-[70] lg:hidden shadow-2xl">
              <div className="px-6 py-6 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold text-slate-900 text-lg">ADMIN</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-900"><X size={20} /></button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {MENU_ITEMS.map((item) => (
                  <button key={item.n} onClick={() => { setIsMobileMenuOpen(false); navigate(item.p); }} className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeMenu === item.n ? "bg-red-50 text-red-600" : "text-slate-500"}`}>
                    <item.i size={18} /> {item.n}
                  </button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-h-screen w-full overflow-x-hidden">
        
        {/* EXECUTIVE HEADER */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg transition-colors shrink-0">
              <Menu size={24} />
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight truncate">{title}</h1>
              <p className="text-[10px] lg:text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5 truncate">{subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-5 shrink-0">
            <div className="hidden md:flex relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Pencarian cepat..." className="bg-slate-50 border border-slate-200 rounded-full py-2 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:bg-white focus:border-red-300 transition-all w-48 lg:w-64 outline-none" />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-red-600 transition-all">
              <Bell size={20} strokeWidth={2.5} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white" />
            </button>
            
            <div className="relative border-l border-slate-200 pl-3 lg:pl-5">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-2 rounded-full transition-colors text-left">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-bold text-slate-900 leading-none">{userData?.nama_lengkap?.split(' ')[0] || "Admin"}</p>
                  <p className="text-[10px] font-bold text-red-600 mt-1 uppercase tracking-widest">Otoritas Pusat</p>
                </div>
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200 shrink-0 uppercase">
                  {userData?.nama_lengkap ? userData.nama_lengkap.charAt(0) : "A"}
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 z-50">
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                      <LogOut size={16} /> Keluar Sistem
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
