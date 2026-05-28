import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../services/api"; // Axios instance konfigurasi kamu
import { 
  FileText, 
  Search, 
  ArrowRight,
  Zap,
  Info,
  Clock,
  UserCheck,
  CreditCard,
  Flag,
  Users,
  MapPin,
  ArrowLeft,
  X,
  Loader2,
} from "lucide-react";

// ─── CONFIGURATION ANIMASI ───────────────────────────────────────────────────

const EASE_SPRING = [0.16, 1, 0.3, 1];

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.05, ease: EASE_SPRING }
  })
};

// ─── DATA LAYANAN KATALOG ─────────────────────────────────────────────────────

const KATEGORI = ["Semua", "Surat Keterangan", "Kependudukan", "Laporan & Aspirasi"];

const DAFTAR_LAYANAN = [
  { 
    title: "Surat Keterangan Domisili", 
    desc: "Untuk keperluan pembukaan rekening bank, lamaran kerja, atau administrasi lainnya.",
    category: "Surat Keterangan",
    time: "Instan",
    icon: MapPin,
    color: "blue"
  },
  { 
    title: "Surat Keterangan Usaha (SKU)", 
    desc: "Syarat utama pengajuan kredit usaha atau legalitas usaha mikro di lingkungan desa.",
    category: "Surat Keterangan",
    time: "1 Hari Kerja",
    icon: CreditCard,
    color: "indigo"
  },
  { 
    title: "Update Data Kartu Keluarga", 
    desc: "Sinkronisasi data jumlah anggota keluarga atau perubahan status kependudukan.",
    category: "Kependudukan",
    time: "Sistem Terpusat",
    icon: Users,
    color: "violet"
  },
  { 
    title: "Lapor Infrastruktur Rusak", 
    desc: "Adukan kerusakan jalan, lampu penerangan, atau selokan untuk segera diperbaiki.",
    category: "Laporan & Aspirasi",
    time: "24/7",
    icon: Flag,
    color: "red"
  },
  { 
    title: "Surat Pengantar Nikah", 
    desc: "Dokumen awal sebagai syarat administrasi di tingkat KUA atau pencatatan sipil.",
    category: "Surat Keterangan",
    time: "2 Hari Kerja",
    icon: FileText,
    color: "blue"
  },
  { 
    title: "Pendaftaran Warga Baru", 
    desc: "Prosedur pelaporan diri bagi warga yang baru pindah ke lingkungan RW setempat.",
    category: "Kependudukan",
    time: "Validasi Digital",
    icon: UserCheck,
    color: "violet"
  }
];

