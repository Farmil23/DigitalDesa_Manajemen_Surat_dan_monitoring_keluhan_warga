import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import api from "../services/api";
import AdminLayout from "../components/AdminLayout";
import {
  Clock,
  Download,
  Eye,
  Loader2,
  Upload,
  CheckCircle2,
  XCircle,
  Printer,
  FileText
} from "lucide-react";

type SuratListItem = {
  id: number;
  no_surat?: string;
  noSurat?: string;
  jenis_surat?: string;
  jenisSurat?: string;
  keperluan?: string;
  status?: string;
  tgl_diajukan?: string;
  tglDiajukan?: string;
  user?: {
    nik?: string;
    nama_lengkap?: string;
    namaLengkap?: string;
    rt?: string;
    rw?: string;
  };
};

type DetailWarga = {
  id?: number;
  nik?: string;
  namaLengkap?: string;
  noKk?: string;
  rt?: string;
  rw?: string;
  statusDomisili?: string;
};

type SuratDetail = {
  id: number;
  no_surat?: string;
  noSurat?: string;
  jenis_surat?: string;
  keperluan?: string;
  status?: string;
  alasan_ditolak?: string;
  tgl_diajukan?: string;
  tgl_disetujui?: string;
  dokumen_url?: string;
  warga?: DetailWarga;
};

const STATUS_TABS = ["SEMUA", "PENDING", "SELESAI", "DITOLAK"] as const;

const normalizeStatus = (status?: string) => {
  const value = (status || "").toUpperCase();
  if (value === "REJECTED") return "DITOLAK";
  return value || "PENDING";
};

const jenisLabel = (jenis?: string) => {
  if (!jenis) return "Surat Keterangan";
  const mapping: Record<string, string> = {
    SKD: "Surat Keterangan Domisili",
    SKU: "Surat Keterangan Usaha",
    SKTM: "Surat Keterangan Tidak Mampu",
  };
  return mapping[jenis] || jenis.replaceAll("_", " ");
};

const buildNoSurat = (row: any) => row?.no_surat || row?.noSurat || `SURAT-${row?.id}`;
const buildNama = (row: any) => row?.user?.nama_lengkap || row?.user?.namaLengkap || "-";
const formatTanggal = (raw?: string) => {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};

