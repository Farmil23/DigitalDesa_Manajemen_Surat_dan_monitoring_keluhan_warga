import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api";
import { 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  Filter,
  MessageCircle,
  LayoutDashboard,
  Files,
  Users,
  BarChart3,
  Settings,
  Building2,
  X,
  UserCheck,
  Clipboard,
  AlertCircle,
  Activity,
  LogOut
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";

// ─── STYLING CONFIG ───────────────────────────────────────────────────────────
const EASE_SPRING = [0.16, 1, 0.3, 1] as const;

type ComplaintItem = {
  id: number;
  kodePengaduan?: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  lokasi: string;
  prioritas: string;
  status: string;
  fotoBukti?: string;
  alasanDitolak?: string;
  tanggalDiproses?: string;
  tanggalSelesai?: string;
  createdAt?: string;
  pelaporNik?: string;
  pelaporNama?: string;
  petugasId?: number;
  petugasNama?: string;
  catatanPetugas?: string;
};

type PetugasItem = {
  id: number;
  nama_lengkap: string;
  username: string;
};

type StatusPengaduan = "PENDING" | "DITUGASKAN" | "DIPROSES" | "SELESAI" | "DITOLAK";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
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

const getPriorityBadgeClass = (p?: string) => {
  const norm = (p || "").toUpperCase();
  if (norm === "DARURAT") return "bg-red-100 text-red-700 border border-red-200";
  if (norm === "TINGGI") return "bg-amber-100 text-amber-700 border border-amber-200";
  if (norm === "RENDAH") return "bg-slate-100 text-slate-700 border border-slate-200";
  return "bg-red-100 text-red-700 border border-blue-200"; // SEDANG
};

const getStatusBadgeClass = (s?: string) => {
  const norm = (s || "").toUpperCase();
  if (norm === "SELESAI") return "bg-emerald-50 text-emerald-600 border border-emerald-100";
  if (norm === "DITOLAK") return "bg-rose-50 text-rose-600 border border-rose-100";
  if (norm === "DIPROSES" || norm === "DIKERJAKAN") return "bg-red-50 text-red-600 border border-red-100";
  if (norm === "DITUGASKAN") return "bg-rose-50 text-rose-600 border border-rose-100";
  return "bg-amber-50 text-amber-600 border border-amber-100"; // PENDING
};

const getStatusLabel = (s?: string) => {
  const norm = (s || "").toUpperCase();
  if (norm === "SELESAI") return "Selesai";
  if (norm === "DITOLAK") return "Ditolak";
  if (norm === "DIPROSES" || norm === "DIKERJAKAN") return "Sedang Dikerjakan";
  if (norm === "DITUGASKAN") return "Ditugaskan";
  return "Baru (Pending)"; // PENDING
};

const getTindakanLapanganDotClass = (status?: string) => {
  const norm = (status || "").toUpperCase();
  return norm === "DIPROSES" || norm === "SELESAI" ? "bg-red-500 animate-pulse" : "bg-slate-300";
};

const getTindakanLapanganText = (status?: string) => {
  const norm = (status || "").toUpperCase();
  if (norm === "DIPROSES") return "Sedang dikerjakan";
  if (norm === "SELESAI") return "Selesai dikerjakan";
  return "Belum dikerjakan";
};

const getFinalDotClass = (status?: string) => {
  const norm = (status || "").toUpperCase();
  if (norm === "SELESAI") return "bg-emerald-500";
  if (norm === "DITOLAK") return "bg-rose-500";
  return "bg-slate-300";
};

const getFinalStepTitle = (status?: string) => {
  const norm = (status || "").toUpperCase();
  return norm === "DITOLAK" ? "4. Ditolak" : "4. Penanganan Selesai";
};

const getFinalStepDate = (complaint: ComplaintItem) => {
  const norm = (complaint.status || "").toUpperCase();
  if (norm === "SELESAI") return safeFormatTanggal(complaint.tanggalSelesai);
  if (norm === "DITOLAK") return "Administrasi gagal";
  return "-";
};

const AdminMetricCard = ({ title, value, helper, tone, icon }: { title: string; value: number; helper: string; tone: "blue" | "amber" | "emerald" | "red"; icon: React.ReactNode }) => {
  const toneClasses = {
    blue: "bg-red-50/50 border-red-100 text-red-600",
    amber: "bg-amber-50/50 border-amber-100 text-amber-600",
    emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-600",
    red: "bg-red-50/50 border-red-100 text-red-600"
  };

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400">{title}</p>
        <div className={`p-2.5 rounded-xl border ${toneClasses[tone]}`}>{icon}</div>
      </div>
      <h3 className="text-3xl font-black mt-4 tracking-tight text-slate-950">{value}</h3>
      <p className="text-[11px] font-bold text-slate-500 mt-2">{helper}</p>
    </div>
  );
};