export default function Layanan() {
  const [filter, setFilter] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // ─── STATE KONTROL FORM MODAL & API SUBMIT ───
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLayanan, setSelectedLayanan] = useState<any>(null);
  const [keperluan, setKeperluan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil session data user login dari localStorage untuk auto-fill biodata warga
  const userLocal = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;

  const filteredServices = DAFTAR_LAYANAN.filter(s => 
    (filter === "Semua" || s.category === filter) &&
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. Fungsi Trigger saat tombol "Gunakan Layanan" diklik
  const handleOpenForm = (service: any) => {
    setSelectedLayanan(service);
    setKeperluan(""); // Clear input field sebelumnya
    setIsModalOpen(true);
  };

  // 2. Fungsi Kirim Data Form ke Backend Spring Boot
  const handleSubmitForm = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!keperluan.trim()) return toast.error("Mohon isi alasan atau keperluan pengajuan!");
    if (!userLocal?.nik) return toast.error("Sesi Anda habis atau NIK tidak ditemukan. Mohon login kembali.");

    setIsSubmitting(true);
    try {
      // FIX KUNCI: Menambahkan properti 'nik' agar mekanisme bypass backend bekerja sempurna!
      const response = await api.post("/warga/surat/ajukan", {
        jenis_surat: selectedLayanan.title,
        jenisSurat: selectedLayanan.title, 
        keperluan: keperluan,
        nik: userLocal.nik // <-- NIK terkirim langsung ke DTO Java
      });

      if (response.data.success || response.data) {
        toast.success(`Pengajuan ${selectedLayanan.title} berhasil terkirim!`);
        setIsModalOpen(false);
        setKeperluan(""); // Reset isi field form
        navigate("/dashboard-warga"); // Arahkan warga ke dashboard untuk monitoring status live
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal memproses pengajuan surat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9FC] font-sans antialiased pb-20 text-slate-900">
      
      {/* ── HEADER LAYANAN ── */}
      <section className="bg-slate-900 pt-16 pb-20 px-8 relative overflow-hidden">
        <div className="max-w-6xl mx-auto mb-12 relative z-20">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/dashboard-warga')}
            className="flex items-center gap-3 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
            <span className="text-xs font-black uppercase tracking-widest">Kembali ke Dashboard</span>
          </motion.button>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20" />
        <div className="absolute -left-20 bottom-0 w-72 h-72 bg-cyan-500 rounded-full blur-[120px] opacity-10" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial="hidden" animate="visible" variants={FADE_UP} custom={0}>
            <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Katalog Layanan Digital</span>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-6 tracking-tighter leading-none">
              Solusi Administrasi <br/> <span className="text-blue-500 font-serif italic">Satu Pintu.</span>
            </h1>
          </motion.div>

          {/* Search Bar */}
          <motion.div initial="hidden" animate="visible" variants={FADE_UP} custom={1} className="mt-12 max-w-2xl relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari layanan (misal: Domisili, Usaha...)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-[2rem] py-5 pl-14 pr-6 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-xl transition-all"
            />
          </motion.div>
        </div>
      </section>

      {/* ── FILTER KATEGORI ── */}
      <section className="max-w-6xl mx-auto px-8 -mt-8 relative z-20">
        <div className="flex flex-wrap gap-3 bg-white/90 backdrop-blur-xl p-3 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-900/5">
          {KATEGORI.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-3 rounded-full text-xs font-black transition-all duration-300 ${
                filter === cat 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── GRID CATALOG LAYANAN ── */}
      <section className="max-w-6xl mx-auto px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service, i) => {
            const IconComponent = service.icon;
            const colorMap: any = {
              blue: "from-blue-500/10 to-blue-500/5 text-blue-600 bg-blue-50",
              indigo: "from-indigo-500/10 to-indigo-500/5 text-indigo-600 bg-indigo-50",
              violet: "from-violet-500/10 to-violet-500/5 text-violet-600 bg-violet-50",
              red: "from-red-500/10 to-red-500/5 text-red-600 bg-red-50"
            };

            return (
              <motion.button
                key={service.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={FADE_UP}
                custom={i}
                whileHover={{ y: -8 }}
                onClick={() => handleOpenForm(service)}
                className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.04)] hover:border-blue-200 text-left transition-all flex flex-col justify-between w-full min-h-[320px]"
              >
                <div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-all duration-500 shadow-sm ${colorMap[service.color] || colorMap.blue}`}>
                    <IconComponent className="group-hover:text-white transition-colors" size={24} strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md leading-none">{service.category}</span>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                      <Clock size={10} /> {service.time}
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">{service.title}</h3>
                  <p className="text-slate-500 text-sm mt-4 leading-relaxed font-medium line-clamp-3">
                    {service.desc}
                  </p>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between w-full">
                  {/* FIX TYPO: gap-2ADA sudah dibersihkan menjadi gap-2 */}
                  <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                    Gunakan Layanan <ArrowRight size={14} strokeWidth={3} />
                  </span>
                  <Info size={16} className="text-slate-200 group-hover:text-blue-200 transition-colors" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
            <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Layanan tidak ditemukan</h3>
            <p className="text-slate-400 text-sm mt-2">Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p>
          </div>
        )}
      </section>

      {/* ── FOOTER INFO ── */}
      <section className="max-w-4xl mx-auto px-8 mt-24">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-10 rounded-[3rem] border border-blue-100/50 flex flex-col md:flex-row items-center gap-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
            <Zap className="text-white" size={28} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-black text-slate-900 tracking-tight">Verifikasi Otomatis</h4>
            <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
              Sistem kami terhubung langsung dengan database kependudukan desa. Pastikan data profil Anda sudah terverifikasi untuk menggunakan layanan instan.
            </p>
          </div>
          <button onClick={() => navigate('/dashboard-warga')} className="whitespace-nowrap px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
            Cek Status Surat Saya
          </button>
        </div>
      </section>

      {/* ─── MODAL PREMIUM OVERLAY FORM PENGISIAN DATA SURAT KEPENDUDUKAN ─── */}
      <AnimatePresence>
        {isModalOpen && selectedLayanan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, y: 16, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_SPRING }}
              className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl relative my-8"
            >
              {/* Tombol Close */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 z-20 w-9 h-9 flex items-center justify-center bg-white/90 text-slate-400 hover:text-slate-900 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div className="grid md:grid-cols-[1.05fr_0.95fr]">
                <div className="relative overflow-hidden bg-slate-900 px-8 py-10 text-white sm:px-10">
                  <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/25 blur-3xl" />
                  <div className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
                  <p className="relative text-[10px] font-black uppercase tracking-[0.28em] text-blue-200/80">Permohonan Dokumen Resmi</p>
                  <h3 className="relative mt-4 text-3xl font-black tracking-tight">{selectedLayanan.title}</h3>
                  <p className="relative mt-4 max-w-md text-sm leading-relaxed text-slate-300">Isi keperluan Anda dengan singkat dan jelas. Data pemohon diambil dari profil warga yang sudah tersinkron ke sistem.</p>

                  <div className="relative mt-8 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">Pemohon</p>
                      <p className="mt-1 text-sm font-bold text-white">{userLocal?.nama_lengkap || userLocal?.namaLengkap || "Warga DigiDesa"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">NIK</p>
                      <p className="mt-1 text-sm font-bold text-white tracking-wider">{userLocal?.nik || "-"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-300">Wilayah</p>
                      <p className="mt-1 text-sm font-bold text-white">RT {userLocal?.rt || "01"} / RW {userLocal?.rw || "10"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white px-8 py-10 sm:px-10">
                  <form onSubmit={handleSubmitForm} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status Domisili</p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{userLocal?.status_tinggal || userLocal?.statusTinggal || "TETAP"}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Jenis Layanan</p>
                        <p className="mt-1 text-sm font-bold text-slate-900 truncate">{selectedLayanan.title}</p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="surat-keperluan" className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Maksud / Keperluan</label>
                      <textarea
                        id="surat-keperluan"
                        required
                        value={keperluan}
                        onChange={(e) => setKeperluan(e.target.value)}
                        placeholder="Contoh: Digunakan sebagai syarat administrasi kelengkapan berkas lamaran kerja di PT. Surya Kencana Bandung."
                        className="h-32 w-full resize-none rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    <div className="rounded-[1.75rem] border border-blue-100 bg-blue-50/70 p-4 text-xs leading-relaxed text-blue-800">
                      <div className="flex items-start gap-2.5">
                        <Info size={15} className="mt-0.5 shrink-0 text-blue-600" />
                        <p>Data pemohon diambil langsung dari profil kependudukan. Jika ada ketidaksesuaian, perbarui data sebelum mengirim pengajuan.</p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-[11px] font-black uppercase tracking-[0.24em] text-white transition-all hover:-translate-y-0.5 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Kirim Permohonan Surat <ArrowRight size={14} /></>}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}