export default function AdminValidasiSurat() {
  const previewRef = useRef<HTMLDivElement | null>(null);

  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]>("SEMUA");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [suratList, setSuratList] = useState<SuratListItem[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<SuratDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const fetchSuratList = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/surat");
      if (response.data?.success) {
        setSuratList(response.data.data || []);
      } else {
        setSuratList([]);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat daftar surat");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuratList();
  }, []);

  const filteredSurat = useMemo(() => {
    return suratList.filter((row) => {
      const status = normalizeStatus(row.status);
      const matchTab = tab === "SEMUA" || status === tab;
      const noSurat = buildNoSurat(row).toLowerCase();
      const nama = buildNama(row).toLowerCase();
      const nik = (row.user?.nik || "").toLowerCase();
      const jenis = jenisLabel(row.jenis_surat || row.jenisSurat).toLowerCase();
      const matchSearch =
        noSurat.includes(searchQuery.toLowerCase()) ||
        nama.includes(searchQuery.toLowerCase()) ||
        nik.includes(searchQuery.toLowerCase()) ||
        jenis.includes(searchQuery.toLowerCase());

      return matchTab && matchSearch;
    });
  }, [searchQuery, suratList, tab]);

  const totalPending = suratList.filter((row) => normalizeStatus(row.status) === "PENDING").length;
  const totalSelesai = suratList.filter((row) => normalizeStatus(row.status) === "SELESAI").length;
  const totalDitolak = suratList.filter((row) => normalizeStatus(row.status) === "DITOLAK").length;

  const openDetail = async (id: number) => {
    setIsDetailLoading(true);
    setSelectedDetail(null);
    setRejectReason("");
    setPdfFile(null);

    try {
      const response = await api.get(`/admin/surat/${id}`);
      if (response.data?.success) {
        setSelectedDetail(response.data.data);
      } else {
        toast.error("Detail surat tidak dapat dibuka");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat detail surat");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedDetail(null);
    setRejectReason("");
    setPdfFile(null);
  };

  const handleSubmitVerifikasi = async (status: "SELESAI" | "DITOLAK") => {
    if (!selectedDetail) return;
    if (status === "DITOLAK" && !rejectReason.trim()) {
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }
    if (normalizeStatus(selectedDetail.status) !== "PENDING") {
      toast.error("Surat ini sudah diproses.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("status", status);
      if (status === "DITOLAK") {
        formData.append("alasan_ditolak", rejectReason);
      }
      if (pdfFile) {
        formData.append("file", pdfFile);
      }
      const response = await api.put(`/admin/surat/${selectedDetail.id}/verifikasi`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data?.success) {
        toast.success(`Surat berhasil ${status.toLowerCase()}!`);
        closeDetail();
        fetchSuratList();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Gagal mengubah status surat menjadi ${status}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current || !selectedDetail) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    pdf.save(`${buildNoSurat(selectedDetail).replaceAll("/", "-")}.pdf`);
    toast.success("PDF berhasil diunduh.");
  };

  const statusBadgeClass = (status?: string) => {
    const value = normalizeStatus(status);
    if (value === "SELESAI") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (value === "DITOLAK") return "bg-red-50 text-red-600 border-red-100";
    return "bg-amber-50 text-amber-600 border-amber-100";
  };

  return (
    <AdminLayout activeMenu="Validasi Surat" title="Validasi Surat Masuk" subtitle="Manajemen Berkas Surat Resmi Warga">
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* STATS GRID CLEAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 mb-2">Menunggu Validasi</p>
              <p className="text-5xl font-black text-slate-900 tracking-tighter">{totalPending}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <Clock size={28} />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-2">Selesai Diproses</p>
              <p className="text-5xl font-black text-slate-900 tracking-tighter">{totalSelesai}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={28} />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-red-600 mb-2">Ditolak / Bermasalah</p>
              <p className="text-5xl font-black text-slate-900 tracking-tighter">{totalDitolak}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <XCircle size={28} />
            </div>
          </div>
        </div>

        {/* DATA TABLE WRAPPER */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          
          {/* HEADER & UNDERLINE TABS */}
          <div className="border-b border-slate-200 px-8 pt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-extrabold text-slate-900">Daftar Antrian Surat</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari NIK, Nama, No. Surat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-4 pr-10 text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:bg-white focus:border-red-300 transition-all w-64 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              {STATUS_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
                    tab === t ? "border-red-600 text-red-600" : "border-transparent text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Pengaju</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Dokumen</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center">
                      <div className="flex items-center justify-center gap-3 text-sm font-bold text-slate-400">
                        <Loader2 className="animate-spin" size={18} /> Memuat antrian...
                      </div>
                    </td>
                  </tr>
                ) : filteredSurat.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-sm font-bold text-slate-400">
                      Tidak ada surat yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredSurat.map((surat) => (
                    <tr key={surat.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 uppercase">
                            {buildNama(surat).charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{buildNama(surat)}</p>
                            <p className="text-[10px] font-semibold text-slate-500 mt-1">NIK: {surat.user?.nik || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-900">{jenisLabel(surat.jenis_surat || surat.jenisSurat)}</p>
                        <p className="text-[10px] font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                          <Clock size={12} /> {formatTanggal(surat.tgl_diajukan || surat.tglDiajukan)}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${statusBadgeClass(surat.status)}`}>
                          {normalizeStatus(surat.status)}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => openDetail(surat.id)}
                          className="px-5 py-2 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL OVERLAY (Sama dengan sebelumnya, tapi desain tombol diperbaiki) */}
        <AnimatePresence>
          {(isDetailLoading || selectedDetail) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm p-6 overflow-y-auto flex items-start justify-center pt-20">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-slate-100 flex flex-col md:flex-row min-h-[600px]">
                
                {/* Tombol Tutup */}
                <button onClick={closeDetail} className="absolute top-6 right-6 z-10 w-10 h-10 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                  <XCircle size={20} />
                </button>

                {isDetailLoading ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400 font-bold gap-3">
                    <Loader2 className="animate-spin" size={24} /> Memuat dokumen...
                  </div>
                ) : (
                  <>
                    <div className="flex-1 bg-slate-50 p-8 lg:p-12 border-r border-slate-200 overflow-y-auto">
                      <div ref={previewRef} className="mx-auto max-w-[700px] bg-white p-10 lg:p-14 shadow-lg border border-slate-200 text-slate-900">
                        {/* KOP SURAT */}
                        <div className="border-b-4 border-slate-900 pb-6 mb-8 text-center">
                          <div className="flex items-center justify-center gap-6 mb-5">
                            <div className="w-20 h-20 rounded-full border-4 border-slate-900 flex items-center justify-center text-slate-900 font-black text-lg">DD</div>
                            <div className="text-left">
                              <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-600">Pemerintah Kabupaten Digi</p>
                              <h3 className="text-3xl font-black tracking-[0.1em] text-slate-900 uppercase mt-1">Pemerintah Desa DigiDesa</h3>
                              <p className="text-xs font-semibold uppercase tracking-widest text-slate-700 mt-2">Kecamatan Digital, Kabupaten Digi</p>
                            </div>
                          </div>
                        </div>

                        {/* ISI SURAT */}
                        <div className="text-center mb-10">
                          <p className="text-xl font-black uppercase tracking-widest border-b border-slate-900 inline-block pb-1">
                            {jenisLabel(selectedDetail?.jenis_surat).toUpperCase()}
                          </p>
                          <p className="text-sm font-semibold text-slate-600 mt-2">Nomor: {buildNoSurat(selectedDetail)}</p>
                        </div>
                        <div className="space-y-5 text-justify text-slate-800 leading-8">
                          <p>Yang bertanda tangan di bawah ini, Kepala Desa DigiDesa, menerangkan bahwa:</p>
                          <div className="grid grid-cols-[180px_1fr] gap-x-4 gap-y-3 font-medium ml-4">
                            <p>Nama Lengkap</p><p>: <span className="font-bold">{selectedDetail?.warga?.namaLengkap || "-"}</span></p>
                            <p>NIK</p><p>: {selectedDetail?.warga?.nik || "-"}</p>
                            <p>No. KK</p><p>: {selectedDetail?.warga?.noKk || "-"}</p>
                            <p>RT / RW</p><p>: {selectedDetail?.warga?.rt || "-"} / {selectedDetail?.warga?.rw || "-"}</p>
                            <p>Keperluan</p><p>: {selectedDetail?.keperluan || "-"}</p>
                          </div>
                          <p>Surat ini diterbitkan berdasarkan permohonan yang bersangkutan dan telah melalui verifikasi sistem informasi administrasi desa.</p>
                        </div>

                        {/* TTD */}
                        <div className="mt-20 flex justify-end">
                          <div className="text-center min-w-[240px]">
                            <p className="text-sm">Dikeluarkan di: DigiDesa</p>
                            <p className="text-sm mb-4">Pada tanggal: {formatTanggal(selectedDetail?.tgl_disetujui || selectedDetail?.tgl_diajukan)}</p>
                            <p className="font-bold mb-16">Kepala Desa</p>
                            <p className="font-black uppercase border-b border-slate-900 inline-block pb-1">Sistem Terverifikasi</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-[400px] bg-white p-8 lg:p-10 flex flex-col">
                      <h3 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-100 pb-4">Tindakan Admin</h3>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 font-medium">Status</span>
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusBadgeClass(selectedDetail?.status)}`}>{normalizeStatus(selectedDetail?.status)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 font-medium">Waktu Pengajuan</span>
                          <span className="text-slate-900 font-bold">{formatTanggal(selectedDetail?.tgl_diajukan)}</span>
                        </div>
                      </div>

                      <div className="space-y-6 flex-1">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Unggah PDF Cetak (Opsional)</label>
                          <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:bg-slate-100">
                            <Upload size={16} className="text-slate-500 shrink-0" />
                            <span className="text-sm font-semibold text-slate-600 truncate">{pdfFile ? pdfFile.name : "Pilih file PDF..."}</span>
                            <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
                          </label>
                        </div>
                        <div>
                          <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Alasan Penolakan</label>
                          <textarea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Wajib diisi jika ditolak..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500/20 outline-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <button onClick={() => handleSubmitVerifikasi("DITOLAK")} disabled={isSubmitting || normalizeStatus(selectedDetail?.status) !== "PENDING"} className="w-full py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50">
                          Tolak
                        </button>
                        <button onClick={() => handleSubmitVerifikasi("SELESAI")} disabled={isSubmitting || normalizeStatus(selectedDetail?.status) !== "PENDING"} className="w-full py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50">
                          Setujui
                        </button>
                      </div>

                      <button onClick={handleDownloadPdf} className="w-full mt-3 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                        <Download size={14} /> Download Pratinjau
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}