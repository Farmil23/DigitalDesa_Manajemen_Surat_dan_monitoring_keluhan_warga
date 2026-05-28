import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import api from "../services/api";
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Bell, 
  Search,
  Plus,
  CheckCircle2,
  ChevronRight,
  TrendingUp, 
  Activity,
  ShieldCheck,
  CreditCard,
  LogOut,
  Sparkles,
  CalendarDays,
  ArrowUpRight,
  Zap,
  Download,
  X,
  Eye,
  Info,
  MapPin
} from "lucide-react";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

const EASE_SPRING = [0.16, 1, 0.3, 1] as const;

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: EASE_SPRING }
  })
};

const STEP_ICON_STYLES: Record<string, string> = {
  blue: "text-blue-600",
  indigo: "text-indigo-600",
  emerald: "text-emerald-600",
};

type SuratItem = {
  id: number | string;
  noSurat?: string;
  tipe: string;
  status: string;
  tgl: string;
  progress: number;
  keperluan?: string;
  alasanDitolak?: string;
  dokumenUrl?: string;
};

// TAMBAHAN TYPE TANPA MENGURANGI YANG LAIN
type PengaduanItem = {
  id: number;
  kodePengaduan: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  lokasi: string | null;
  status: string;
  prioritas: string;
  alasanDitolak: string | null;
  createdAt: string;
  updatedAt: string;
};

const normalizeStatus = (status?: string) => {
  const value = (status || "").toUpperCase();
  if (value === "REJECTED") return "DITOLAK";
  return value || "PENDING";
};

