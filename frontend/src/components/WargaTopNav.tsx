import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CalendarDays, LogOut, Menu, UserCircle } from "lucide-react";

export default function WargaTopNav() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUserData(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button onClick={() => navigate('/dashboard-warga')} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-xl tracking-tight hidden sm:block text-slate-900">Digi<span className="text-red-600">Desa</span></span>
            </button>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => navigate('/dashboard-warga')} className="px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-900 font-bold text-sm transition-all">Beranda</button>
              <button onClick={() => navigate('/layanan')} className="px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-900 font-bold text-sm transition-all">Layanan Surat</button>
              <button onClick={() => navigate('/lapor')} className="px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-900 font-bold text-sm transition-all">Pengaduan</button>
              <button onClick={() => navigate('/finansial')} className="px-4 py-2 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-900 font-bold text-sm transition-all">PBB & Keuangan</button>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-100">
               <CalendarDays size={16} className="text-red-600" />
               <span className="text-xs font-bold text-red-700">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            
            <div className="relative pl-5 border-l border-slate-200" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-all">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900 leading-none">{userData?.nama_lengkap || userData?.namaLengkap || userData?.username || "Warga"}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1">NIK: {userData?.nik || "-"}</p>
                </div>
                <img className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 object-cover" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.nama_lengkap || 'Warga'}`} alt="Avatar" />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Akun Saya</p>
                      <p className="text-sm font-bold text-slate-900 mt-1 truncate">{userData?.nama_lengkap || "Warga"}</p>
                    </div>
                    <button onClick={() => navigate('/profil')} className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-3 transition-colors">
                      <UserCircle size={16} /> Profil Pribadi
                    </button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                      <LogOut size={16} /> Keluar Sistem
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-500">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-2 sticky top-20 z-40 shadow-sm overflow-hidden">
            <button onClick={() => navigate('/layanan')} className="block w-full text-left px-4 py-3 font-bold text-slate-600">Layanan Surat</button>
            <button onClick={() => navigate('/lapor')} className="block w-full text-left px-4 py-3 font-bold text-slate-600">Buat Pengaduan</button>
            <button onClick={() => navigate('/finansial')} className="block w-full text-left px-4 py-3 font-bold text-slate-600">PBB & Keuangan</button>
            <button onClick={handleLogout} className="block w-full text-left px-4 py-3 font-bold text-red-600 border-t border-slate-100">Keluar Sistem</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
