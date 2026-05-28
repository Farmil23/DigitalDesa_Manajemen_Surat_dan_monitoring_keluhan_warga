import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Eye,
  Files,
  ImageIcon,
  LayoutDashboard,
  Loader2,
  PieChart,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
  X,
} from "lucide-react";

type FilterType = "ALL" | "INCOME" | "EXPENSE";

type FinanceSummary = {
  balance: number;
  total_income: number;
  total_expense: number;
};

type Transaction = {
  id: number | string;
  title?: string;
  type?: string;
  recipient?: string;
  category?: string;
  amount?: number;
  transaction_date?: string;
  transactionDate?: string;
  created_at?: string;
  createdAt?: string;
  current_balance?: number;
  currentBalance?: number;
  evidence_url?: string;
  evidenceUrl?: string;
};

type MenuItem = {
  n: string;
  i: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  p: string;
  active?: boolean;
};

const toNumber = (val: unknown) => {
  const num = typeof val === "number" ? val : Number(val);
  return Number.isFinite(num) ? num : 0;
};

const normalizeToYyyyMmDd = (raw?: string) => {
  if (!raw) return "";
  const trimmed = String(raw).trim();

  // ISO datetime or yyyy-MM-dd
  if (trimmed.includes("T")) return trimmed.split("T")[0] || "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  // dd/MM/yyyy (backend)
  const match = /^([0-3]\d)\/([01]\d)\/(\d{4})$/.exec(trimmed);
  if (match) {
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm}-${dd}`;
  }

  return trimmed;
};

const formatIDR = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);

const safeFormatTanggal = (raw?: string) => {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const safeFormatTanggalLengkap = (raw?: string) => {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

const getScopeLabel = (filter: FilterType) => {
  if (filter === "ALL") return "Semua";
  if (filter === "INCOME") return "Pemasukan";
  return "Pengeluaran";
};

const getBarColor = (label: string) => {
  if (label === "Infrastruktur") return "bg-blue-500";
  if (label === "Bantuan Sosial") return "bg-emerald-500";
  return "bg-amber-500";
};

const FinansialSidebar = ({ navigate, items }: { navigate: (path: string) => void; items: MenuItem[] }) => (
  <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col sticky top-0 h-screen z-50">
    <button type="button" className="w-full px-8 py-8 flex items-center gap-4 text-left border-b border-slate-50" onClick={() => navigate("/dashboard-warga")}>
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
        <Building2 className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-black text-slate-900 tracking-tight leading-none text-base">DIGI<span className="text-blue-600">DESA</span></p>
        <p className="text-xs text-slate-400 mt-1.5 font-semibold">Panel Warga Transparan</p>
      </div>
    </button>

    <nav className="flex-1 px-6 py-8 space-y-2">
      <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Navigasi Utama</p>
      {items.map((item) => {
        const Icon = item.i;
        return (
          <button
            key={item.n}
            onClick={() => navigate(item.p)}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              item.active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15" : "text-slate-600 hover:bg-blue-50/50 hover:text-blue-600"
            }`}
          >
            <Icon size={16} strokeWidth={2.5} />
            {item.n}
          </button>
        );
      })}
    </nav>
  </aside>
);

const MetricCard = ({
  title,
  value,
  helper,
  tone,
  icon,
  onClick,
  active,
}: {
  title: string;
  value: string;
  helper: string;
  tone: "blue" | "emerald" | "red" | "neutral";
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) => {
  const cardClass = (() => {
    if (tone === "blue") return active ? "bg-blue-600 text-white border-blue-600" : "bg-white border-slate-200 hover:border-blue-200";
    if (tone === "emerald") return active ? "bg-emerald-50 border-emerald-300 shadow-sm" : "bg-white border-slate-200 hover:border-emerald-200";
    if (tone === "red") return active ? "bg-red-50 border-red-300 shadow-sm" : "bg-white border-slate-200 hover:border-red-200";
    return "bg-white border-slate-200";
  })();

  const helperClass = (() => {
    if (tone === "blue") return active ? "text-blue-100" : "text-blue-600";
    if (tone === "emerald") return active ? "text-emerald-700" : "text-slate-500";
    if (tone === "red") return active ? "text-red-700" : "text-slate-500";
    return "text-slate-500";
  })();

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`text-left p-6 rounded-2xl border transition-all ${cardClass}`}>
        <p className={`text-sm font-semibold ${tone === "blue" && active ? "text-blue-100" : "text-slate-500"}`}>{title}</p>
        <h3 className={`text-2xl font-bold mt-2 tracking-tight truncate ${tone === "blue" && active ? "text-white" : "text-slate-950"}`}>{value}</h3>
        <p className={`text-xs font-medium mt-4 flex items-center gap-1.5 ${helperClass}`}>
          {icon}
          <span className="truncate">{helper}</span>
        </p>
      </button>
    );
  }

  return (
    <div className={`p-6 rounded-2xl border transition-all ${cardClass} flex flex-col justify-between`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <div className="shrink-0">{icon}</div>
      </div>
      <h3 className="text-2xl font-bold mt-2 tracking-tight text-slate-950 truncate">{value}</h3>
      <p className="text-xs font-medium mt-4 text-slate-500">{helper}</p>
    </div>
  );
};

