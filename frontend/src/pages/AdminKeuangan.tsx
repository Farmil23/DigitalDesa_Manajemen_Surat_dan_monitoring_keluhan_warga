import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowLeft,
  LayoutDashboard,
  Files,
  AlertTriangle,
  Users,
  Settings,
  Building2,
  Calendar,
  PieChart,
  Loader2,
  Plus,
  X,
  Pencil,
  Trash2,
  Eye,
  ImageIcon,
  User,
  CheckCircle2,
} from "lucide-react";

export default function AdminKeuangan() {
  const navigate = useNavigate();
  const [financeData, setFinanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState<any>(null);

  const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [dateFilter, setDateFilter] = useState<string>("");

  const [formData, setFormData] = useState<any>({
    title: "",
    type: "INCOME",
    amount: "",
    category: "",
    description: "",
    recipient: "",
    evidence: null,
    transaction_date: new Date().toISOString().split("T")[0],
  });

  // Sesuaikan URL ke port Spring Boot kamu (Ganti ke 8080 jika Java kamu pakai port default)
  const BASE_URL = "http://localhost:5000/api/v1/admin/finance"; 

  const fetchFinanceData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success || res.data) {
        // Ambil data dari pembungkus response Spring Boot
        setFinanceData(res.data.data || res.data);
      }
    } catch (error) {
      console.error("Gagal ambil data keuangan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "evidence" && formData[key]) {
        data.append("evidence", formData[key]);
      } else if (key !== "evidence") {
        data.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem("token");
      const url = isEditMode ? `${BASE_URL}/${selectedId}` : BASE_URL;
      const method = isEditMode ? "put" : "post";

      const res = await axios({
        method: method,
        url: url,
        data: data,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success || res.data) {
        alert(isEditMode ? "Transaksi diperbarui!" : "Transaksi berhasil dicatat!");
        closeModal();
        fetchFinanceData();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal memproses transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus riwayat transaksi ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchFinanceData();
      } catch (error) {
        alert("Gagal menghapus data");
      }
    }
  };

  const openEditModal = (trx: any) => {
    setIsEditMode(true);
    setSelectedId(trx.id);
    
    // Sinkronisasi pembacaan field snake_case dari Spring Boot @JsonProperty
    setFormData({
      title: trx.title,
      type: trx.type?.toUpperCase() || "INCOME",
      amount: trx.amount,
      category: trx.category || "",
      description: trx.description || "",
      recipient: trx.recipient || "",
      evidence: null,
      transaction_date: trx.transaction_date || trx.transactionDate || new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const openDetail = (trx: any) => {
    setSelectedTrx(trx);
    setIsDetailOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedId(null);
    setFormData({
      title: "",
      type: "INCOME",
      amount: "",
      category: "",
      description: "",
      recipient: "",
      evidence: null,
      transaction_date: new Date().toISOString().split("T")[0],
    });
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // SINKRONISASI FILTER: Mendukung pembacaan 'transaction_date' maupun 'transactionDate' dari Java
  const filteredTransactions =
    financeData?.transactions?.filter((t: any) => {
      const matchType = typeFilter === "ALL" || t.type?.toUpperCase() === typeFilter || (typeFilter === "INCOME" && t.type?.toUpperCase() === "PEMASUKAN") || (typeFilter === "EXPENSE" && t.type?.toUpperCase() === "PENGELUARAN");
      const rawDate = t.transaction_date || t.transactionDate || "";
      const itemDate = rawDate ? rawDate.split("T")[0] : "";
      const matchDate = !dateFilter || itemDate === dateFilter;

      return matchType && matchDate;
    }) || [];

  const menuItems = [
    { n: "Overview", i: LayoutDashboard, p: "/admin" },
    { n: "Validasi Surat", i: Files, p: "/admin/validasi" },
    { n: "Moderasi Lapor", i: AlertTriangle, p: "/admin/laporan" },
    { n: "Data Penduduk", i: Users, p: "/admin/penduduk" },
    { n: "Keuangan Desa", i: BarChart3, p: "/admin/keuangan", active: true },
    { n: "Pengaturan", i: Settings, p: "/admin/pengaturan" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-500">
            Sinkronisasi data kas desa...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased flex">
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-50">
        <div
          className="px-7 py-7 flex items-center gap-3 cursor-pointer border-b border-slate-100"
          onClick={() => navigate("/admin")}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 tracking-tight leading-none">DigiDesa</p>
            <p className="text-xs text-slate-500 mt-1">Panel Admin Desa</p>
          </div>
        </div>

        <nav className="flex-1 px-5 py-6 space-y-1.5">
          <p className="px-3 mb-3 text-xs font-semibold text-slate-400">Navigasi</p>
          {menuItems.map((item) => {
            const Icon = item.i;
            return (
              <button
                key={item.n}
                onClick={() => navigate(item.p)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  item.active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} strokeWidth={item.active ? 2.6 : 2.2} />
                {item.n}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate("/admin")}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-950 tracking-tight truncate">Transparansi Keuangan</h1>
              <p className="text-sm text-slate-500 mt-1 truncate">Pantau pemasukan, pengeluaran, bukti nota, dan saldo kas desa.</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shrink-0"
          >
            <Plus size={17} strokeWidth={2.5} />
            Tambah transaksi
          </button>
        </header>

        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
          {/* CARD STATS GRID (SINKRON DENGAN DATA SPRING BOOT) */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <button
              type="button"
              onClick={() => setTypeFilter("ALL")}
              className={`text-left p-6 rounded-2xl border transition-all ${
                typeFilter === "ALL" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white border-slate-200 hover:border-blue-200"
              }`}
            >
              <p className={`text-sm font-semibold ${typeFilter === "ALL" ? "text-blue-100" : "text-slate-500"}`}>Saldo kas desa</p>
              <h3 className="text-2xl font-bold mt-2 tracking-tight truncate">
                {formatIDR(financeData?.summary?.balance || financeData?.balance)}
              </h3>
              <p className={`text-xs font-medium mt-4 flex items-center gap-1.5 ${typeFilter === "ALL" ? "text-blue-100" : "text-blue-600"}`}>
                <CheckCircle2 size={14} className="shrink-0" />
                <span className="truncate">{typeFilter === "ALL" ? "Semua transaksi tampil" : "Klik untuk reset filter"}</span>
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("INCOME")}
              className={`text-left p-6 rounded-2xl border transition-all bg-white ${
                typeFilter === "INCOME" ? "border-emerald-300 shadow-sm" : "border-slate-200 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">Total pemasukan</p>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeFilter === "INCOME" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600"}`}>
                  <TrendingUp size={19} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mt-2 tracking-tight text-slate-950 truncate">
                {formatIDR(financeData?.summary?.total_income || financeData?.summary?.income || financeData?.total_income || financeData?.income)}
              </h3>
              <p className={`text-xs font-medium mt-4 ${typeFilter === "INCOME" ? "text-emerald-700" : "text-slate-500"}`}>
                {typeFilter === "INCOME" ? "Filter pemasukan aktif" : "Klik untuk filter"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("EXPENSE")}
              className={`text-left p-6 rounded-2xl border transition-all bg-white ${
                typeFilter === "EXPENSE" ? "border-red-300 shadow-sm" : "border-slate-200 hover:border-red-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">Total pengeluaran</p>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeFilter === "EXPENSE" ? "bg-red-600 text-white" : "bg-red-50 text-red-600"}`}>
                  <TrendingDown size={19} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mt-2 tracking-tight text-slate-950 truncate">
                {formatIDR(financeData?.summary?.total_expense || financeData?.summary?.expense || financeData?.total_expense || financeData?.expense)}
              </h3>
              <p className={`text-xs font-medium mt-4 ${typeFilter === "EXPENSE" ? "text-red-700" : "text-slate-500"}`}>
                {typeFilter === "EXPENSE" ? "Filter pengeluaran aktif" : "Klik untuk filter"}
              </p>
            </button>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">Dana siaga</p>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Wallet size={19} />
                </div>
              </div>
              <h3 className="text-2xl font-bold mt-2 tracking-tight text-slate-950 truncate">
                {formatIDR(((financeData?.summary?.balance || financeData?.balance) || 0) * 0.2)}
              </h3>
              <p className="text-xs font-medium mt-4 text-slate-500">Estimasi 20% dari saldo kas</p>
            </div>
          </section>

          {/* TABEL DATA SINKRON DENGAN LIST SPRING BOOT */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
              <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-950 truncate">
                    Riwayat {typeFilter === "ALL" ? "Semua" : typeFilter === "INCOME" ? "Pemasukan" : "Pengeluaran"} Transaksi
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Data riwayat transaksi kas terhubung langsung ke MySQL lokal.</p>
                </div>
                <div className="relative flex items-center shrink-0">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl py-2.5 pl-10 pr-9 text-slate-700 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                  <Calendar size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                  {dateFilter && (
                    <button type="button" onClick={() => setDateFilter("")} className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200 transition-colors">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-hidden">
                <table className="w-full table-fixed text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="w-[42%] px-5 py-4 text-xs font-semibold text-slate-500">Deskripsi & penerima</th>
                      <th className="w-[18%] px-5 py-4 text-xs font-semibold text-slate-500 text-center">Kategori</th>
                      <th className="w-[22%] px-5 py-4 text-xs font-semibold text-slate-500 text-right">Nominal</th>
                      <th className="w-[18%] px-5 py-4 text-xs font-semibold text-slate-500 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((t: any) => {
                          const isIncome = t.type?.toUpperCase() === "INCOME" || t.type?.toUpperCase() === "PEMASUKAN";
                          const rawDate = t.transaction_date || t.transactionDate || t.created_at || t.createdAt;

                          return (
                            <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-5 py-5 min-w-0">
                                <p className="text-sm font-bold text-slate-950 leading-snug truncate">{t.title}</p>
                                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5 min-w-0">
                                  <User size={12} className="shrink-0" />
                                  <span className="truncate">{t.recipient || "Internal"}</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-1 truncate">
                                  {rawDate ? new Date(rawDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                                </p>
                              </td>
                              <td className="px-5 py-5 text-center">
                                <span className="inline-flex max-w-full px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold truncate">
                                  {t.category || "General"}
                                </span>
                              </td>
                              <td className={`px-5 py-5 text-sm font-bold text-right truncate ${isIncome ? "text-emerald-600" : "text-red-600"}`}>
                                {isIncome ? "+ " : "- "} {formatIDR(t.amount)}
                              </td>
                              <td className="px-5 py-5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button onClick={() => openDetail(t)} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center">
                                    <Eye size={14} />
                                  </button>
                                  <button onClick={() => openEditModal(t)} className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center">
                                    <Pencil size={14} />
                                  </button>
                                  <button onClick={() => handleDelete(t.id)} className="w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all flex items-center justify-center">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-14 text-center">
                            <p className="text-sm font-semibold text-slate-500">Tidak ada riwayat transaksi ditemukan.</p>
                            <p className="text-xs text-slate-400 mt-1">Coba isi mutasi kas baru dari tombol di atas.</p>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* STATISTIK SAMPING */}
            <div className="space-y-6 min-w-0">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="font-bold text-slate-950 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <PieChart size={19} />
                  </div>
                  Statistik Belanja
                </h3>
                <div className="space-y-5">
                  {[
                    { label: "Infrastruktur", val: 45, color: "bg-blue-500" },
                    { label: "Bantuan Sosial", val: 30, color: "bg-emerald-500" },
                    { label: "Operasional", val: 25, color: "bg-amber-500" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm font-semibold mb-2">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="text-slate-900">{item.val}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
                <h4 className="text-sm font-semibold mb-2 text-slate-400">Target penyerapan</h4>
                <p className="text-4xl font-bold tracking-tight leading-none">94.2%</p>
                <div className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[94.2%] rounded-full" />
                </div>
                <p className="text-xs font-medium mt-4 text-slate-400">Monitoring kas DigiDesa v1.0</p>
              </div>
            </div>
          </section>
        </div>

        {/* MODAL AUDIT RINCIAN */}
        <AnimatePresence>
          {isDetailOpen && selectedTrx && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                <div className="flex-1 p-8 lg:p-10 border-r border-slate-100">
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <Files size={21} />
                    </div>
                    <button onClick={() => setIsDetailOpen(false)} className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-500">
                      <X size={19} />
                    </button>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Rincian Audit</h2>
                  <p className="text-sm text-slate-500 mt-1 mb-8">Transaksi ID: #{selectedTrx.id} • {new Date().getFullYear()}</p>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-5 py-3 border-b border-dashed border-slate-200">
                      <span className="font-medium text-slate-500">Tanggal nota</span>
                      <span className="font-semibold text-slate-900 text-right">
                        {new Date(selectedTrx.transaction_date || selectedTrx.transactionDate || selectedTrx.created_at || selectedTrx.createdAt).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex justify-between gap-5 py-3 border-b border-dashed border-slate-200">
                      <span className="font-medium text-slate-500">Kegiatan</span>
                      <span className="font-semibold text-slate-900 text-right">{selectedTrx.title}</span>
                    </div>
                    <div className="flex justify-between gap-5 py-3 border-b border-dashed border-slate-200">
                      <span className="font-medium text-slate-500">Penerima dana</span>
                      <span className="font-semibold text-blue-600 text-right">{selectedTrx.recipient || "Bendahara Desa"}</span>
                    </div>
                    <div className="flex justify-between gap-5 py-3 border-b border-dashed border-slate-200">
                      <span className="font-medium text-slate-500">Nominal</span>
                      <span className={`text-lg font-bold text-right ${ (selectedTrx.type?.toUpperCase() === "INCOME" || selectedTrx.type?.toUpperCase() === "PEMASUKAN") ? "text-emerald-600" : "text-red-600" }`}>
                        {formatIDR(selectedTrx.amount)}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl mt-8 border border-slate-200">
                      <p className="text-sm font-semibold text-slate-500">Total saldo setelah transaksi</p>
                      <p className="text-xl font-bold text-slate-950 mt-1">{formatIDR(selectedTrx.current_balance || selectedTrx.currentBalance || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[400px] bg-slate-50 p-8 lg:p-10 flex flex-col">
                  <p className="text-sm font-semibold text-slate-600 mb-4">Bukti kuitansi digital</p>
                  <div className="flex-1 min-h-[280px] rounded-2xl border border-slate-200 bg-slate-200 overflow-hidden relative">
                    {(selectedTrx.evidence_url || selectedTrx.evidenceUrl) ? (
                      <img src={`http://localhost:5000${selectedTrx.evidence_url || selectedTrx.evidenceUrl}`} className="w-full h-full object-cover" alt="Receipt" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                        <ImageIcon size={38} />
                        <p className="text-sm font-semibold">Foto nota kosong</p>
                      </div>
                    )}
                  </div>
                  <button className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-sm font-semibold mt-6 hover:bg-blue-600 transition-all">Download Bukti PDF</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL CATAT TRANSAKSI */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
              <motion.div initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }} className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl relative my-8">
                <button onClick={closeModal} className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-colors">
                  <X size={19} />
                </button>
                <h2 className="text-2xl font-bold text-slate-950 mb-1">{isEditMode ? "Edit Transaksi" : "Catat Transaksi"}</h2>
                <p className="text-sm text-slate-500 mb-8">Lengkapi data pencatatan arus kas desa.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "INCOME" })}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all ${ formData.type === "INCOME" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100" }`}
                    >
                      Pemasukan
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all ${ formData.type === "EXPENSE" ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100" }`}
                    >
                      Pengeluaran
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1.5 block">Judul Transaksi</label>
                    <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="Contoh: Dana Desa Tahap 1" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1.5 block">Penerima Dana / Vendor</label>
                    <input required type="text" value={formData.recipient} onChange={(e) => setFormData({ ...formData, recipient: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="Contoh: Toko Bangunan Jaya" />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-semibold text-slate-600 mb-1.5 block">Nominal (Rp)</label>
                      <input required type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600 mb-1.5 block">Kategori</label>
                      <input required type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" placeholder="Contoh: Infrastruktur" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1.5 block">Tanggal Transaksi</label>
                    <input required type="date" value={formData.transaction_date} onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all" />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-600 mb-1.5 block">Upload Kuitansi</label>
                    <input type="file" accept="image/*" onChange={(e: any) => setFormData({ ...formData, evidence: e.target.files[0] })} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>

                  <button type="submit" disabled={isSubmitting} className={`w-full py-3.5 mt-6 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex justify-center items-center ${ isEditMode ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-600 hover:bg-blue-700" }`}>
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isEditMode ? "Simpan Perubahan" : "Catat Transaksi"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}