const formatTanggal = (raw?: string) => {
  if (!raw) return "-";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

const getJenisLabel = (jenis?: string) => {
  if (!jenis) return "Surat";
  const map: Record<string, string> = {
    SKD: "Surat Keterangan Domisili",
    SKU: "Surat Keterangan Usaha",
    SKTM: "Surat Keterangan Tidak Mampu",
  };
  return map[jenis] || jenis.replaceAll("_", " ");
};

const getStatusLabel = (status?: string) => {
  const normalized = normalizeStatus(status);
  if (normalized === "SELESAI") return "Selesai";
  if (normalized === "DITOLAK") return "Ditolak";
  if (normalized === "PROSES" || normalized === "DITUGASKAN" || normalized === "DIPROSES") return "Diproses";
  return "Menunggu";
};

const getProgressValue = (status?: string) => {
  const normalized = normalizeStatus(status);
  if (normalized === "SELESAI") return 100;
  if (normalized === "PENDING") return 30;
  if (normalized === "DITOLAK") return 100;
  return 65;
};

const getStatusBadgeClass = (status?: string) => {
  const normalized = normalizeStatus(status);
  if (normalized === "SELESAI") return "bg-emerald-50 text-emerald-600 border border-emerald-100";
  if (normalized === "DITOLAK") return "bg-red-50 text-red-600 border border-red-100";
  return "bg-amber-50 text-amber-600 border border-amber-100";
};

export default function DashboardWarga() {
  const [activeTab, setActiveTab] = useState("Ringkasan");
  const [userData, setUserData] = useState<any>(null);
  const [suratList, setSuratList] = useState<SuratItem[]>([]);
  const [isLoadingSurat, setIsLoadingSurat] = useState(false);
  
  // HANYA MENAMBAHKAN STATE PENGADUAN DI SINI
  const [pengaduanList, setPengaduanList] = useState<PengaduanItem[]>([]);
  const [isLoadingPengaduan, setIsLoadingPengaduan] = useState(false);
  const [showPengaduanSection, setShowPengaduanSection] = useState(false);
  
  const [selectedSuratModal, setSelectedSuratModal] = useState<SuratItem | null>(null);
  const modalPrintRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const loadDataSurat = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
        
        setIsLoadingSurat(true);
        api.get(`/surat/user/${user.id}`)
          .then((res) => {
            const data = Array.isArray(res.data?.data) ? res.data.data : [];
            const mapped = data.map((s: any): SuratItem => {
              const status = normalizeStatus(s.status || s.statusSurat);
              return {
                id: s.id,
                noSurat: s.no_surat || s.noSurat || `SURAT-${s.id}`,
                tipe: getJenisLabel(s.jenis_surat || s.jenisSurat),
                status,
                tgl: formatTanggal(s.tgl_diajukan || s.tglDiajukan || s.createdAt),
                progress: getProgressValue(status),
                keperluan: s.keperluan,
                alasanDitolak: s.alasan_ditolak || s.alasanDitolak,
                dokumenUrl: s.dokumen_url || s.dokumenUrl,
              };
            });

            setSuratList(mapped);
          })
          .catch((err) => {
            console.error("Failed to fetch surat", err);
            setSuratList([]);
          })
          .finally(() => setIsLoadingSurat(false));

        // HANYA NYELIPIN FETCH RIAWAYAT PENGADUAN DI SINI TANPA MERUSAK LAINNYA
        setIsLoadingPengaduan(true);
        api.get("/warga/pengaduan/riwayat")
          .then((res) => {
            if (res.data?.success && Array.isArray(res.data?.data)) {
              setPengaduanList(res.data.data);
            }
          })
          .catch((err) => console.error("Failed to fetch pengaduan", err))
          .finally(() => setIsLoadingPengaduan(false));

      } catch (e) {
        console.error("Gagal membaca data user", e);
        setSuratList([]);
      }
    }
  };

  useEffect(() => {
    loadDataSurat();
  }, []);

  const handleWargaDownloadPDF = async () => {
    if (!modalPrintRef.current || !selectedSuratModal) {
      toast.error("Pratinjau dokumen belum sepenuhnya dimuat.");
      return;
    }

    try {
      const canvas = await html2canvas(modalPrintRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Salinan_Surat_${selectedSuratModal.noSurat}.pdf`);
      toast.success("Salinan surat berhasil disimpan.");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengekspor berkas.");
    }
  };

  let suratListContent: JSX.Element | JSX.Element[];
  if (isLoadingSurat) {
    suratListContent = (
      <div className="p-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-slate-400 text-sm font-medium">
        Memuat data surat Anda...
      </div>
    );
  } else if (suratList.length === 0) {
    suratListContent = (
      <div className="p-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-slate-400 text-sm font-medium">
        Belum ada pengajuan surat. Silakan ajukan dari menu Layanan Surat.
      </div>
    );
  } else {
    suratListContent = suratList.map((surat) => (
      <div key={surat.id} className="p-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-blue-200 transition-all flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-500">
              <FileText className="text-slate-400 group-hover:text-white transition-colors" size={24} />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-base tracking-tight">{surat.tipe}</h4>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {surat.noSurat || surat.id} • {surat.tgl}</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Progress Sistem</p>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${surat.progress}%` }} transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                />
              </div>
            </div>
            <span className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest ${getStatusBadgeClass(surat.status)}`}>
              {getStatusLabel(surat.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nomor Surat</p>
            <p className="font-bold text-slate-800 mt-1">{surat.noSurat || "-"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Keperluan</p>
            <p className="font-bold text-slate-800 mt-1 line-clamp-2">{surat.keperluan || surat.tipe}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tanggal Diajukan</p>
            <p className="font-bold text-slate-800 mt-1">{surat.tgl}</p>
          </div>
        </div>

        {normalizeStatus(surat.status) === "DITOLAK" && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1">Alasan Penolakan</p>
            <p className="font-medium leading-relaxed">{surat.alasanDitolak || "Belum ada alasan penolakan yang tercatat."}</p>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100/70 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setSelectedSuratModal(surat)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <Eye size={13} /> Lihat Detail Surat
          </button>

          {normalizeStatus(surat.status) === "SELESAI" && (
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <a
                href={surat.dokumenUrl ? `http://localhost:5000${surat.dokumenUrl}` : "#"}
                target="_blank"
                rel="noreferrer"
                disabled={!surat.dokumenUrl}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all ${!surat.dokumenUrl && 'opacity-50 cursor-not-allowed'}`}
              >
                <Download size={14} /> Download PDF Resmi
              </a>
            </div>
          )}
        </div>
      </div>
    ));
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC] font-sans antialiased flex overflow-hidden text-slate-900">
      
      {/* ── SIDEBAR (UTUH) ── */}
      <aside className="hidden lg:flex w-72 bg-white/95 backdrop-blur-xl border-r border-slate-100 flex-col sticky top-0 h-screen z-50">
        <button type="button" className="p-8 flex items-center gap-3 text-left border-b border-slate-50" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-slate-900 tracking-tighter text-2xl italic">DIGI<span className="text-blue-600">DESA</span></span>
        </button>

        <nav className="flex-1 px-6 space-y-1.5 mt-4">
          {[
            { n: "Ringkasan", i: LayoutDashboard, p: "/dashboard-warga" },
            { n: "Layanan Surat", i: FileText, p: "/layanan" },
            { n: "Laporan Saya", i: MessageSquare, p: "/lapor" },
            { n: "Financial", i: CreditCard, p: "/finansial" },
          ].map((item) => (
            <button
              key={item.n}
              onClick={() => {
                setActiveTab(item.n);
                if(item.p !== "#") navigate(item.p);
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 ${
                activeTab === item.n 
                ? "bg-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.3)] scale-[1.02]" 
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.i size={18} strokeWidth={2.5} />
              {item.n}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold text-red-400 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT (UTUH) ── */}
      <main className="flex-1 overflow-y-auto relative h-screen bg-[#F6F9FC]">
        
        {/* HEADER */}
        <header className="h-24 bg-white/90 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 px-8 sm:px-12 flex items-center justify-between shadow-[0_8px_30px_-24px_rgba(15,23,42,0.35)]">
          <div className="flex items-center gap-4">
            <div className="hidden sm:block relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari layanan desa..." 
                className="bg-slate-100/50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-xs font-medium focus:ring-2 focus:ring-blue-500/10 w-64 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
               <CalendarDays size={14} className="text-amber-600" />
               <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">Rabu, 29 April</span>
            </div>
            <button className="relative w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all">
              <Bell size={20} strokeWidth={2} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-black text-slate-900 leading-none">{userData?.nama_lengkap || userData?.namaLengkap || "Warga Desa"}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">NIK: {userData?.nik || "-"}</p>
              </div>
              <img className="w-11 h-11 rounded-2xl border-2 border-white shadow-md ring-4 ring-slate-50" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.nama_lengkap || userData?.namaLengkap || 'Warga'}`} alt="Avatar" />
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-8 sm:p-12 space-y-10 max-w-7xl mx-auto">
          
          {/* WELCOME SECTION */}
          <motion.section 
            initial="hidden" animate="visible" variants={FADE_UP} custom={0}
            className="relative p-10 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 rounded-[3rem] overflow-hidden shadow-[0_24px_60px_-22px_rgba(15,23,42,0.35)]"
          >
            <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-blue-600/30 to-transparent" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Automasi Desa Digital</span>
                <h2 className="text-4xl font-black text-white mt-6 tracking-tighter leading-none">
                  Layanan Publik <br/> <span className="text-blue-500">Serba Instan.</span>
                </h2>
                <p className="text-slate-400 text-sm max-w-sm mt-4 leading-relaxed font-medium">
                  RT dan RW kini otomatis mendapatkan laporan tembusan. Anda tidak perlu lagi meminta validasi fisik secara manual.
                </p>
              </div>
              <div className="flex gap-4">
                 <motion.button 
                  onClick={() => navigate('/layanan')}
                  whileHover={{ y: -5 }}
                  className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl text-sm shadow-xl shadow-blue-500/25 hover:bg-blue-500 transition-all flex items-center gap-3"
                >
                  <Plus size={20} strokeWidth={3} /> Ajukan Surat
                </motion.button>
              </div>
            </div>
          </motion.section>

          {/* QUICK STATS (DIUBAH MENJADI DINAMIS DENGAN DATA ASLI BACKEND) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => setShowPengaduanSection(false)} className={`bg-white p-7 rounded-[2rem] border transition-all flex items-center gap-6 group cursor-pointer ${!showPengaduanSection ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-100'}`}>
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                <FileText className="text-blue-600" size={26} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Surat Aktif</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{suratList.length}</h3>
              </div>
              <ArrowUpRight size={20} className="text-slate-200 group-hover:text-blue-500" />
            </div>

            <div onClick={() => setShowPengaduanSection(true)} className={`bg-white p-7 rounded-[2rem] border transition-all flex items-center gap-6 group cursor-pointer ${showPengaduanSection ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-100'}`}>
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
                <MessageSquare className="text-indigo-600" size={26} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Laporan Saya</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">{pengaduanList.length}</h3>
              </div>
              <ArrowUpRight size={20} className="text-slate-200 group-hover:text-indigo-500" />
            </div>

            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-slate-400 group-hover:text-blue-600 transition-colors" size={26} strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Poin Warga</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5 tracking-tight">1.250</h3>
              </div>
              <ArrowUpRight size={20} className="text-slate-200" />
            </div>
          </div>

          {/* MAIN BENTO LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* LEFT: MAIN LIST AREA */}
            <motion.div 
              initial="hidden" animate="visible" variants={FADE_UP} custom={4}
              className="lg:col-span-2 space-y-6"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {showPengaduanSection ? "Riwayat Laporan Kendala Warga" : "Status Dokumen Surat"}
                </h3>
                {showPengaduanSection && (
                  <button onClick={() => setShowPengaduanSection(false)} className="text-xs font-bold text-blue-600">
                    Lihat Dokumen Surat
                  </button>
                )}
              </div>

              <div className="grid gap-5">
                {!showPengaduanSection ? (
                  // KONTEN SURAT ASLI KAMU (TIDAK SENTUH SAMA SEKALI)
                  suratListContent
                ) : (
                  // KONTEN PENGADUAN YANG BARU KITA DAFTARKAN (NYELIP AMAN)
                  isLoadingPengaduan ? (
                    <div className="p-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-slate-400 text-sm font-medium">
                      Memuat riwayat aduan...
                    </div>
                  ) : pengaduanList.length === 0 ? (
                    <div className="p-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm text-slate-400 text-sm font-medium">
                      Belum ada laporan yang diajukan. Klik menu "Laporan Saya" di sidebar untuk buat aduan baru.
                    </div>
                  ) : (
                    pengaduanList.map((laporan) => (
                      <div key={laporan.id} className="p-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <MessageSquare size={24} />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-800 text-base tracking-tight">{laporan.judul}</h4>
                              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">KODE: {laporan.kodePengaduan} • {formatTanggal(laporan.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-[10px] uppercase rounded-lg tracking-wider">
                              {laporan.kategori}
                            </span>
                            <span className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest ${getStatusBadgeClass(laporan.status)}`}>
                              {getStatusLabel(laporan.status)}
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl text-sm font-medium text-slate-700 leading-relaxed">
                          <p>{laporan.deskripsi}</p>
                          {laporan.lokasi && (
                            <p className="text-xs text-slate-400 font-bold mt-2 flex items-center gap-1">
                              <MapPin size={12} /> Lokasi: {laporan.lokasi}
                            </p>
                          )}
                        </div>
                        {normalizeStatus(laporan.status) === "DITOLAK" && laporan.alasanDitolak && (
                          <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl">
                            <span className="font-black block mb-1">ALASAN PENOLAKAN:</span>
                            "{laporan.alasanDitolak}"
                          </div>
                        )}
                      </div>
                    ))
                  )
                )}
              </div>

              {/* SIMPLIFIED SERVICE TIMELINE (UTUH KAMU PUNYA) */}
              <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50" />
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Zap className="text-blue-600" size={18} strokeWidth={3} />
                  </div>
                  <h3 className="font-black text-slate-900 tracking-tight">Timeline Pelayanan Digital</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
                  {[
                    { icon: Plus, label: "Submit Mandiri", desc: "Data dikirim ke server", c: "blue" },
                    { icon: ShieldCheck, label: "Validasi Desa", desc: "Verifikasi data kependudukan", c: "indigo" },
                    { icon: CheckCircle2, label: "Terbit Digital", desc: "Surat siap didownload", c: "emerald" }
                  ].map((step) => (
                    <div key={step.label} className="flex flex-col items-center text-center p-6 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-slate-200 transition-all group">
                      <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ring-1 ring-slate-100`}>
                        <step.icon size={20} className={STEP_ICON_STYLES[step.c]} strokeWidth={2.5} />
                      </div>
                      <span className="text-[11px] font-black text-slate-800 tracking-tight uppercase">{step.label}</span>
                      <p className="text-[10px] font-bold text-slate-400 mt-2 leading-snug">{step.desc}</p>
                    </div>
                  ))}
                  <div className="col-span-full mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
                    <Activity size={16} className="text-blue-600" />
                    <p className="text-[10px] font-bold text-blue-800 leading-tight">
                      Informasi: Perangkat RT dan RW mendapatkan notifikasi tembusan secara otomatis sebagai arsip wilayah.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: WIDGETS (UTUH 100%) */}
            <motion.div 
              initial="hidden" animate="visible" variants={FADE_UP} custom={5}
              className="space-y-10"
            >
              {/* NEWS CARD */}
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative shadow-2xl shadow-blue-900/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[60px] opacity-30" />
                <h3 className="text-xl font-black mb-8 tracking-tight flex items-center gap-3">
                  <Activity size={22} className="text-blue-400" strokeWidth={3} /> Warta Desa
                </h3>
                <div className="space-y-8">
                  {[
                    { t: "Pembangunan Taman Bermain", d: "Lokasi Blok C, mulai minggu depan.", tag: "INFO" },
                    { t: "Update Sistem E-Iuran", d: "Pembayaran via QRIS kini tersedia.", tag: "TECH" }
                  ].map((n) => (
                    <div key={n.t} className="relative pl-6 border-l-2 border-slate-700 hover:border-blue-500 transition-colors cursor-pointer group">
                      <span className="text-[10px] font-black text-blue-400 tracking-[0.2em]">{n.tag}</span>
                      <h4 className="text-sm font-black mt-1 group-hover:text-blue-300 transition-colors">{n.t}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{n.d}</p>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
                  Arsip Berita
                </button>
              </div>

              {/* LOYALTY CARD */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
                <h3 className="font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
                   <TrendingUp size={22} className="text-indigo-600" strokeWidth={3} /> Kontribusi Warga
                </h3>
                <div className="space-y-8">
                  <div>
                    <div className="flex justify-between items-end mb-3 px-1">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Partisipasi</span>
                      <span className="text-base font-black text-slate-900">85%</span>
                    </div>
                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} className="h-full bg-gradient-to-r from-indigo-50 to-blue-50" />
                    </div>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] border border-indigo-100">
                    <p className="text-[11px] font-black text-indigo-700 uppercase tracking-widest mb-1">Badge Level</p>
                    <p className="text-sm font-black text-indigo-900 tracking-tight">Warga Teladan (Silver)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ─── MODAL PRATINJAU SURAT (UTUH 100%) ─── */}
      <AnimatePresence>
        {selectedSuratModal && (
          <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Arsip Digital Mandiri</span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">Pratinjau Keterangan Pengajuan</h3>
                </div>
                <button 
                  onClick={() => setSelectedSuratModal(null)}
                  className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 flex flex-col md:grid md:grid-cols-[1fr_320px] gap-6">
                <div className="bg-white p-6 sm:p-8 border border-slate-200/60 shadow-sm rounded-2xl" ref={modalPrintRef}>
                  <div className="border-b-2 border-slate-800 pb-4 text-center">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Pemerintah Kelurahan DigiDesa</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold">Kecamatan Digital, Otoritas Jawa Timur</p>
                  </div>
                  
                  <div className="mt-6 space-y-4 text-xs leading-relaxed text-slate-800">
                    <div className="text-center">
                      <p className="text-sm font-black uppercase tracking-wider">{selectedSuratModal.tipe.toUpperCase()}</p>
                      <p className="text-slate-400 font-bold mt-0.5">No Ref: {selectedSuratModal.noSurat}</p>
                    </div>

                    <p className="mt-4">Dengan ini menerangkan bahwa data pemohon di bawah ini:</p>
                    <div className="grid grid-cols-[110px_1fr] gap-y-1.5 font-medium pl-2">
                      <span className="text-slate-400">Nama Lengkap</span>
                      <span className="font-bold text-slate-900">: {userData?.nama_lengkap || userData?.namaLengkap}</span>
                      <span className="text-slate-400">NIK Pemohon</span>
                      <span className="font-bold text-slate-900">: {userData?.nik}</span>
                      <span className="text-slate-400">Keperluan Utama</span>
                      <span className="font-bold text-slate-900">: {selectedSuratModal.keperluan || "Administrasi Terkait"}</span>
                      <span className="text-slate-400">Tanggal Kirim</span>
                      <span className="font-bold text-slate-900">: {selectedSuratModal.tgl}</span>
                    </div>

                    <p className="text-justify mt-4">
                      Tembusan ini dihasilkan secara otomatis oleh sistem pelayanan mandiri kelurahan DigiDesa dan bersifat sah sebagai bentuk tracking transparansi sistem informasi kependudukan desa.
                    </p>

                    <div className="pt-6 flex justify-end">
                      <div className="text-center min-w-[140px] border-t border-dashed border-slate-200 pt-3">
                        <p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Status Verifikasi</p>
                        <p className={`mt-1 text-xs font-black uppercase tracking-wider ${normalizeStatus(selectedSuratModal.status) === 'SELESAI' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {getStatusLabel(selectedSuratModal.status)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 flex flex-col justify-between h-full">
                  <div className="bg-white p-5 border border-slate-100 rounded-2xl shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">Status Berkas</h4>
                    <div className="space-y-2">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase ${getStatusBadgeClass(selectedSuratModal.status)}`}>
                        {getStatusLabel(selectedSuratModal.status)}
                      </span>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Pengajuan dokumen ini berada di tahap peninjauan administratif. Riwayat pembaruan status terikat langsung dengan basis data MySQL pusat.
                      </p>
                    </div>

                    {normalizeStatus(selectedSuratModal.status) === "DITOLAK" && (
                      <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-700">
                        <span className="font-black block text-[9px] uppercase tracking-wider text-red-800">Catatan Admin:</span>
                        <p className="mt-1 font-medium">"{selectedSuratModal.alasanDitolak || "Berkas lampiran fisik kurang jelas."}"</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleWargaDownloadPDF}
                      className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Download size={14} /> Cetak Salinan PDF
                    </button>
                    <div className="p-3 bg-blue-50/60 rounded-xl flex items-start gap-2 text-[10px] font-medium text-blue-700 leading-normal">
                      <Info size={14} className="shrink-0 text-blue-500 mt-0.5" />
                      <p>Warga dapat mencetak salinan mandiri ini sebagai bukti pengajuan fisik sementara ke kantor sekretariat RW setempat.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}