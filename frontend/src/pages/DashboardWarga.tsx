import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import api from "../services/api";
import PanduanWarga from "../components/PanduanWarga";
import WargaTopNav from "../components/WargaTopNav";
import { 
  FileText, 
  MessageSquare, 
  CheckCircle2,
  Activity,
  Download,
  X,
  Eye
} from "lucide-react";

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

const EASE_SPRING = [0.16, 1, 0.3, 1] as const;

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
  const [userData, setUserData] = useState<any>(null);
  const [suratList, setSuratList] = useState<SuratItem[]>([]);
  const [pengaduanList, setPengaduanList] = useState<PengaduanItem[]>([]);
  const [isLoadingSurat, setIsLoadingSurat] = useState(false);
  const [isLoadingPengaduan, setIsLoadingPengaduan] = useState(false);
  
  const [selectedSuratModal, setSelectedSuratModal] = useState<SuratItem | null>(null);
  const [activeTab, setActiveTab] = useState<"surat" | "pengaduan">("surat");
  
  const modalPrintRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const loadData = () => {
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
          .catch((err) => console.error(err))
          .finally(() => setIsLoadingSurat(false));

        setIsLoadingPengaduan(true);
        api.get("/warga/pengaduan/riwayat")
          .then((res) => {
            if (res.data?.success && Array.isArray(res.data?.data)) {
              setPengaduanList(res.data.data);
            }
          })
          .catch((err) => console.error(err))
          .finally(() => setIsLoadingPengaduan(false));

      } catch (e) {
        console.error("Gagal membaca data user", e);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadPDF = async () => {
    if (!modalPrintRef.current || !selectedSuratModal) return;
    try {
      const canvas = await html2canvas(modalPrintRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Salinan_Surat_${selectedSuratModal.noSurat}.pdf`);
      toast.success("Salinan surat berhasil diunduh.");
    } catch (err) {
      toast.error("Gagal mengunduh dokumen.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-red-200">
      
      {/* ── TOP NAVIGATION ── */}
      <WargaTopNav />

      {/* ── MAIN CONTENT (BENTO GRID) ── */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
              Halo, {userData?.nama_lengkap?.split(' ')[0] || userData?.namaLengkap?.split(' ')[0] || "Warga"}! 👋
            </h1>
            <p className="text-slate-500 font-medium">Selamat datang di portal pelayanan warga terpadu. Apa yang bisa kami bantu hari ini?</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => navigate('/layanan')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all">
              <FileText size={18} /> Ajukan Surat
            </button>
            <button onClick={() => navigate('/lapor')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3.5 rounded-2xl font-bold shadow-sm transition-all">
              <MessageSquare size={18} /> Lapor
            </button>
          </div>
        </div>

        {/* GUIDELINES SECTION */}
        <PanduanWarga />

        {/* STATS BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
             <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
               <FileText size={24} />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Surat Diajukan</p>
               <h3 className="text-3xl font-black text-slate-900 mt-1">{suratList.length}</h3>
             </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
             <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
               <Activity size={24} />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Surat Diproses</p>
               <h3 className="text-3xl font-black text-slate-900 mt-1">{suratList.filter(s => normalizeStatus(s.status) === 'PENDING').length}</h3>
             </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5">
             <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
               <CheckCircle2 size={24} />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Surat Selesai</p>
               <h3 className="text-3xl font-black text-slate-900 mt-1">{suratList.filter(s => normalizeStatus(s.status) === 'SELESAI').length}</h3>
             </div>
          </div>
        </div>

        {/* RIWAYAT SECTION */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab('surat')}
              className={`flex-1 py-5 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'surat' ? 'bg-red-50 text-red-600 border-b-2 border-red-600' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Riwayat Surat
            </button>
            <button 
              onClick={() => setActiveTab('pengaduan')}
              className={`flex-1 py-5 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'pengaduan' ? 'bg-red-50 text-red-600 border-b-2 border-red-600' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Riwayat Laporan
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'surat' ? (
              isLoadingSurat ? (
                <div className="text-center py-10 text-slate-400 font-medium">Memuat data surat...</div>
              ) : suratList.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium">Belum ada pengajuan surat.</div>
              ) : (
                <div className="space-y-4">
                  {suratList.map(surat => (
                    <div key={surat.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{surat.tipe}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">Ref: {surat.noSurat || surat.id} • Diajukan: {surat.tgl}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="hidden md:block w-32">
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${surat.progress}%` }} className="h-full bg-red-600 rounded-full" />
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusBadgeClass(surat.status)}`}>
                          {getStatusLabel(surat.status)}
                        </span>
                        <button onClick={() => setSelectedSuratModal(surat)} className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-white rounded-lg shadow-sm border border-slate-100">
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              isLoadingPengaduan ? (
                <div className="text-center py-10 text-slate-400 font-medium">Memuat data aduan...</div>
              ) : pengaduanList.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium">Belum ada laporan pengaduan yang diajukan.</div>
              ) : (
                <div className="space-y-4">
                  {pengaduanList.map(laporan => (
                    <div key={laporan.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-600">
                          <MessageSquare size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{laporan.judul}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1">{laporan.kategori} • {formatTanggal(laporan.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusBadgeClass(laporan.status)}`}>
                         {getStatusLabel(laporan.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

      </main>

      {/* ── MODAL PREVIEW SURAT ── */}
      <AnimatePresence>
        {selectedSuratModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedSuratModal(null)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Detail & Pratinjau Surat</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Ref: {selectedSuratModal.noSurat || selectedSuratModal.id}</p>
                </div>
                <button onClick={() => setSelectedSuratModal(null)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-200/50">
                {/* PREVIEW KERTAS A4 */}
                <div ref={modalPrintRef} className="bg-white w-full max-w-[210mm] mx-auto p-12 min-h-[297mm] shadow-lg ring-1 ring-slate-900/5" style={{ aspectRatio: '1 / 1.414' }}>
                   <div className="text-center border-b-4 border-slate-900 pb-6 mb-8">
                     <h2 className="text-2xl font-black uppercase tracking-wider">Pemerintah Desa Digital</h2>
                     <p className="text-sm font-medium mt-1">Kecamatan Cilandak, Kota Jakarta Selatan, Kode Pos 12430</p>
                   </div>
                   <div className="text-center mb-10">
                     <h3 className="text-xl font-bold uppercase underline underline-offset-4 mb-2">{selectedSuratModal.tipe}</h3>
                     <p className="text-sm font-medium">Nomor: {selectedSuratModal.noSurat || "Dalam Proses"}</p>
                   </div>
                   <div className="space-y-4 text-sm leading-loose">
                     <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
                     <div className="grid grid-cols-[150px_1fr] gap-2 font-bold ml-4">
                       <span>Nama Lengkap</span><span>: {userData?.nama_lengkap || userData?.namaLengkap}</span>
                       <span>NIK</span><span>: {userData?.nik}</span>
                       <span>Status</span><span>: {selectedSuratModal.status}</span>
                       <span>Keperluan</span><span>: {selectedSuratModal.keperluan || selectedSuratModal.tipe}</span>
                     </div>
                     <p className="mt-6">Surat ini dibuat berdasarkan permohonan warga yang bersangkutan pada tanggal {selectedSuratModal.tgl} untuk dipergunakan sebagaimana mestinya.</p>
                     
                     {normalizeStatus(selectedSuratModal.status) === "SELESAI" && (
                       <div className="mt-16 flex justify-end">
                         <div className="text-center">
                           <p className="mb-20">Kepala Desa Digital</p>
                           <p className="font-bold underline uppercase">( Ditandatangani Secara Elektronik )</p>
                         </div>
                       </div>
                     )}
                   </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${getStatusBadgeClass(selectedSuratModal.status)}`}>
                   Status Saat Ini: {getStatusLabel(selectedSuratModal.status)}
                </span>
                
                {normalizeStatus(selectedSuratModal.status) === "SELESAI" && (
                  <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all">
                    <Download size={18} /> Simpan PDF
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}