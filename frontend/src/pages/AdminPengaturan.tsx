import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Bell, 
  Globe, 
  Building2, 
  ArrowLeft,
  Save,
  Camera,
  LayoutDashboard,
  Files,
  AlertTriangle,
  Users,
  BarChart3,
  LogOut
} from "lucide-react";

export default function AdminPengaturan() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Profil Desa");

  const menuItems = [
    { n: "Profil Desa", i: Building2 },
    { n: "Akun Admin", i: User },
    { n: "Keamanan", i: ShieldCheck },
    { n: "Notifikasi", i: Bell },
    { n: "Bahasa & Wilayah", i: Globe },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased flex">
      
      {/* ── SIDEBAR (Consistent) ── */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-50 shadow-sm">
        <div className="p-8 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin')}>
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tighter text-xl leading-none">ADMIN</span>
            <span className="text-[10px] font-black text-blue-600 tracking-[0.3em] mt-1 uppercase">DigiDesa</span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1.5 mt-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Navigasi Utama</p>
          {[
            { n: "Overview", i: LayoutDashboard, p: "/admin" },
            { n: "Validasi Surat", i: Files, p: "/admin/validasi" },
            { n: "Moderasi Lapor", i: AlertTriangle, p: "/admin/laporan" },
            { n: "Data Penduduk", i: Users, p: "/admin/penduduk" },
            { n: "Keuangan Desa", i: BarChart3, p: "/admin/keuangan" },
            { n: "Pengaturan", i: Settings, p: "/admin/pengaturan", active: true },
          ].map((item) => (
            <button
              key={item.n}
              onClick={() => item.p !== "#" && navigate(item.p)}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all ${
                item.active ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.i size={18} strokeWidth={item.active ? 3 : 2.5} />
              {item.n}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold text-red-500 hover:bg-red-50 transition-all">
                <LogOut size={18} /> Keluar Sistem
            </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-h-screen">
        
        {/* HEADER */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Konfigurasi Sistem</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Kelola Preferensi & Parameter Aplikasi</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
            <Save size={16} /> Simpan Perubahan
          </button>
        </header>

        {/* CONTENT AREA */}
        <div className="p-10 max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            
            {/* SETTINGS NAV */}
            <div className="w-full md:w-72 border-r border-slate-50 p-6 bg-slate-50/30">
                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.n}
                            onClick={() => setActiveTab(item.n)}
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${
                                activeTab === item.n ? "bg-white text-blue-600 shadow-sm shadow-blue-900/5" : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            <item.i size={16} strokeWidth={3} /> {item.n}
                        </button>
                    ))}
                </div>
            </div>

            {/* SETTINGS FORM */}
            <div className="flex-1 p-12">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-10"
                >
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeTab}</h2>
                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Perbarui informasi publik dan identitas instansi</p>
                    </section>

                    {/* PHOTO UPLOAD SIMULATION */}
                    <div className="flex items-center gap-8">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-[2rem] bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 overflow-hidden">
                                <Building2 size={32} />
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-2.5 bg-white border border-slate-100 rounded-xl shadow-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                                <Camera size={16} />
                            </button>
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900">Logo Instansi</h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-1">Gunakan format PNG transparan, maks 2MB.</p>
                        </div>
                    </div>

                    {/* FORM FIELDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Instansi / Desa</label>
                            <input type="text" defaultValue="Desa Cisaladah" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-600/10 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kode Pos</label>
                            <input type="text" defaultValue="40512" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-600/10 transition-all" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Kantor</label>
                            <textarea defaultValue="Jl. Cisaladah No. 01, RT 01 RW 10, Bandung" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-600/10 transition-all min-h-[100px]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Resmi</label>
                            <input type="email" defaultValue="kontak@cisaladah.desa.id" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-600/10 transition-all" />
                        </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telepon</label>
                            <input type="text" defaultValue="(022) 8765 4321" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-600/10 transition-all" />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem dalam kondisi optimal</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 italic">Terakhir diubah: 2 jam yang lalu</span>
                    </div>
                </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}