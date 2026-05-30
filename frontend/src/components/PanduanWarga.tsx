import { motion } from "framer-motion";
import { UserCheck, FileText, Activity } from "lucide-react";

export default function PanduanWarga() {
  const steps = [
    {
      step: 1,
      title: "Lengkapi Profil",
      desc: "Isi NIK dan data diri dengan benar. Sistem akan memverifikasi identitas Anda secara otomatis.",
      icon: UserCheck,
      color: "red",
    },
    {
      step: 2,
      title: "Pilih Layanan",
      desc: "Ajukan surat pengantar atau laporkan masalah lingkungan melalui menu yang tersedia tanpa harus antre.",
      icon: FileText,
      color: "rose",
    },
    {
      step: 3,
      title: "Pantau Real-time",
      desc: "Cek progres surat atau status pengaduan Anda langsung dari Dasbor. Anda akan diberitahu jika sudah selesai.",
      icon: Activity,
      color: "emerald",
    },
  ];

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden my-8">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50" />
      <div className="relative z-10">
        <div className="mb-8 text-center sm:text-left">
          <span className="px-4 py-1.5 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-red-100 mb-3 inline-block">
            Panduan Pengguna Baru
          </span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">3 Langkah Mudah DigiDesa</h3>
          <p className="text-slate-500 text-sm mt-2 font-medium">Ikuti panduan sederhana ini untuk mulai menggunakan layanan digital desa.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              className="bg-slate-50 rounded-3xl p-6 border border-slate-100 relative group hover:border-red-200 transition-all hover:bg-white hover:shadow-lg"
            >
              <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <s.icon className={s.color === "emerald" ? "text-emerald-500" : s.color === "rose" ? "text-rose-500" : "text-red-600"} size={22} strokeWidth={2.5} />
              </div>
              <h4 className="font-black text-slate-900 mb-2">{s.step}. {s.title}</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