export default function AdminLaporan() {
  const navigate = useNavigate();
  
  // Data State
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [petugasList, setPetugasList] = useState<PetugasItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Semua" | "Baru" | "Proses" | "Selesai">("Semua");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Selection & Forms
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintItem | null>(null);
  const [selectedPetugasId, setSelectedPetugasId] = useState<string>("");
  const [assignNote, setAssignNote] = useState<string>("");
  const [rejectReason, setRejectReason] = useState<string>("");
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);
  const [isProcessingAction, setIsProcessingAction] = useState<boolean>(false);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [compRes, petRes] = await Promise.all([
        api.get("/admin/pengaduan"),
        api.get("/admin/pengaduan/petugas")
      ]);
      
      setComplaints(compRes.data?.data || []);
      setPetugasList(petRes.data?.data || []);
    } catch (error: any) {
      console.error("Gagal memuat data admin laporan", error);
      toast.error("Gagal terhubung dengan database server.");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshComplaintsSilently = async () => {
    try {
      const updated = await api.get("/admin/pengaduan");
      const allList: ComplaintItem[] = updated.data?.data || [];
      setComplaints(allList);
      setSelectedComplaint((prev) => {
        if (!prev) return prev;
        return allList.find((x) => x.id === prev.id) || prev;
      });
    } catch (error) {
      // silent refresh: avoid toast spam
      console.error("Gagal refresh data pengaduan", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const intervalId = globalThis.setInterval(() => {
      if (!isProcessingAction) {
        void refreshComplaintsSilently();
      }
    }, 5000);

    return () => {
      globalThis.clearInterval(intervalId);
    };
  }, [isProcessingAction]);

  // Filter complaints based on Tab & Priority
  const filteredLaporan = complaints.filter(c => {
    if (!c) return false;
    
    // Tab filtering
    const statusNorm = (c.status || "").toUpperCase();
    let matchesTab = true;
    if (activeTab === "Baru") matchesTab = statusNorm === "PENDING";
    else if (activeTab === "Proses") matchesTab = statusNorm === "DITUGASKAN" || statusNorm === "DIPROSES" || statusNorm === "DIKERJAKAN";
    else if (activeTab === "Selesai") matchesTab = statusNorm === "SELESAI" || statusNorm === "DITOLAK";

    // Priority filtering
    let matchesPriority = true;
    if (priorityFilter !== "ALL") {
      matchesPriority = statusNorm !== "DITOLAK" && (c.prioritas || "").toUpperCase() === priorityFilter.toUpperCase();
    }

    return matchesTab && matchesPriority;
  });

  // Action handlers
  const handleAssignPetugas = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!selectedPetugasId) {
      toast.error("Harap pilih petugas pelaksana");
      return;
    }

    setIsProcessingAction(true);
    try {
      const payload = {
        petugas_id: Number.parseInt(selectedPetugasId, 10),
        catatan: assignNote.trim() || "Segera tindak lanjuti aduan sarana prasarana ini."
      };

      const response = await api.post(`/admin/pengaduan/${selectedComplaint.id}/assign`, payload);
      if (response.data?.success || response.data) {
        toast.success("Aduan berhasil ditugaskan ke petugas!");
        
        // Refresh complaint list and current selected detail
        const updated = await api.get("/admin/pengaduan");
        const allList: ComplaintItem[] = updated.data?.data || [];
        setComplaints(allList);
        
        const freshSelected = allList.find(x => x.id === selectedComplaint.id);
        if (freshSelected) setSelectedComplaint(freshSelected);

        // Reset Penugasan Form
        setSelectedPetugasId("");
        setAssignNote("");
      }
    } catch (error: any) {
      console.error("Gagal melakukan penugasan", error);
      toast.error(error.response?.data?.message || "Gagal melakukan penugasan");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleUpdateStatus = async (targetStatus: StatusPengaduan) => {
    if (!selectedComplaint) return;
    setIsProcessingAction(true);
    try {
      const payload = {
        status: targetStatus,
        alasan_ditolak: null
      };

      const response = await api.put(`/admin/pengaduan/${selectedComplaint.id}/status`, payload);
      if (response.data?.success || response.data) {
        toast.success(`Status aduan berhasil diperbarui ke: ${targetStatus}`);
        
        const updated = await api.get("/admin/pengaduan");
        const allList: ComplaintItem[] = updated.data?.data || [];
        setComplaints(allList);
        
        const freshSelected = allList.find(x => x.id === selectedComplaint.id);
        if (freshSelected) setSelectedComplaint(freshSelected);
      }
    } catch (error: any) {
      console.error("Gagal update status", error);
      toast.error("Gagal memperbarui status pengaduan.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleRejectComplaint = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!rejectReason.trim()) {
      toast.error("Harap isi alasan penolakan aduan");
      return;
    }

    setIsProcessingAction(true);
    try {
      const payload = {
        status: "DITOLAK",
        alasan_ditolak: rejectReason.trim()
      };

      const response = await api.put(`/admin/pengaduan/${selectedComplaint.id}/status`, payload);
      if (response.data?.success || response.data) {
        toast.success("Aduan warga resmi ditolak");
        setShowRejectForm(false);
        setRejectReason("");
        
        const updated = await api.get("/admin/pengaduan");
        const allList: ComplaintItem[] = updated.data?.data || [];
        setComplaints(allList);
        
        const freshSelected = allList.find(x => x.id === selectedComplaint.id);
        if (freshSelected) setSelectedComplaint(freshSelected);
      }
    } catch (error: any) {
      console.error("Gagal menolak aduan", error);
      toast.error("Gagal menolak aduan warga.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Stats Calculations
  const statsTotal = complaints.length;
  const statsPending = complaints.filter(c => (c.status || "").toUpperCase() === "PENDING").length;
  const statsProcess = complaints.filter(c => {
    const s = (c.status || "").toUpperCase();
    return s === "DITUGASKAN" || s === "DIPROSES" || s === "DIKERJAKAN";
  }).length;
  const statsSelesai = complaints.filter(c => (c.status || "").toUpperCase() === "SELESAI").length;

  const tabCounts: Record<string, number> = {
    Semua: statsTotal,
    Baru: statsPending,
    Proses: statsProcess,
    Selesai: statsSelesai,
  };

  let complaintsSection: React.ReactNode;
  if (isLoading) {
    complaintsSection = (
      <div className="py-20 text-center text-slate-400 text-sm font-semibold">Memuat basis data laporan warga DigiDesa...</div>
    );
  } else if (filteredLaporan.length === 0) {
    complaintsSection = (
      <div className="bg-white rounded-3xl border border-slate-200 py-16 text-center text-slate-400 text-sm font-semibold">
        Tidak ada aduan warga dalam filter ini.
      </div>
    );
  } else {
    complaintsSection = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredLaporan.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-lg transition-all p-7 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getPriorityBadgeClass(item.prioritas)}`}>
                    {item.prioritas}
                  </span>
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{item.kodePengaduan || `PGD-${item.id}`}</span>
                </div>

                <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-red-600 transition-colors">
                  {item.judul}
                </h3>

                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold">
                    <User size={13} className="shrink-0 text-slate-400" />
                    <span className="truncate">{item.pelaporNama || "Warga Anonim"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold">
                    <MapPin size={13} className="shrink-0 text-slate-400" />
                    <span className="truncate">{item.lokasi || "RT / RW"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-500 text-xs font-semibold">
                    <Calendar size={13} className="shrink-0 text-slate-400" />
                    <span>{safeFormatTanggal(item.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${getStatusBadgeClass(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedComplaint(item);
                    setShowRejectForm(false);
                    setRejectReason("");
                  }}
                  className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-slate-100"
                >
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <AdminLayout activeMenu="Moderasi Lapor" title="Moderasi Laporan Warga" subtitle="Verifikasi aduan, tugaskan petugas RT/RW, dan monitor tindak lanjut di lapangan">
        {/* CONTENT AREA */}
        <div className="space-y-8 max-w-7xl mx-auto w-full">
          
          {/* STATS BENTO ROW */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AdminMetricCard title="Total Aduan Masuk" value={statsTotal} helper="Keseluruhan laporan terdaftar" tone="blue" icon={<MessageCircle size={18} />} />
            <AdminMetricCard title="Menunggu Tinjauan" value={statsPending} helper="Aduan baru butuh validasi" tone="amber" icon={<Clock size={18} />} />
            <AdminMetricCard title="Dalam Penanganan" value={statsProcess} helper="Sedang dikerjakan petugas" tone="blue" icon={<Activity className="animate-pulse" size={18} />} />
            <AdminMetricCard title="Selesai Diperbaiki" value={statsSelesai} helper="Telah sukses dikoordinasikan" tone="emerald" icon={<CheckCircle2 size={18} />} />
          </section>

          {/* TAB & PRIORITY CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/50 shrink-0">
              {["Semua", "Baru", "Proses", "Selesai"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t as any)}
                  className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    activeTab === t
                      ? "bg-white text-red-700 shadow-sm border border-slate-100"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t} ({tabCounts[t] ?? 0})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Filter size={12} /> Saring Urgensi:
              </span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-black uppercase tracking-wider rounded-xl py-2 px-3 text-slate-700 outline-none focus:border-red-500"
              >
                <option value="ALL">Semua Tingkat</option>
                <option value="RENDAH">Rendah</option>
                <option value="SEDANG">Sedang</option>
                <option value="TINGGI">Tinggi</option>
                <option value="DARURAT">Darurat</option>
              </select>
            </div>
          </div>

          {/* COMPLAINTS GRID */}
          {complaintsSection}

        </div>

        {/* ─── IMMERSIVE ADMIN DRAWER / MODAL ─── */}
        <AnimatePresence>
          {selectedComplaint && (
            <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-600">Pusat Moderasi & Tindakan DigiDesa</span>
                    <h3 className="text-base font-black text-slate-900 mt-1">Kelola Pengaduan & Penugasan Petugas</h3>
                  </div>
                  <button
                    onClick={() => setSelectedComplaint(null)}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-950 flex items-center justify-center transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 flex flex-col md:grid md:grid-cols-[1fr_340px] gap-6">
                  {/* Left Column: Complaint Details Sheet */}
                  <div className="bg-white p-6 border border-slate-200/60 shadow-sm rounded-2xl flex flex-col justify-between">
                    <div className="space-y-4 text-xs font-semibold leading-relaxed text-slate-800">
                      <div>
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getPriorityBadgeClass(selectedComplaint.prioritas)}`}>
                          Urgensi: {selectedComplaint.prioritas}
                        </span>
                        <h4 className="text-lg font-black text-slate-900 mt-3 leading-tight">{selectedComplaint.judul}</h4>
                        <p className="text-red-600 font-bold mt-1 text-[10px]">No Ref: {selectedComplaint.kodePengaduan || `PGD-${selectedComplaint.id}`}</p>
                      </div>

                      <div className="grid grid-cols-[110px_1fr] gap-y-2 border-t border-slate-100 pt-4">
                        <span className="text-slate-400">Nama Pelapor</span>
                        <span className="font-bold text-slate-900">: {selectedComplaint.pelaporNama || "Anonim"} (NIK: {selectedComplaint.pelaporNik || "-"})</span>
                        <span className="text-slate-400">Lokasi Kejadian</span>
                        <span className="font-bold text-slate-900">: {selectedComplaint.lokasi || "-"}</span>
                        <span className="text-slate-400">Tanggal Aduan</span>
                        <span className="font-bold text-slate-900">: {safeFormatTanggalLengkap(selectedComplaint.createdAt)}</span>
                        <span className="text-slate-400">Kategori Aduan</span>
                        <span className="font-bold text-slate-900">: {selectedComplaint.kategori}</span>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-4 text-xs">
                        <span className="font-black block text-[9px] uppercase tracking-widest text-slate-400 mb-1.5">Deskripsi Aduan Warga:</span>
                        <p className="font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedComplaint.deskripsi}</p>
                      </div>

                      {/* Photo Lampiran */}
                      {selectedComplaint.fotoBukti && (
                        <div className="mt-4">
                          <span className="font-black block text-[9px] uppercase tracking-widest text-slate-400 mb-2">Lampiran Bukti Foto Warga:</span>
                          <a href={selectedComplaint.fotoBukti} target="_blank" rel="noreferrer" className="block max-w-sm rounded-xl overflow-hidden border border-slate-200 group">
                            <img src={selectedComplaint.fotoBukti} className="w-full h-32 object-cover group-hover:scale-105 transition-all" alt="Foto aduan" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-6">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Petugas Pelaksana</p>
                        <p className="font-bold text-[11px] text-slate-950 mt-1.5">{selectedComplaint.petugasNama || "Belum Ditugaskan"}</p>
                      </div>
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${getStatusBadgeClass(selectedComplaint.status)}`}>
                        {getStatusLabel(selectedComplaint.status)}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Dynamic Action Forms */}
                  <div className="space-y-4 flex flex-col justify-between">
                    
                    {/* Status Tracking Timeline */}
                    <div className="bg-white p-5 border border-slate-200/60 rounded-2xl shadow-sm text-xs font-semibold">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 mb-4 flex items-center gap-2">
                        <Activity size={14} className="text-red-600" /> Progres Pelacakan
                      </h4>

                      <div className="space-y-3 relative pl-3 border-l border-slate-200 ml-2">
                        <div className="relative">
                          <div className="absolute -left-[20px] top-0 w-3 h-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-900 leading-none">1. Laporan Diajukan</p>
                          <p className="text-[9px] text-slate-400 mt-1">{safeFormatTanggal(selectedComplaint.createdAt)}</p>
                        </div>
                        <div className="relative">
                          <div className={`absolute -left-[20px] top-0 w-3 h-3 rounded-full border-2 border-white ${
                            selectedComplaint.petugasId ? "bg-emerald-500" : "bg-slate-300"
                          }`} />
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-900 leading-none">2. Validasi & Ditugaskan</p>
                          <p className="text-[9px] text-slate-400 mt-1">{selectedComplaint.petugasNama ? `Petugas: ${selectedComplaint.petugasNama}` : "Belum divalidasi"}</p>
                        </div>
                        <div className="relative">
                          <div className={`absolute -left-[20px] top-0 w-3 h-3 rounded-full border-2 border-white ${
                            getTindakanLapanganDotClass(selectedComplaint.status)
                          }`} />
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-900 leading-none">3. Tindakan Lapangan</p>
                          <p className="text-[9px] text-slate-400 mt-1">{getTindakanLapanganText(selectedComplaint.status)}</p>
                        </div>
                        <div className="relative">
                          <div className={`absolute -left-[20px] top-0 w-3 h-3 rounded-full border-2 border-white ${
                            getFinalDotClass(selectedComplaint.status)
                          }`} />
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-900 leading-none">{getFinalStepTitle(selectedComplaint.status)}</p>
                          <p className="text-[9px] text-slate-400 mt-1">{getFinalStepDate(selectedComplaint)}</p>
                        </div>
                      </div>
                    </div>

                    {/* DYNAMIC ACTIONS */}
                    <div className="bg-white p-5 border border-slate-200/60 rounded-2xl shadow-sm text-xs font-semibold space-y-4">
                      
                      {/* PENDING: ASSIGN & REJECT OPTIONS */}
                      {selectedComplaint.status === "PENDING" && (
                        <>
                          {showRejectForm ? (
                            <form onSubmit={handleRejectComplaint} className="space-y-3.5">
                              <span className="font-black block text-[9px] uppercase tracking-wider text-rose-800">Form Penolakan Aduan Warga:</span>
                              
                              <div>
                                <label htmlFor="reject-reason" className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Alasan Penolakan Resmi</label>
                                <textarea
                                  id="reject-reason"
                                  rows={3}
                                  required
                                  placeholder="Contoh: Lokasi aduan berada di luar wilayah administrasi desa RT kami..."
                                  className="w-full bg-rose-50/20 border border-rose-100 text-xs font-bold rounded-xl py-3 px-3.5 text-slate-900 resize-none outline-none focus:border-rose-400 focus:bg-white"
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={isProcessingAction}
                                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                              >
                                <AlertCircle size={14} /> Kirim Penolakan Resmi
                              </button>

                              <button
                                type="button"
                                onClick={() => setShowRejectForm(false)}
                                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                              >
                                Kembali
                              </button>
                            </form>
                          ) : (
                            <form onSubmit={handleAssignPetugas} className="space-y-3.5">
                              <span className="font-black block text-[9px] uppercase tracking-wider text-slate-400">Tugaskan Petugas Pelaksana:</span>
                              
                              <div>
                                <label htmlFor="assign-petugas" className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Pilih Petugas RT / Staff</label>
                                <select
                                  id="assign-petugas"
                                  required
                                  value={selectedPetugasId}
                                  onChange={(e) => setSelectedPetugasId(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl py-3 px-3.5 text-slate-900 outline-none focus:border-red-500 focus:bg-white"
                                >
                                  <option value="">-- Pilih Akun Petugas --</option>
                                  {petugasList.map(p => (
                                    <option key={p.id} value={p.id}>{p.nama_lengkap} (@{p.username})</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label htmlFor="assign-note" className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Catatan Penugasan</label>
                                <textarea
                                  id="assign-note"
                                  rows={2}
                                  placeholder="Contoh: Perbaiki kebocoran pipa utama segera..."
                                  className="w-full bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl py-3 px-3.5 text-slate-900 resize-none outline-none focus:border-red-500 focus:bg-white"
                                  value={assignNote}
                                  onChange={(e) => setAssignNote(e.target.value)}
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={isProcessingAction}
                                className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md shadow-red-500/10"
                              >
                                <UserCheck size={14} /> Setujui & Tugaskan
                              </button>

                              <button
                                type="button"
                                onClick={() => setShowRejectForm(true)}
                                className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-100"
                              >
                                Tolak Aduan Warga
                              </button>
                            </form>
                          )}
                        </>
                      )}

                      {/* DITUGASKAN / DIPROSES: STEP STATUS CONTROLS */}
                      {(selectedComplaint.status === "DITUGASKAN" || selectedComplaint.status === "DIPROSES" || selectedComplaint.status === "DIKERJAKAN") && (
                        <div className="space-y-3.5">
                          <span className="font-black block text-[9px] uppercase tracking-wider text-slate-400">Kontrol Status Pengerjaan:</span>
                          
                          {selectedComplaint.status === "DITUGASKAN" && (
                            <button
                              onClick={() => handleUpdateStatus("DIPROSES")}
                              disabled={isProcessingAction}
                              className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md shadow-red-500/10"
                            >
                              <Activity size={14} className="animate-pulse" /> Mulai Pengerjaan Lapangan
                            </button>
                          )}

                          <button
                            onClick={() => handleUpdateStatus("SELESAI")}
                            disabled={isProcessingAction}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10"
                          >
                            <CheckCircle2 size={14} /> Nyatakan Aduan SELESAI
                          </button>
                        </div>
                      )}

                      {/* SELESAI: SUCCESS INFO */}
                      {selectedComplaint.status === "SELESAI" && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 space-y-1 text-center">
                          <CheckCircle2 size={22} className="text-emerald-600 mx-auto" />
                          <p className="font-black text-[10px] uppercase tracking-wider mt-2">Penanganan Sukses</p>
                          <p className="text-[11px] font-medium leading-relaxed">Aduan warga telah sukses diselesaikan lapangan dan diarsipkan.</p>
                        </div>
                      )}

                      {/* DITOLAK: BLOCKED INFO */}
                      {selectedComplaint.status === "DITOLAK" && (
                        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 space-y-1">
                          <AlertCircle size={22} className="text-rose-600 mx-auto" />
                          <p className="font-black text-[10px] uppercase tracking-wider text-center mt-2">Laporan Ditolak Admin</p>
                          <p className="text-[11px] leading-relaxed mt-1.5 border-t border-rose-100/50 pt-2 font-bold">
                             Alasan: "{selectedComplaint.alasan_ditolak || "Tidak disetujui"}"
                          </p>
                        </div>
                      )}

                    </div>

                    <button
                      onClick={() => setSelectedComplaint(null)}
                      className="w-full py-3 bg-slate-950 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                    >
                      Kembali ke List Aduan
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

    </AdminLayout>
  );
}