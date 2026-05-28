import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  Search,
  UserPlus,
  Filter,
  ArrowLeft,
  LayoutDashboard,
  Files,
  AlertTriangle,
  BarChart3,
  Settings,
  Building2,
  Loader2,
  X,
  Trash2,
  Pencil,
  ShieldAlert,
  UserCheck,
  Eye,
  FileText,
  SlidersHorizontal,
} from "lucide-react";

export default function AdminPenduduk() {
  const navigate = useNavigate();
  const [penduduk, setPenduduk] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState<"ALL" | "KK" | "PENDATANG" | "AUDIT">("ALL");
  const [rtFilter, setRtFilter] = useState("");
  const [rwFilter, setRwFilter] = useState("");
  const [viewMode, setViewMode] = useState<"INDIVIDU" | "KELUARGA">("INDIVIDU");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  const [selectedPenduduk, setSelectedPenduduk] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alasanTolak, setAlasanTolak] = useState("");

  const [formData, setFormData] = useState({
    nik: "",
    no_kk: "",
    nama_lengkap: "",
    alamat: "",
    rt: "",
    rw: "",
    no_hp: "",
    password: "",
    status_hubungan: "Kepala Keluarga",
    status_tinggal: "TETAP",
  });

  const fetchPenduduk = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/v1/admin/penduduk", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setPenduduk(res.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil data penduduk:", error);
    } finally { // <-- FIXED TYPO DI SINI
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPenduduk();
  }, []);

  const handleTambahWarga = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/v1/admin/penduduk",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert(res.data.message || "Warga berhasil ditambahkan!");
        closeFormModal();
        fetchPenduduk();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menambah warga");
    } finally { // <-- FIXED TYPO DI SINI
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (warga: any) => {
    setSelectedPenduduk(warga);
    setFormData({
      nik: warga.nik || "",
      no_kk: warga.no_kk || "",
      nama_lengkap: warga.nama_lengkap || "",
      alamat: warga.alamat || "",
      rt: warga.rt || "",
      rw: warga.rw || "",
      no_hp: warga.no_hp || "",
      status_hubungan: warga.status_hubungan || "Kepala Keluarga",
      status_tinggal: warga.status_tinggal || "TETAP",
      password: "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateWarga = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/v1/admin/penduduk/${selectedPenduduk.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("Data warga berhasil diperbarui!");
        closeFormModal();
        fetchPenduduk();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal memperbarui data warga");
    } finally { // <-- FIXED TYPO DI SINI
      setIsSubmitting(false);
    }
  };

  const handleVerifyAction = async (
    id: number,
    action: "ACC" | "REJECT"
  ) => {
    if (action === "REJECT" && !alasanTolak.trim()) {
      return alert("Mohon isi alasan penolakan berkas!");
    }

    if (!window.confirm("Apakah Anda yakin ingin mengeksekusi aksi ini?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const targetStatus = action === "ACC" ? "VERIFIED" : "DATA_REJECTED";

      const res = await axios.put(
        `http://localhost:5000/api/v1/admin/penduduk/${id}/verifikasi`,
        {
          statusAkun: targetStatus,
          alasanDitolak: action === "REJECT" ? alasanTolak : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert("Aksi audit akun warga sukses diproses!");
        setIsAuditModalOpen(false);
        setAlasanTolak("");
        fetchPenduduk();
      }
    } catch (error: any) {
      alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Gagal memproses audit akun"
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Yakin ingin menghapus data warga ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/v1/admin/penduduk/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        alert("Warga berhasil dihapus!");
        fetchPenduduk();
      } catch (error) {
        alert("Gagal menghapus warga.");
      }
    }
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedPenduduk(null);
    setFormData({
      nik: "",
      no_kk: "",
      nama_lengkap: "",
      no_hp: "",
      password: "",
      alamat: "",
      rt: "",
      rw: "",
      status_hubungan: "Kepala Keluarga",
      status_tinggal: "TETAP",
    });
  };

  const totalJiwa = penduduk.length;
  const totalKK = Array.from(new Set(penduduk.map((p) => p.no_kk).filter((kk) => kk))).length;
  const totalPendatang = penduduk.filter((p) => p.status_tinggal === "PENDATANG").length;
  const totalNeedAudit = penduduk.filter(
    (p) => p.status_akun === "PENDING_VERIFICATION"
  ).length;

  const filteredPenduduk = penduduk.filter((p) => {
    const matchSearch =
      p.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nik?.includes(searchQuery);

    const matchRt = !rtFilter || p.rt === rtFilter;
    const matchRw = !rwFilter || p.rw === rwFilter;

    let matchCard = true;

    if (typeFilter === "KK") matchCard = p.status_hubungan === "Kepala Keluarga";
    if (typeFilter === "PENDATANG") matchCard = p.status_tinggal === "PENDATANG";
    if (typeFilter === "AUDIT") {
      matchCard = p.status_akun === "PENDING_VERIFICATION";
    }

    return matchSearch && matchRt && matchRw && matchCard;
  });

  const groupedKeluarga = filteredPenduduk.reduce((acc: any, curr: any) => {
    const kk = curr.no_kk || "TANPA-KK";

    if (!acc[kk]) {
      acc[kk] = {
        no_kk: kk,
        kepala_keluarga:
          curr.status_hubungan === "Kepala Keluarga" ? curr.nama_lengkap : "Belum Ditentukan",
        alamat: curr.alamat || "Belum Mengisi",
        rt: curr.rt || "--",
        rw: curr.rw || "--",
        anggotaCount: 0,
      };
    }

    if (curr.status_hubungan === "Kepala Keluarga") {
      acc[kk].kepala_keluarga = curr.nama_lengkap;
    }

    acc[kk].anggotaCount += 1;
    return acc;
  }, {});

  const keluargaList = Object.values(groupedKeluarga);

  const menuItems = [
    { n: "Overview", i: LayoutDashboard, p: "/admin" },
    { n: "Validasi Surat", i: Files, p: "/admin/validasi" },
    { n: "Moderasi Lapor", i: AlertTriangle, p: "/admin/laporan" },
    { n: "Data Penduduk", i: Users, p: "/admin/penduduk", active: true },
    { n: "Keuangan Desa", i: BarChart3, p: "/admin/keuangan" },
    { n: "Pengaturan", i: Settings, p: "/admin/pengaturan" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased flex">
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-40">
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
                  item.active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} strokeWidth={item.active ? 2.6 : 2.2} />
                {item.n}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen relative">
        <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-30 px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin")}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-950 tracking-tight">
                Sistem Kependudukan
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Kelola data warga, kartu keluarga, domisili, dan verifikasi akun.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all"
          >
            <UserPlus size={17} strokeWidth={2.5} />
            Tambah warga
          </button>
        </header>

        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto w-full">
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <button
              type="button"
              onClick={() => setTypeFilter("ALL")}
              className={`text-left p-6 rounded-2xl border transition-all ${
                typeFilter === "ALL"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white border-slate-200 hover:border-blue-200"
              }`}
            >
              <p className={`text-sm font-semibold ${typeFilter === "ALL" ? "text-blue-100" : "text-slate-500"}`}>
                Total penduduk
              </p>
              <h3 className="text-3xl font-bold mt-2 tracking-tight">{totalJiwa} Warga</h3>
              <p className={`text-xs font-medium mt-4 ${typeFilter === "ALL" ? "text-blue-100" : "text-blue-600"}`}>
                {typeFilter === "ALL" ? "Semua data ditampilkan" : "Klik untuk reset filter"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("KK")}
              className={`text-left p-6 rounded-2xl border transition-all ${
                typeFilter === "KK"
                  ? "bg-white border-slate-900 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <p className="text-sm font-semibold text-slate-500">Kepala keluarga</p>
              <h3 className="text-3xl font-bold mt-2 tracking-tight text-slate-950">{totalKK} KK</h3>
              <p className={`text-xs font-medium mt-4 ${typeFilter === "KK" ? "text-slate-900" : "text-slate-500"}`}>
                {typeFilter === "KK" ? "Filter KK aktif" : "Klik untuk filter"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("PENDATANG")}
              className={`text-left p-6 rounded-2xl border transition-all ${
                typeFilter === "PENDATANG"
                  ? "bg-indigo-50 border-indigo-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-indigo-200"
              }`}
            >
              <p className="text-sm font-semibold text-slate-500">Warga pendatang</p>
              <h3 className="text-3xl font-bold mt-2 tracking-tight text-slate-950">
                {totalPendatang} Jiwa
              </h3>
              <p
                className={`text-xs font-medium mt-4 ${
                  typeFilter === "PENDATANG" ? "text-indigo-700" : "text-slate-500"
                }`}
              >
                {typeFilter === "PENDATANG" ? "Filter pendatang aktif" : "Klik untuk filter"}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setTypeFilter("AUDIT")}
              className={`text-left p-6 rounded-2xl border transition-all ${
                typeFilter === "AUDIT"
                  ? "bg-red-50 border-red-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-red-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">Butuh verifikasi</p>
                {totalNeedAudit > 0 && <span className="w-2.5 h-2.5 bg-red-500 rounded-full mt-1.5" />}
              </div>
              <h3 className={`text-3xl font-bold mt-2 tracking-tight ${totalNeedAudit > 0 ? "text-red-600" : "text-slate-950"}`}>
                {totalNeedAudit} Kasus
              </h3>
              <p className={`text-xs font-medium mt-4 ${typeFilter === "AUDIT" ? "text-red-700" : "text-slate-500"}`}>
                {typeFilter === "AUDIT" ? "Daftar verifikasi aktif" : "Klik untuk lihat audit"}
              </p>
            </button>
          </section>

          <section className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative w-full xl:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari nama atau NIK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <SlidersHorizontal size={15} className="text-slate-400" />
                <select
                  value={rtFilter}
                  onChange={(e) => setRtFilter(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="">Semua RT</option>
                  <option value="01">RT 01</option>
                  <option value="02">RT 02</option>
                  <option value="03">RT 03</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Filter size={15} className="text-slate-400" />
                <select
                  value={rwFilter}
                  onChange={(e) => setRwFilter(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="">Semua RW</option>
                  <option value="10">RW 10</option>
                  <option value="11">RW 11</option>
                </select>
              </div>

              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode("INDIVIDU")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "INDIVIDU"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Individu
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("KELUARGA")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === "KELUARGA"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Keluarga
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                {viewMode === "INDIVIDU" && (
                  <>
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500">Identitas warga</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500">Hubungan & domisili</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500">Wilayah RT/RW</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-center">
                          Status akun / aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {isLoading ? (
                        <tr>
                          <td colSpan={4} className="py-16 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                          </td>
                        </tr>
                      ) : filteredPenduduk.length > 0 ? (
                        filteredPenduduk.map((warga) => {
                          const isInvalid = warga.nik === "WARGA" || !warga.rt || !warga.rw;

                          return (
                            <tr key={warga.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                  <img
                                    className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200"
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${warga.nama_lengkap}`}
                                    alt="Avatar"
                                  />

                                  <div>
                                    <p className="text-sm font-bold text-slate-950 leading-none">
                                      {warga.nama_lengkap}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                                      NIK: {warga.nik}
                                      {isInvalid && (
                                        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded-md font-semibold">
                                          Perlu cek
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-5">
                                <div className="flex flex-wrap gap-2">
                                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                                    {warga.status_hubungan || "Anggota"}
                                  </span>

                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                      warga.status_tinggal === "PENDATANG"
                                        ? "bg-indigo-50 text-indigo-700"
                                        : "bg-emerald-50 text-emerald-700"
                                    }`}
                                  >
                                    {warga.status_tinggal || "TETAP"}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-5">
                                <p className="text-sm font-semibold text-slate-800">
                                  {warga.alamat || "Belum mengisi alamat"}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  RT {warga.rt || "--"} / RW {warga.rw || "--"}
                                </p>
                              </td>

                              <td className="px-6 py-5">
                                <div className="flex items-center justify-center gap-2">
                                  {warga.status_akun === "PENDING_VERIFICATION" ? (
                                    <button
                                      onClick={() => {
                                        setSelectedPenduduk(warga);
                                        setIsAuditModalOpen(true);
                                      }}
                                      className="px-3 py-1.5 bg-amber-500 text-white font-semibold text-xs rounded-lg hover:bg-amber-600 flex items-center gap-1.5 transition-all"
                                    >
                                      <Eye size={13} />
                                      Inspect KTP
                                    </button>
                                  ) : (
                                    <span
                                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                        warga.status_akun === "DATA_REJECTED"
                                          ? "bg-red-50 text-red-600"
                                          : warga.status_akun === "VERIFIED" || warga.status_akun?.startsWith("VERIFIED")
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      {warga.status_akun || "INCOMPLETE"}
                                    </span>
                                  )}

                                  <button
                                    onClick={() => handleEditClick(warga)}
                                    className="w-8 h-8 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-all flex items-center justify-center"
                                  >
                                    <Pencil size={15} />
                                  </button>

                                  <button
                                    onClick={() => handleDelete(warga.id)}
                                    className="w-8 h-8 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all flex items-center justify-center"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-14 text-center">
                            <p className="text-sm font-semibold text-slate-500">
                              Tidak ada data warga ditemukan.
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Coba ubah kata kunci pencarian atau filter wilayah.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </>
                )}

                {viewMode === "KELUARGA" && (
                  <>
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500">Nomor KK</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500">Kepala keluarga</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500">Domisili wilayah</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 text-center">Jumlah jiwa</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {keluargaList.length > 0 ? (
                        keluargaList.map((fam: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                  <FileText size={16} />
                                </div>

                                <span className="text-sm font-bold text-slate-950 tracking-tight">
                                  {fam.no_kk}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-5 text-sm font-semibold text-slate-800">
                              {fam.kepala_keluarga}
                            </td>

                            <td className="px-6 py-5">
                              <p className="text-sm font-semibold text-slate-700">{fam.alamat}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                RT {fam.rt} / RW {fam.rw}
                              </p>
                            </td>

                            <td className="px-6 py-5 text-center">
                              <span className="px-3 py-1 bg-slate-900 text-white font-semibold text-xs rounded-full">
                                {fam.anggotaCount} Jiwa
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-14 text-center">
                            <p className="text-sm font-semibold text-slate-500">
                              Tidak ada data kartu keluarga ditemukan.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          </section>
        </div>

        <AnimatePresence>
          {isAuditModalOpen && selectedPenduduk && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.96, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 16 }}
                className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
              >
                <div className="flex-1 p-8 lg:p-10 border-r border-slate-100">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                      <ShieldAlert size={21} />
                    </div>

                    <button
                      onClick={() => setIsAuditModalOpen(false)}
                      className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-500"
                    >
                      <X size={19} />
                    </button>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
                    Verifikasi Akun
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 mb-8">
                    Cocokkan data pendaftar dengan berkas KTP yang diunggah.
                  </p>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-5 py-3 border-b border-slate-100">
                      <span className="font-medium text-slate-500">Nama pendaftar</span>
                      <span className="font-semibold text-slate-900 text-right">
                        {selectedPenduduk.nama_lengkap}
                      </span>
                    </div>

                    <div className="flex justify-between gap-5 py-3 border-b border-slate-100">
                      <span className="font-medium text-slate-500">NIK input</span>
                      <span className="font-semibold text-slate-900 text-right">
                        {selectedPenduduk.nik}
                      </span>
                    </div>

                    <div className="flex justify-between gap-5 py-3 border-b border-slate-100">
                      <span className="font-medium text-slate-500">No kartu keluarga</span>
                      <span className="font-semibold text-blue-600 text-right">
                        {selectedPenduduk.no_kk || "Belum diisi"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-5 py-3 border-b border-slate-100">
                      <span className="font-medium text-slate-500">Hubungan / domisili</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {selectedPenduduk.status_hubungan} • {selectedPenduduk.status_tinggal}
                      </span>
                    </div>

                    <div className="pt-4">
                      <label className="text-xs font-semibold text-red-600 mb-2 block">
                        Alasan penolakan
                      </label>
                      <textarea
                        value={alasanTolak}
                        onChange={(e) => setAlasanTolak(e.target.value)}
                        placeholder="Contoh: Foto KTP buram, mohon unggah ulang berkas asli."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium outline-none focus:border-red-300 focus:ring-4 focus:ring-red-500/10 h-20 resize-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[420px] bg-slate-50 p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-4">
                      Berkas gambar terunggah
                    </p>

                    <div className="w-full min-h-[220px] rounded-2xl border border-slate-200 bg-slate-200 overflow-hidden relative flex items-center justify-center">
                      {selectedPenduduk.foto_ktp ? (
                        <img
                          src={`http://localhost:5000/${selectedPenduduk.foto_ktp}`}
                          className="w-full h-auto max-h-[260px] object-cover rounded-2xl"
                          alt="Berkas KTP Warga"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Gambar+KTP+Tidak+Ditemukan";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-sm font-semibold p-6">
                          Foto KTP tidak ada
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <button
                      onClick={() => handleVerifyAction(selectedPenduduk.id, "ACC")}
                      className="w-full py-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <UserCheck size={14} />
                      ACC Berkas
                    </button>

                    <button
                      onClick={() => handleVerifyAction(selectedPenduduk.id, "REJECT")}
                      className="w-full py-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl hover:bg-red-600 hover:text-white transition-all"
                    >
                      Tolak berkas
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(isModalOpen || isEditModalOpen) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.96, y: 16 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.96, y: 16 }}
                className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl relative my-8"
              >
                <button
                  onClick={closeFormModal}
                  className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
                >
                  <X size={19} />
                </button>

                <h2 className="text-2xl font-bold text-slate-950 mb-1">
                  {isEditModalOpen ? "Edit Data Warga" : "Tambah Warga Desa"}
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Lengkapi data alamat dan kependudukan warga.
                </p>

                <form
                  onSubmit={isEditModalOpen ? handleUpdateWarga : handleTambahWarga}
                  className="space-y-4 text-sm"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1.5">NIK KTP</label>
                      <input
                        required
                        type="text"
                        value={formData.nik}
                        onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="16 digit NIK"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-600 block mb-1.5">Nomor KK</label>
                      <input
                        required
                        type="text"
                        value={formData.no_kk}
                        onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="16 digit KK"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1.5">Nama Lengkap</label>
                    <input
                      required
                      type="text"
                      value={formData.nama_lengkap}
                      onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="Sesuai KTP"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1.5">
                        Hubungan Keluarga
                      </label>
                      <select
                        value={formData.status_hubungan}
                        onChange={(e) => setFormData({ ...formData, status_hubungan: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-medium outline-none cursor-pointer focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      >
                        <option value="Kepala Keluarga">Kepala Keluarga</option>
                        <option value="Istri">Istri</option>
                        <option value="Anak">Anak</option>
                        <option value="Anggota Keluarga">Anggota Keluarga</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-600 block mb-1.5">
                        Status Domisili
                      </label>
                      <select
                        value={formData.status_tinggal}
                        onChange={(e) => setFormData({ ...formData, status_tinggal: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-medium outline-none cursor-pointer focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      >
                        <option value="TETAP">Warga Tetap</option>
                        <option value="PENDATANG">Warga Pendatang</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1.5">Alamat Rumah</label>
                    <input
                      required
                      type="text"
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      placeholder="Nama jalan atau blok"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1.5">RT</label>
                      <input
                        required
                        type="text"
                        value={formData.rt}
                        onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="001"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-600 block mb-1.5">RW</label>
                      <input
                        required
                        type="text"
                        value={formData.rw}
                        onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="010"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-600 block mb-1.5">No WA</label>
                      <input
                        required
                        type="text"
                        value={formData.no_hp}
                        onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="08xxx"
                      />
                    </div>
                  </div>

                  {!isEditModalOpen && (
                    <div>
                      <label className="font-semibold text-slate-600 block mb-1.5">
                        Password Akun
                      </label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-medium focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                        placeholder="Kosongkan jika default pakai NIK"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 mt-4 text-white rounded-xl font-semibold shadow-sm transition-all ${
                      isEditModalOpen
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : isEditModalOpen ? (
                      "Simpan Perubahan"
                    ) : (
                      "Daftarkan Warga"
                    )}
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