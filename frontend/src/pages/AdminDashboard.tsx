import { useState, useEffect } from "react";
import api from "../services/api";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Files, 
  AlertTriangle, 
  Users, 
  BarChart3, 
  CheckCircle, 
  XCircle,
  ArrowUpRight,
  Search,
  Bell,
  MoreHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
  Filter,
  Download,
  Building2,
  Settings,
  Plus
} from "lucide-react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const EASE_SPRING = [0.16, 1, 0.3, 1];

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: EASE_SPRING }
  })
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveTab] = useState("Overview");
  
  // 1. FIXED: Deklarasikan state loading agar tidak ReferenceError
  const [loading, setLoading] = useState<boolean>(true);

  const [stats, setStats] = useState({
    totalWarga: 0,
    laporanAktif: 0,
    suratPending: 0
  });
  const [pendingSuratList, setPendingSuratList] = useState<any[]>([]);
  const [financeData, setFinanceData] = useState({ income: 0, expense: 0, balance: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch users
      const usersRes = await api.get("/users");
      console.log("Data Users dari Java:", usersRes.data); // Untuk ngecek di F12 console
      const usersData = usersRes.data.data || usersRes.data || [];
      const adminCount = usersData.filter((w: any) => w.role === 'ADMIN_RT').length;

      // Fetch surat
      const suratRes = await api.get("/surat");
      console.log("Data Surat dari Java:", suratRes.data);
      const suratData = suratRes.data.data || suratRes.data || [];
      const pendingSurat = suratData.filter((s: any) => s.status === 'PENDING' || s.status === 'pending');
      
      // Fetch reports
      const reportsRes = await api.get("/reports");
      console.log("Data Reports dari Java:", reportsRes.data);
      const reportsData = reportsRes.data.data || reportsRes.data || [];
      const pendingReports = reportsData.filter((r: any) => r.status === 'PENDING' || r.status === 'DIPROSES' || r.status === 'pending' || r.status === 'diproses');

      // Fetch finance
      let inc = 0, exp = 0, bal = 0;
      try {
        const finRes = await api.get("/admin/finance");
        const finData = finRes.data.data || finRes.data;
        inc = finData?.income || 0;
        exp = finData?.expense || 0;
        bal = finData?.balance || 0;
      } catch (err) {
        console.error("Finance API error:", err);
      }

      // Set data ke masing-masing state pembentuk dashboard
      setStats({
        totalWarga: usersData.length,
        laporanAktif: pendingReports.length,
        suratPending: pendingSurat.length
      });
      setPendingSuratList(pendingSurat.slice(0, 5)); 
      setFinanceData({ income: inc, expense: exp, balance: bal });

    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const getFinancePercentage = () => {
    if (financeData.income === 0) return 0;
    const pct = (financeData.expense / financeData.income) * 100;
    return Math.min(100, Math.max(0, pct)).toFixed(1);
  };

  const SUMMARY_STATS = [
    { label: "Total Penduduk", value: stats.totalWarga, sub: "Data Terverifikasi", icon: Users, color: "blue" },
    { label: "Pengajuan Surat", value: stats.suratPending, sub: "Butuh Validasi", icon: Files, color: "indigo" },
    { label: "Aduan Publik", value: stats.laporanAktif, sub: "Status Aktif", icon: AlertTriangle, color: "amber" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased flex">
      
      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tighter text-xl leading-none">ADMIN</span>
            <span className="text-[10px] font-black text-indigo-600 tracking-[0.3em] mt-1">DIGIDESA</span>
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
            { n: "Pengaturan", i: Settings, p: "/admin/pengaturan" },   
          ].map((item) => (
            <button
              key={item.n}
              onClick={() => {
                setActiveTab(item.n);
                if (item.p !== "#") navigate(item.p);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 ${
                activeMenu === item.n 
                ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-200/20" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.i size={18} strokeWidth={activeMenu === item.n ? 3 : 2.5} />
              {item.n}
            </button>
          ))}         
        </nav>

        

        <div className="p-8">
          <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
               <ShieldCheck className="text-emerald-500" size={20} />
            </div>
            <p className="text-slate-900 text-[11px] font-black uppercase">Sistem Terenkripsi</p>
            <p className="text-slate-400 text-[9px] mt-1 font-medium italic">Otoritas Super Admin</p>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-h-screen">
        
        {/* EXECUTIVE HEADER */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-10 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Panel Eksekutif Desa</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Digital Hub • Real-time Monitoring</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Cari NIK atau Nama..." 
                className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-12 pr-4 text-xs font-bold focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-200 transition-all w-64"
              />
            </div>
            <button className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm">
              <Bell size={20} strokeWidth={2.5} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
              <div className="text-right">
                <p className="text-[13px] font-black text-slate-900 leading-none">Admin Desa</p>
                <p className="text-[10px] font-bold text-indigo-600 mt-1 uppercase tracking-widest">Otoritas Pusat</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black border-2 border-white shadow-sm">AD</div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-10 space-y-10 max-w-7xl mx-auto w-full">
          
          {/* BRIGHT STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUMMARY_STATS.map((s, i) => (
              <motion.div 
                key={s.label} initial="hidden" animate="visible" variants={FADE_UP} custom={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-900/5 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div className={`w-14 h-14 rounded-2xl bg-${s.color}-50 flex items-center justify-center transition-colors group-hover:bg-${s.color}-600`}>
                    <s.icon className={`text-${s.color}-600 group-hover:text-white transition-colors`} size={24} strokeWidth={2.5} />
                  </div>
                  <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
                    Detail
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{s.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{loading ? "..." : s.value}</h3>
                  <div className="flex items-center gap-1.5 mt-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">{s.sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* ── CLEAN TABLE: VALIDASI SURAT ── */}
            <motion.div 
              initial="hidden" animate="visible" variants={FADE_UP} custom={4}
              className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-white">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Menunggu Validasi</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Antrian Berkas Masuk</p>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => navigate('/admin/validasi')} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-xl text-[11px] font-black text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                    Lihat Semua
                   </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-50">
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Pemohon</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Jenis Layanan</th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pendingSuratList.length > 0 ? (
                      pendingSuratList.map((row, idx) => (
                        <tr key={idx} className="group hover:bg-indigo-50/30 transition-colors">
                          <td className="px-10 py-7">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                {row.user?.name ? row.user.name.charAt(0).toUpperCase() : '?'}
                              </div>
                              {/* FIXED: Menggunakan optional chaining (?.) agar aman dari crash */}
                              <div>
                                <p className="text-sm font-black text-slate-900">{row.user?.name || row.namaWarga || 'Anonim'}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                                  NIK: {row.user?.nik || row.nikWarga || '-'} • {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-7">
                            <span className="px-3 py-1.5 bg-slate-50 rounded-lg text-[11px] font-black text-slate-700 border border-slate-100">
                              {row.jenisSurat?.replace(/_/g, ' ') || 'SURAT'}
                            </span>
                          </td>
                          <td className="px-10 py-7">
                            <button onClick={() => navigate('/admin/validasi')} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 uppercase tracking-widest">
                              Validasi
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-10 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                          Tidak ada surat menunggu validasi
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* ── RIGHT COLUMN: QUICK TOOLS ── */}
            <motion.div 
              initial="hidden" animate="visible" variants={FADE_UP} custom={5}
              className="space-y-10"
            >
              <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-xl shadow-indigo-600/20 group cursor-pointer hover:bg-indigo-700 transition-all" onClick={() => navigate('/admin/penduduk')}>
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Plus size={28} strokeWidth={3} />
                </div>
                <h3 className="text-xl font-black tracking-tight">Daftarkan Warga</h3>
                <p className="text-sm font-medium text-indigo-100/70 mt-2 leading-relaxed">Tambahkan penduduk baru ke database secara instan.</p>
                <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  Klik untuk Memulai <ChevronRight size={14} />
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm">
                <h3 className="font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <BarChart3 size={20} className="text-emerald-600" strokeWidth={3} />
                   </div>
                   Status Finansial
                </h3>
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between text-[11px] font-black mb-3 px-1">
                      <span className="text-slate-400 uppercase tracking-widest">Realisasi Dana</span>
                      <span className="text-emerald-600">{getFinancePercentage()}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${getFinancePercentage()}%` }} className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}