const TransactionRow = ({ item, onOpen }: { item: Transaction; onOpen: (trx: Transaction) => void }) => {
  const isIncome = item.type?.toUpperCase() === "INCOME" || item.type?.toUpperCase() === "PEMASUKAN";
  const rawDate = item.transaction_date || item.transactionDate || item.created_at || item.createdAt;

  return (
    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/70 transition-colors">
      <td className="px-5 py-5 min-w-0">
        <p className="text-sm font-bold text-slate-950 leading-snug truncate">{item.title}</p>
        <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5 min-w-0">
          <User size={12} className="shrink-0" />
          <span className="truncate">{item.recipient || "Internal"}</span>
        </p>
        <p className="text-xs text-slate-400 mt-1 truncate">{safeFormatTanggal(rawDate)}</p>
      </td>
      <td className="px-5 py-5 text-center">
        <span className="inline-flex max-w-full px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold truncate">{item.category || "General"}</span>
      </td>
      <td className={`px-5 py-5 text-sm font-bold text-right truncate ${isIncome ? "text-emerald-600" : "text-red-600"}`}>
        {isIncome ? "+ " : "- "}{formatIDR(item.amount || 0)}
      </td>
      <td className="px-5 py-5 text-center">
        <button type="button" onClick={() => onOpen(item)} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center mx-auto shadow-sm">
          <Eye size={14} />
        </button>
      </td>
    </motion.tr>
  );
};

const SummaryBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div>
    <div className="flex justify-between text-sm font-semibold mb-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900">{value}%</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const DetailModal = ({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: Transaction | null;
  onClose: () => void;
}) => {
  if (!open || !item) return null;

  const isIncome = item.type?.toUpperCase() === "INCOME" || item.type?.toUpperCase() === "PEMASUKAN";
  const evidenceUrl = item.evidence_url || item.evidenceUrl;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm overflow-y-auto">
      <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100 my-8">
        <div className="flex-1 p-8 lg:p-10 border-r border-slate-100 bg-white">
          <div className="flex justify-between items-start mb-6">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Files size={20} />
            </div>
            <button type="button" onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all">
              <X size={18} />
            </button>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Rincian Audit</h2>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Mekanisme Transparansi Dana Desa</p>

          <div className="mt-8 space-y-2.5 text-xs font-bold">
            <div className="flex justify-between gap-5 py-3 border-b border-dashed border-slate-100">
              <span className="text-slate-400 font-medium">Tanggal Mutasi</span>
              <span className="text-slate-800 text-right">{safeFormatTanggalLengkap(item.transaction_date || item.transactionDate)}</span>
            </div>
            <div className="flex justify-between gap-5 py-3 border-b border-dashed border-slate-100">
              <span className="text-slate-400 font-medium">Uraian Kegiatan</span>
              <span className="text-slate-800 text-right">{item.title}</span>
            </div>
            <div className="flex justify-between gap-5 py-3 border-b border-dashed border-slate-100">
              <span className="text-slate-400 font-medium">Alokasi / Penerima</span>
              <span className="text-blue-600 text-right">{item.recipient || "Kas Internal"}</span>
            </div>
            <div className="flex justify-between gap-5 py-3 border-b border-dashed border-slate-100">
              <span className="text-slate-400 font-medium">Nominal Mutasi</span>
              <span className={`text-base font-black text-right ${isIncome ? "text-emerald-600" : "text-red-600"}`}>{formatIDR(item.amount || 0)}</span>
            </div>
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl mt-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arus Buku Kas Setelah Transaksi</p>
              <p className="text-lg font-black text-slate-900 mt-1">{formatIDR(item.current_balance || item.currentBalance || 0)}</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[380px] bg-slate-50/60 p-8 lg:p-10 flex flex-col justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Bukti Transaksi Fisik</p>
            <div className="aspect-[4/3] w-full rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden relative shadow-sm">
              {evidenceUrl ? (
                <img src={`http://localhost:5000${evidenceUrl}`} className="w-full h-full object-cover" alt="Kuitansi Desa" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <ImageIcon size={32} />
                  <p className="text-[11px] font-bold">Tidak ada unggahan nota fisik</p>
                </div>
              )}
            </div>
          </div>

          {evidenceUrl && (
            <a href={`http://localhost:5000${evidenceUrl}`} target="_blank" rel="noreferrer" className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl text-center shadow-md transition-all mt-6">
              Buka Lampiran Nota
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function Finansial() {
  const navigate = useNavigate();
  const [financeData, setFinanceData] = useState<{ summary: FinanceSummary; transactions: Transaction[] }>({ summary: { balance: 0, total_income: 0, total_expense: 0 }, transactions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<FilterType>("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const menuItems: MenuItem[] = [
    { n: "Dashboard Warga", i: LayoutDashboard, p: "/dashboard-warga" },
    { n: "Layanan Surat", i: Files, p: "/layanan" },
    { n: "Laporan Saya", i: AlertTriangle, p: "/lapor" },
    { n: "Transparansi Kas", i: BarChart3, p: "/finansial", active: true },
  ];

  useEffect(() => {
    const loadFinance = async () => {
      try {
        // Warga view should NOT hit /api/v1/admin/** (forbidden unless ADMIN).
        // Use /api/v1/finances and compute summary client-side.
        const res = await api.get("/finances");
        const list = Array.isArray(res.data?.data) ? (res.data.data as Transaction[]) : [];

        const sorted = [...list].sort((a, b) => toNumber(b.id) - toNumber(a.id));
        const totalIncome = sorted.reduce((acc, item) => {
          const type = String(item.type || "").toUpperCase();
          const isIncome = type === "INCOME" || type === "PEMASUKAN";
          return acc + (isIncome ? toNumber(item.amount) : 0);
        }, 0);
        const totalExpense = sorted.reduce((acc, item) => {
          const type = String(item.type || "").toUpperCase();
          const isExpense = type === "EXPENSE" || type === "PENGELUARAN";
          return acc + (isExpense ? toNumber(item.amount) : 0);
        }, 0);

        // Keep summary consistent with the visible totals.
        // `current_balance` from backend may be missing or inconsistent, so we compute it here.
        const computedBalance = totalIncome - totalExpense;

        setFinanceData({
          summary: {
            balance: computedBalance,
            total_income: totalIncome,
            total_expense: totalExpense,
          },
          transactions: sorted,
        });
      } catch (error) {
        console.error("Gagal ambil data keuangan warga:", error);
        setFinanceData({ summary: { balance: 0, total_income: 0, total_expense: 0 }, transactions: [] });
      } finally {
        setIsLoading(false);
      }
    };

    loadFinance();
  }, []);

  const filteredTransactions = financeData.transactions.filter((t) => {
    if (!t) return false;
    const type = String(t.type || "").toUpperCase();
    const matchType =
      typeFilter === "ALL" ||
      type === typeFilter ||
      (typeFilter === "INCOME" && (type === "PEMASUKAN" || type === "INCOME")) ||
      (typeFilter === "EXPENSE" && (type === "PENGELUARAN" || type === "EXPENSE"));
    const rawDate = t.transaction_date || t.transactionDate || t.created_at || t.createdAt || "";
    const itemDate = normalizeToYyyyMmDd(String(rawDate));
    const matchDate = !dateFilter || itemDate === dateFilter;
    return matchType && matchDate;
  });

  const summaryBalance = financeData.summary.balance;
  const summaryIncome = financeData.summary.total_income;
  const summaryExpense = financeData.summary.total_expense;
  const reserveFunds = summaryBalance * 0.2;
  const scope = getScopeLabel(typeFilter);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFEFF]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-500">Sinkronisasi data kas desa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFEFF] font-sans antialiased flex overflow-hidden">
      <FinansialSidebar navigate={navigate} items={menuItems} />

      <main className="flex-1 overflow-y-auto relative h-screen">
        <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => navigate("/dashboard-warga")} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0">
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-950 tracking-tight truncate">Transparansi Keuangan</h1>
              <p className="text-sm text-slate-500 mt-1 truncate">Pantau pemasukan, pengeluaran, bukti nota, dan saldo kas desa secara terbuka.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 shrink-0">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Teraudit Digital</p>
          </div>
        </header>

        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <MetricCard title="Saldo kas desa" value={formatIDR(summaryBalance)} helper={typeFilter === "ALL" ? "Semua transaksi tampil" : "Klik untuk reset filter"} tone="blue" active={typeFilter === "ALL"} onClick={() => setTypeFilter("ALL")} icon={<CheckCircle2 size={14} className={typeFilter === "ALL" ? "text-blue-100" : "text-blue-600"} />} />
            <MetricCard title="Total pemasukan" value={formatIDR(summaryIncome)} helper={typeFilter === "INCOME" ? "Filter pemasukan aktif" : "Klik untuk filter"} tone="emerald" active={typeFilter === "INCOME"} onClick={() => setTypeFilter("INCOME")} icon={<TrendingUp size={19} />} />
            <MetricCard title="Total pengeluaran" value={formatIDR(summaryExpense)} helper={typeFilter === "EXPENSE" ? "Filter pengeluaran aktif" : "Klik untuk filter"} tone="red" active={typeFilter === "EXPENSE"} onClick={() => setTypeFilter("EXPENSE")} icon={<TrendingDown size={19} />} />
            <MetricCard title="Dana siaga" value={formatIDR(reserveFunds)} helper="Estimasi 20% dari saldo kas" tone="neutral" icon={<Wallet size={19} />} />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
              <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-950 truncate">Riwayat {scope} Transaksi</h2>
                  <p className="text-sm text-slate-500 mt-1">Data riwayat kas terhubung langsung ke basis data terpusat.</p>
                </div>
                <div className="relative flex items-center shrink-0">
                  <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl py-2.5 pl-10 pr-9 text-slate-700 focus:bg-white" />
                  <Calendar size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="overflow-hidden">
                <table className="w-full table-fixed text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="w-[48%] px-5 py-4 text-xs font-semibold text-slate-500">Deskripsi & penerima</th>
                      <th className="w-[22%] px-5 py-4 text-xs font-semibold text-slate-500 text-center">Kategori</th>
                      <th className="w-[20%] px-5 py-4 text-xs font-semibold text-slate-500 text-right">Nominal</th>
                      <th className="w-[10%] px-5 py-4 text-xs font-semibold text-slate-500 text-center">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((item) => <TransactionRow key={item.id} item={item} onOpen={(trx) => { setSelectedTrx(trx); setIsDetailOpen(true); }} />)
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-14 text-center text-slate-400 text-sm font-medium">Tidak ada riwayat transaksi ditemukan.</td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6 min-w-0">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-950 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <PieChart size={19} />
                  </div>
                  Statistik Belanja
                </h3>
                <div className="space-y-5">
                  <SummaryBar label="Infrastruktur" value={45} color={getBarColor("Infrastruktur")} />
                  <SummaryBar label="Bantuan Sosial" value={30} color={getBarColor("Bantuan Sosial")} />
                  <SummaryBar label="Operasional" value={25} color={getBarColor("Operasional")} />
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
                <h4 className="text-sm font-semibold mb-2 text-slate-400">Target penyerapan anggaran</h4>
                <p className="text-4xl font-bold tracking-tight leading-none">94.2%</p>
                <div className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[94.2%] rounded-full" />
                </div>
                <p className="text-xs font-medium mt-4 text-slate-400">Monitoring Kas DigiDesa v1.0</p>
              </div>
            </div>
          </section>
        </div>

        <AnimatePresence>
          <DetailModal open={isDetailOpen} item={selectedTrx} onClose={() => setIsDetailOpen(false)} />
        </AnimatePresence>
      </main>
    </div>
  );
}