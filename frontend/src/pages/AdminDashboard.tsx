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
  Search,
  Bell,
  ChevronRight,
  ShieldCheck,
  Building2,
  Settings,
  Clock,
  Plus
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";

const EASE_SPRING = [0.16, 1, 0.3, 1];

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: EASE_SPRING }
  })
};

const formatTanggal = (raw?: string) => {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

export default function AdminDashboard() {
  const navigate = useNavigate();
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
      const usersRes = await api.get("/users");
      const usersData = usersRes.data.data || usersRes.data || [];
      
      const suratRes = await api.get("/surat");
      const suratData = suratRes.data.data || suratRes.data || [];
      const pendingSurat = suratData.filter((s: any) => s.status === 'PENDING' || s.status === 'pending');
      
      const reportsRes = await api.get("/reports");
      const reportsData = reportsRes.data.data || reportsRes.data || [];
      const pendingReports = reportsData.filter((r: any) => r.status === 'PENDING' || r.status === 'DIPROSES');

      let inc = 0, exp = 0, bal = 0;
      try {
        const finRes = await api.get("/admin/finance");
        const finData = finRes.data.data || finRes.data;
        inc = finData?.income || 0;
        exp = finData?.expense || 0;
        bal = finData?.balance || 0;
      } catch (err) {}

      setStats({
        totalWarga: usersData.length,
        laporanAktif: pendingReports.length,
        suratPending: pendingSurat.length
      });
      // Ambil 5 antrian surat teratas
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
    { label: "Total Penduduk", value: stats.totalWarga, sub: "Data Terverifikasi", icon: Users, color: "slate" },
    { label: "Pengajuan Surat", value: stats.suratPending, sub: "Butuh Validasi", icon: Files, color: "red" },
    { label: "Aduan Publik", value: stats.laporanAktif, sub: "Status Aktif", icon: AlertTriangle, color: "amber" },
  ];

  return (
    <AdminLayout activeMenu="Overview" title="Panel Eksekutif Desa" subtitle="Real-time Monitoring">
        {/* CONTENT AREA */}
        <div className="space-y-8 max-w-7xl mx-auto w-full">
          
          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUMMARY_STATS.map((s, i) => (
              <motion.div 
                key={s.label} initial="hidden" animate="visible" variants={FADE_UP} custom={i}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center gap-5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${s.color}-50 flex items-center justify-center shrink-0 group-hover:bg-${s.color}-100 transition-colors`}>
                  <s.icon className={`text-${s.color}-600`} size={26} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">{loading ? "..." : s.value}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">{s.sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ── CLEAN TABLE: VALIDASI SURAT ── */}
            <motion.div 
              initial="hidden" animate="visible" variants={FADE_UP} custom={3}
              className="lg:col-span-2 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Menunggu Validasi</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">Antrian Berkas Masuk Terbaru</p>
                </div>
                <button onClick={() => navigate('/admin/validasi')} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200">
                 Lihat Semua
                </button>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pemohon</th>
                      <th className="px-8 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Layanan</th>
                      <th className="px-8 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tgl Diajukan</th>
                      <th className="px-8 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingSuratList.length > 0 ? (
                      pendingSuratList.map((row, idx) => {
                        // Perbaikan binding data
                        const namaPemohon = row.user?.nama_lengkap || row.user?.namaLengkap || row.user?.username || row.namaWarga || 'Warga';
                        const nikPemohon = row.user?.nik || row.nikWarga || '-';
                        const jenisLayanan = row.jenisSurat?.replace(/_/g, ' ') || row.jenis_surat?.replace(/_/g, ' ') || 'SURAT KETERANGAN';

                        return (
                          <tr key={row.id || idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                                  {namaPemohon.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{namaPemohon}</p>
                                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">NIK: {nikPemohon}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <span className="px-2.5 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600">
                                {jenisLayanan}
                              </span>
                            </td>
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <Clock size={14} />
                                {formatTanggal(row.tgl_diajukan || row.tglDiajukan || row.createdAt)}
                              </div>
                            </td>
                            <td className="px-8 py-4 text-right">
                              <button onClick={() => navigate('/admin/validasi')} className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-red-100">
                                Validasi
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-16 text-center text-slate-400 text-sm font-medium">
                          Tidak ada antrian surat yang perlu divalidasi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* ── RIGHT COLUMN: QUICK TOOLS ── */}
            <motion.div 
              initial="hidden" animate="visible" variants={FADE_UP} custom={4}
              className="space-y-6"
            >
              {/* DAFTARKAN WARGA (Refined Design) */}
              <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 mb-5">
                  <Plus size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Daftarkan Warga Baru</h3>
                <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
                  Tambahkan profil kependudukan warga ke dalam sistem agar mereka dapat menggunakan layanan.
                </p>
                <button 
                  onClick={() => navigate('/admin/penduduk')}
                  className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md shadow-red-600/20"
                >
                  Registrasi Sekarang
                </button>
              </div>

              {/* STATUS FINANSIAL */}
              <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
                <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                  <BarChart3 size={18} className="text-emerald-500" />
                  Status Finansial
                </h3>
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500">Realisasi Anggaran</span>
                    <span className="text-emerald-600">{getFinancePercentage()}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${getFinancePercentage()}%` }} className="h-full bg-emerald-500" />
                  </div>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
    </AdminLayout>
  );
}