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
import AdminLayout from "../components/AdminLayout";

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
    <AdminLayout activeMenu="Pengaturan" title="Konfigurasi Sistem" subtitle="Kelola Preferensi & Parameter Aplikasi">
        {/* CONTENT AREA */}
        <div className="max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            
            {/* SETTINGS NAV */}
            <div className="w-full md:w-72 border-r border-slate-50 p-6 bg-slate-50/30">
                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.n}
                            onClick={() => setActiveTab(item.n)}
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${
                                activeTab === item.n ? "bg-white text-red-600 shadow-sm shadow-red-900/5" : "text-slate-400 hover:text-slate-600"
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
                            <button className="absolute -bottom-2 -right-2 p-2.5 bg-white border border-slate-100 rounded-xl shadow-lg text-red-600 hover:bg-red-600 hover:text-white transition-all">
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
                            <input type="text" defaultValue="Desa Cisaladah" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-red-600/10 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kode Pos</label>
                            <input type="text" defaultValue="40512" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-red-600/10 transition-all" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Kantor</label>
                            <textarea defaultValue="Jl. Cisaladah No. 01, RT 01 RW 10, Bandung" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-red-600/10 transition-all min-h-[100px]" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Resmi</label>
                            <input type="email" defaultValue="kontak@cisaladah.desa.id" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-red-600/10 transition-all" />
                        </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telepon</label>
                            <input type="text" defaultValue="(022) 8765 4321" className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-red-600/10 transition-all" />
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
    </AdminLayout>
  );
}