import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  Flag,
  Image as ImageIcon,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import WargaTopNav from "../components/WargaTopNav";

const EASE_SPRING = [0.16, 1, 0.3, 1];

const FADE_UP = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: EASE_SPRING },
  }),
};

const STEP_ITEMS = [
  { title: "Pilih kategori", desc: "Infrastruktur, sosial, keamanan, lingkungan", icon: Flag },
  { title: "Tambahkan lokasi", desc: "Cantumkan RT / RW atau titik spesifik", icon: MapPin },
  { title: "Pantau status", desc: "Laporan diproses dan status diperbarui", icon: CheckCircle2 },
];

export default function Lapor() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    judul: "",
    kategori: "Infrastruktur",
    deskripsi: "",
    lokasi: "",
  });

  const handleKirimPengaduan = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        judul: formData.judul.trim(),
        kategori: formData.kategori,
        deskripsi: formData.deskripsi.trim(),
        lokasi: formData.lokasi.trim() ? formData.lokasi.trim() : null,
      };

      const response = await api.post("/warga/pengaduan", payload);
      if (response.data?.success === false) {
        throw new Error(response.data?.message || "Gagal mengirim pengaduan");
      }

      setStep(2);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Gagal mengirim pengaduan";
      globalThis.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-red-200">
      <WargaTopNav />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-12">
        {step === 1 ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            <motion.section
              initial="hidden"
              animate="visible"
              variants={FADE_UP}
              custom={0}
              className="lg:col-span-2 space-y-6"
            >
              <div className="rounded-[2rem] border border-white bg-white p-7 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.25)]">
                <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-red-700">
                  <Sparkles size={12} />
                  Laporan Lebih Terarah
                </span>
                <h2 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-slate-950">
                  Buat aduan yang <span className="italic text-red-600">jelas, cepat, dan tenang.</span>
                </h2>
                <p className="mt-5 text-sm font-medium leading-relaxed text-slate-500">
                  Laporkan kendala lingkungan tanpa ribet. Visualnya dibuat lebih halus agar fokus Anda tetap ke isi laporan dan tindak lanjutnya.
                </p>

                <div className="mt-8 grid gap-3">
                  {STEP_ITEMS.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-950">{index + 1}. {item.title}</p>
                          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tim Desa</p>
                      <p className="text-sm font-bold text-slate-950">Respons terpantau</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                      <Clock3 size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Proses</p>
                      <p className="text-sm font-bold text-slate-950">3x24 jam</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            <motion.section initial="hidden" animate="visible" variants={FADE_UP} custom={1} className="lg:col-span-3">
              <form onSubmit={handleKirimPengaduan} className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_26px_80px_-36px_rgba(15,23,42,0.28)]">
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-red-900 px-7 py-7 text-white sm:px-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-200/80">Formulir Aduan</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">Sampaikan masalah yang ingin diperbaiki</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">
                    Gunakan deskripsi yang singkat namun lengkap supaya petugas bisa menindaklanjuti lebih cepat.
                  </p>
                </div>

                <div className="space-y-6 px-7 py-8 sm:px-10">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <label htmlFor="lapor-judul" className="ml-1 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Judul Laporan</label>
                      <input
                        id="lapor-judul"
                        required
                        type="text"
                        placeholder="Contoh: Lampu jalan mati di Gang 3"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                        value={formData.judul}
                        onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor="lapor-lokasi" className="ml-1 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Lokasi</label>
                      <div className="relative">
                        <MapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          id="lapor-lokasi"
                          type="text"
                          placeholder="RT 01 / RW 10"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-11 pr-5 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                          value={formData.lokasi}
                          onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <fieldset className="space-y-3">
                      <legend className="ml-1 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Kategori</legend>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        "Infrastruktur",
                        "Keamanan",
                        "Sosial",
                        "Lingkungan",
                      ].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFormData({ ...formData, kategori: option })}
                          className={`rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                            formData.kategori === option
                              ? "border-blue-200 bg-red-50 text-red-700 shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    </fieldset>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="lapor-deskripsi" className="ml-1 block text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Deskripsi Aduan</label>
                    <textarea
                      id="lapor-deskripsi"
                      rows={5}
                      required
                      placeholder="Jelaskan secara detail kendala yang dialami, kapan terjadi, dan dampaknya bagi warga."
                      className="w-full resize-none rounded-[2rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    />
                  </div>

                  <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-7 transition-all hover:border-blue-300 hover:bg-red-50/40">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                        <ImageIcon size={22} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Unggah bukti foto opsional</p>
                      <p className="mt-2 max-w-md text-xs font-medium leading-relaxed text-slate-400">
                        Tambahkan foto untuk memperjelas kondisi di lapangan. Format PNG atau JPG hingga 10MB.
                      </p>
                      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500">
                        <Camera size={14} />
                        Klik untuk unggah atau seret file
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                      Aduan akan muncul di dashboard warga setelah dikirim.
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)] transition-all hover:-translate-y-0.5 hover:bg-red-600"
                    >
                      <Send size={16} />
                      {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.section>
          </div>
        ) : (
          <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto max-w-2xl">
            <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_28px_80px_-36px_rgba(15,23,42,0.28)]">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-8 text-white sm:px-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="mt-6 text-3xl font-black tracking-tight">Laporan terkirim</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-50/90">
                  Terima kasih. Aduan Anda sudah masuk ke antrian penanganan dan akan tampil di dashboard warga saat status berubah.
                </p>
              </div>

              <div className="space-y-5 p-8 sm:p-10">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Status awal</p>
                    <p className="mt-2 text-lg font-black text-slate-950">Menunggu Tinjauan</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Prioritas</p>
                    <p className="mt-2 text-lg font-black text-slate-950">Terdokumentasi</p>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-red-100 bg-red-50/60 p-5 text-sm leading-relaxed text-blue-800">
                  Jika ada data tambahan, Anda bisa mengirim laporan baru atau kembali ke dashboard untuk memantau tindak lanjut.
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate("/dashboard-warga")}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white transition-colors hover:bg-red-600"
                  >
                    Kembali ke Dashboard
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-600 transition-colors hover:border-blue-200 hover:text-red-600"
                  >
                    Buat Laporan Lain
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}