import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import api from "../services/api";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  LayoutDashboard,
  Loader2,
  Search,
  Settings,
  Upload,
  Users,
  XCircle,
  Files,
  AlertTriangle,
  Printer,
} from "lucide-react";

/* eslint-disable sonarjs/cognitive-complexity */

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
  dokumen_url?: string;
  dokumenUrl?: string;
  user?: {
    id?: number;
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
  alamat?: string;
  statusAkun?: string;
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

const EASE_SPRING = [0.16, 1, 0.3, 1];

const FADE_UP = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: EASE_SPRING },
  }),
};

const formatTanggal = (raw?: string) => {
  if (!raw) {
    return "-";
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const normalizeStatus = (status?: string) => {
  const value = (status || "").toUpperCase();
  if (value === "REJECTED") {
    return "DITOLAK";
  }
  return value || "PENDING";
};

const jenisLabel = (jenis?: string) => {
  if (!jenis) {
    return "Surat Keterangan";
  }

  const mapping: Record<string, string> = {
    SKD: "Surat Keterangan Domisili",
    SKU: "Surat Keterangan Usaha",
    SKTM: "Surat Keterangan Tidak Mampu",
  };

  return mapping[jenis] || jenis.replaceAll("_", " ");
};

const buildNoSurat = (row: SuratListItem | SuratDetail) =>
  row.no_surat || row.noSurat || `SURAT-${row.id}`;

const buildNama = (row: SuratListItem) =>
  row.user?.nama_lengkap || row.user?.namaLengkap || "-";

const getTabLabel = (value: (typeof STATUS_TABS)[number]) => {
  if (value === "SEMUA") {
    return "Semua";
  }

  if (value === "DITOLAK") {
    return "Ditolak";
  }

  return value.charAt(0) + value.slice(1).toLowerCase();
};

const getStatusLabel = (status?: string) => {
  const normalized = normalizeStatus(status);
  if (normalized === "DITOLAK") {
    return "Ditolak";
  }
  if (normalized === "SELESAI") {
    return "Selesai";
  }
  return "Pending";
};

export default function AdminValidasiSurat() {
  const navigate = useNavigate();
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
    if (!selectedDetail) {
      return;
    }

    if (status === "DITOLAK" && !rejectReason.trim()) {
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("status", status);
      if (status === "DITOLAK") {
        formData.append("alasanDitolak", rejectReason.trim());
      }
      if (status === "SELESAI" && pdfFile) {
        formData.append("file", pdfFile);
      }

      const response = await api.put(`/admin/surat/${selectedDetail.id}/verifikasi`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        toast.success(response.data.message || "Verifikasi surat berhasil diproses");
        setSelectedDetail(response.data.data);
        setRejectReason("");
        setPdfFile(null);
        await fetchSuratList();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memproses verifikasi surat");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current || !selectedDetail) {
      toast.error("Pratinjau surat belum siap.");
      return;
    }

    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${buildNoSurat(selectedDetail).replaceAll("/", "-")}.pdf`);
    toast.success("PDF berhasil diunduh.");
  };

  const statusBadgeClass = (status?: string) => {
    const value = normalizeStatus(status);
    if (value === "SELESAI") {
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }
    if (value === "DITOLAK") {
      return "bg-red-50 text-red-600 border-red-100";
    }
    return "bg-amber-50 text-amber-600 border-amber-100";
  };

  const tableBody = (() => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={4} className="px-10 py-16 text-center text-slate-400">
            <div className="flex items-center justify-center gap-3 text-sm font-bold">
              <Loader2 className="animate-spin" size={18} /> Memuat data surat...
            </div>
          </td>
        </tr>
      );
    }

    if (filteredSurat.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="px-10 py-16 text-center text-slate-400 text-sm font-bold">
            Tidak ada surat yang cocok dengan filter saat ini.
          </td>
        </tr>
      );
    }

    return filteredSurat.map((surat, idx) => (
      <motion.tr
        key={surat.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: idx * 0.03 }}
        className="group hover:bg-blue-50/20 transition-colors"
      >
        <td className="px-10 py-7">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-[13px] font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
              {(buildNama(surat).charAt(0) || "?").toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 tracking-tight">{buildNama(surat)}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                NIK: {surat.user?.nik || "-"} • RT {surat.user?.rt || "-"} / RW {surat.user?.rw || "-"}
              </p>
            </div>
          </div>
        </td>
        <td className="px-10 py-7">
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-slate-700">{jenisLabel(surat.jenis_surat || surat.jenisSurat)}</span>
            <span className="text-[10px] font-medium text-slate-400 mt-1 flex items-center gap-1.5">
              <Clock size={12} /> {formatTanggal(surat.tgl_diajukan || surat.tglDiajukan)}
            </span>
            <span className="text-[10px] font-medium text-slate-400 mt-1">No. {buildNoSurat(surat)}</span>
          </div>
        </td>
        <td className="px-10 py-7">
          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${statusBadgeClass(surat.status)}`}>
            {getStatusLabel(surat.status)}
          </span>
        </td>
        <td className="px-10 py-7">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => openDetail(surat.id)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
            >
              <Eye size={14} /> Detail
            </button>
          </div>
        </td>
      </motion.tr>
    ));
  })();

  const detailModalContent = (() => {
    if (isDetailLoading) {
      return (
        <div className="flex-1 flex items-center justify-center py-24 text-slate-500 font-bold gap-3">
          <Loader2 className="animate-spin" size={18} /> Memuat detail surat...
        </div>
      );
    }

    if (!selectedDetail) {
      return null;
    }

    const keperluanText = selectedDetail.keperluan || "-";
    const pdfDisplayName = pdfFile ? pdfFile.name : "Unggah PDF hasil cetak surat";
    const approveIcon = isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />;
    const rejectIcon = isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />;

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6 p-6 xl:p-8 bg-slate-50/70 min-h-full">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 xl:p-8">
            <div ref={previewRef} className="mx-auto max-w-[794px] bg-white text-slate-900 p-6 sm:p-10 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] border border-slate-200">
              <div className="border-b-4 border-slate-900 pb-5 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full border-2 border-slate-900 flex items-center justify-center text-slate-900 font-black text-xs">
                    DD
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500">Pemerintah Kabupaten Digi</p>
                    <h3 className="text-2xl font-black tracking-[0.2em] text-slate-900 uppercase">Pemerintah Desa DigiDesa</h3>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 mt-1">
                      Kecamatan Digital, Kabupaten Digi, Provinsi Jawa Timur
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold tracking-[0.25em] uppercase">KOP SURAT RESMI</p>
              </div>

              <div className="mt-8 space-y-6 text-[15px] leading-8">
                {/* FIX KUNCI: Menghilangkan teks statis duplikat Surat Keterangan */}
                <div className="text-center">
                  <p className="text-lg font-black uppercase tracking-[0.18em]">
                    {jenisLabel(selectedDetail.jenis_surat || selectedDetail.jenis_surat).toUpperCase()}
                  </p>
                  <p className="text-sm font-semibold text-slate-500 mt-1">Nomor: {buildNoSurat(selectedDetail)}</p>
                </div>

                <div className="space-y-4 text-justify">
                  <p>
                    Yang bertanda tangan di bawah ini, Kepala Desa DigiDesa, dengan ini menerangkan bahwa warga berikut:
                  </p>

                  <div className="grid grid-cols-[180px_1fr] gap-x-4 gap-y-2 text-slate-800">
                    <p className="font-semibold">Nama Lengkap</p>
                    <p>: {selectedDetail.warga?.namaLengkap || "-"}</p>
                    <p className="font-semibold">NIK</p>
                    <p>: {selectedDetail.warga?.nik || "-"}</p>
                    <p className="font-semibold">No. KK</p>
                    <p>: {selectedDetail.warga?.noKk || "-"}</p>
                    <p className="font-semibold">RT / RW</p>
                    <p>: {selectedDetail.warga?.rt || "-"} / {selectedDetail.warga?.rw || "-"}</p>
                    <p className="font-semibold">Status Domisili</p>
                    <p>: {selectedDetail.warga?.statusDomisili || "-"}</p>
                    <p className="font-semibold">Keperluan</p>
                    <p>: {selectedDetail.keperluan || "-"}</p>
                  </div>

                  <p>
                    Surat ini diterbitkan berdasarkan permohonan yang diajukan oleh Saudara/Saudari di atas untuk keperluan resmi:
                    {' '}{keperluanText}.
                  </p>

                  <p>
                    Setelah dilakukan pengecekan terhadap data kependudukan yang tersedia pada sistem desa, permohonan ini dinyatakan sesuai untuk diproses lebih lanjut.
                  </p>
                </div>

                <div className="pt-2 text-slate-800">
                  <p className="font-semibold">Keterangan Tambahan:</p>
                  <p className="mt-1 whitespace-pre-line">{selectedDetail.keperluan || "-"}</p>
                </div>

                <div className="pt-8 flex items-end justify-between gap-6">
                  <div>
                    <p className="text-sm">Dikeluarkan di : Desa DigiDesa</p>
                    <p className="text-sm">Pada tanggal : {formatTanggal(selectedDetail.tgl_disetujui || selectedDetail.tgl_diajukan)}</p>
                  </div>
                  <div className="text-center min-w-[220px]">
                    <p className="text-sm font-semibold">Kepala Desa DigiDesa</p>
                    <div className="h-20 flex items-center justify-center text-xs text-slate-400 border-b border-slate-300 mb-3">
                      Tanda Tangan Digital
                    </div>
                    <p className="font-black uppercase tracking-[0.15em]">Nama Kepala Desa</p>
                    <p className="text-xs text-slate-500 mt-1">NIP. 19801231 200112 1 001</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ringkasan Pengajuan</p>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{buildNoSurat(selectedDetail)}</h3>
                </div>
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${statusBadgeClass(selectedDetail.status)}`}>
                  {getStatusLabel(selectedDetail.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Jenis Surat</span>
                  <span className="font-bold text-slate-900">{jenisLabel(selectedDetail.jenis_surat)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Nama Warga</span>
                  <span className="font-bold text-slate-900">{selectedDetail.warga?.namaLengkap || "-"}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">NIK</span>
                  <span className="font-bold text-slate-900">{selectedDetail.warga?.nik || "-"}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Tanggal Diajukan</span>
                  <span className="font-bold text-slate-900">{formatTanggal(selectedDetail.tgl_diajukan)}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500 font-medium">Tanggal Diputuskan</span>
                  <span className="font-bold text-slate-900">{formatTanggal(selectedDetail.tgl_disetujui)}</span>
                </div>
              </div>

              {selectedDetail.dokumen_url && (
                <a
                  href={`http://localhost:5000${selectedDetail.dokumen_url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black w-full justify-center"
                >
                  <Printer size={16} /> Buka Berkas Tersimpan
                </a>
              )}

              <button
                onClick={() => {
                  handleDownloadPdf().catch((error) => {
                    console.error(error);
                    toast.error("Gagal membuat PDF dari pratinjau surat.");
                  });
                }}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 text-white text-sm font-black w-full justify-center hover:bg-blue-700 transition-all"
              >
                <Download size={16} /> Download PDF
              </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Aksi Verifikasi</p>
                <h3 className="text-lg font-black text-slate-900 mt-1">Proses ACC / Penolakan</h3>
              </div>

              <div className="space-y-3">
                <label htmlFor="pdfSurat" className="block text-xs font-black uppercase tracking-widest text-slate-400">
                  File PDF Surat (opsional)
                </label>
                <label
                  htmlFor="pdfSurat"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-all"
                >
                  <Upload size={16} className="text-slate-500" />
                  <span className="text-sm font-semibold text-slate-600 truncate">{pdfDisplayName}</span>
                  <input
                    id="pdfSurat"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div className="space-y-3">
                <label htmlFor="alasanDitolak" className="block text-xs font-black uppercase tracking-widest text-slate-400">
                  Alasan Penolakan
                </label>
                <textarea
                  id="alasanDitolak"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Tulis alasan penolakan yang jelas dan formal..."
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  disabled={isSubmitting}
                  onClick={() => handleSubmitVerifikasi("SELESAI")}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 transition-all disabled:opacity-60"
                >
                  {approveIcon} ACC & Selesai
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleSubmitVerifikasi("DITOLAK")}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-600 text-white text-sm font-black hover:bg-rose-700 transition-all disabled:opacity-60"
                >
                  {rejectIcon} Tolak Surat
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Saat surat disetujui, status akan menjadi <span className="font-bold text-slate-600">SELESAI</span> dan file PDF dapat disimpan ke server.
                Jika ditolak, alasan wajib diisi sebelum proses disimpan.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  })();

  const sidebarMenuItems = [
    { n: "Overview", i: LayoutDashboard, p: "/admin" },
    { n: "Validasi Surat", i: Files, p: "/admin/validasi", active: true },
    { n: "Moderasi Lapor", i: AlertTriangle, p: "/admin/laporan" },
    { n: "Data Penduduk", i: Users, p: "/admin/penduduk" },
    { n: "Keuangan Desa", i: BarChart3, p: "/admin/keuangan" },
    { n: "Pengaturan", i: Settings, p: "/admin/pengaturan" },
  ].map((item) => {
    const isActive = Boolean(item.active);
    const itemClass = isActive
      ? "bg-blue-50 text-blue-700"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900";
    const strokeWidth = isActive ? 3 : 2.5;

    return (
      <button
        key={item.n}
        onClick={() => item.p !== "#" && navigate(item.p)}
        className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 ${itemClass}`}
      >
        <item.i size={18} strokeWidth={strokeWidth} />
        {item.n}
      </button>
    );
  });

  const tabButtons = STATUS_TABS.map((value) => {
    const isActive = tab === value;
    const tabButtonClass = isActive
      ? "bg-slate-900 text-white shadow-lg"
      : "text-slate-400 hover:text-slate-900";

    return (
      <button
        key={value}
        onClick={() => setTab(value)}
        className={`px-6 py-2.5 rounded-[1.2rem] text-[11px] font-black uppercase tracking-widest transition-all ${tabButtonClass}`}
      >
        {getTabLabel(value)}
      </button>
    );
  });

  const statAccentClass: Record<"amber" | "emerald" | "rose", string> = {
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased flex">
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-50 shadow-sm">
        <button type="button" className="p-8 flex items-center gap-3 text-left" onClick={() => navigate("/admin")}>
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-900 tracking-tighter text-xl leading-none">ADMIN</span>
            <span className="text-[10px] font-black text-blue-600 tracking-[0.3em] mt-1 uppercase">DigiDesa</span>
          </div>
        </button>

        <nav className="flex-1 px-6 space-y-1.5 mt-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Navigasi Utama</p>
          {sidebarMenuItems}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin")} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Validasi Surat Masuk</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                Manajemen berkas surat resmi warga
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari NIK, Nama, atau Nomor Surat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all w-72"
              />
            </div>
          </div>
        </header>

        <div className="p-10 space-y-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Pending", value: totalPending, icon: Clock, color: "amber" },
              { label: "Selesai", value: totalSelesai, icon: CheckCircle2, color: "emerald" },
              { label: "Ditolak", value: totalDitolak, icon: XCircle, color: "rose" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{item.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statAccentClass[item.color as keyof typeof statAccentClass]}`}>
                  <item.icon size={22} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-[1.5rem] border border-slate-100 w-fit shadow-sm">
            {tabButtons}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-slate-50/50 border-b border-slate-100">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pengaju</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Surat</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode="popLayout">{tableBody}</AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Menampilkan {filteredSurat.length} dari {suratList.length} berkas
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-400 hover:text-slate-900 transition-all">
                  Sebelumnya
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-400 hover:text-slate-900 transition-all">
                  Selanjutnya
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <AnimatePresence>
        {(isDetailLoading || selectedDetail) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-7xl max-h-[92vh] overflow-hidden bg-white rounded-[2rem] shadow-2xl flex flex-col"
            >
              <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Detail Surat Resmi</p>
                  <h2 className="text-lg font-black text-slate-900 mt-1">Pratinjau dan Verifikasi Dokumen</h2>
                </div>
                <button
                  onClick={closeDetail}
                  className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-500 hover:text-slate-900 flex items-center justify-center"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {detailModalContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}