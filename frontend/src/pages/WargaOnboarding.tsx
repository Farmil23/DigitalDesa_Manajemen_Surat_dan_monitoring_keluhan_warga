import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  ShieldAlert, 
  UploadCloud, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  Loader2, 
  FileText, 
  Home,
  LogOut,
  MapPin
} from "lucide-react";

interface OnboardingProps {
  userStatus: string;
  onVerified: () => void; // Callback jika tiba-tiba di-acc atau akun sudah aman
}

export default function WargaOnboarding({ userStatus, onVerified }: OnboardingProps) {
  const [status, setStatus] = useState(userStatus);
  const [alasanDitolak, setAlasanDitolak] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);

  // State Form Mandiri Warga (Sudah Diperluas dengan Alamat, RT, RW)
  const [formData, setFormData] = useState({
    no_kk: "",
    status_hubungan: "Kepala Keluarga",
    status_tinggal: "TETAP",
    alamat: "",
    rt: "",
    rw: "",
    foto_ktp: null as File | null
  });

  // 1. Ambil Profil Terbaru untuk Memastikan Status Akun Riil dari DB
  const checkCurrentStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/v1/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const raw = res.data.data.status_akun;
        const normalize = (s: string) => {
          const v = (s || "").toString().trim().toUpperCase();
          if (v.includes("VERIFIED")) return "VERIFIED";
          if (v === "INCOMPLETE") return "INCOMPLETE";
          if (v === "PENDING" || v === "PENDING_ADMIN" || v === "PENDING_VERIFICATION") return "PENDING";
          if (v === "REJECTED" || v === "REJECTED_ADMIN") return "REJECTED";
          return v || "INCOMPLETE";
        };

        const currentStatus = normalize(raw);
        setStatus(currentStatus);
        setAlasanDitolak(res.data.data.alasan_ditolak || "");

        // persist ke localStorage agar routing konsisten
        localStorage.setItem("statusAkun", currentStatus);

        // Jika ternyata sudah di-acc Admin saat di-refresh
        if (currentStatus === "VERIFIED") {
          onVerified();
        }
      }
    } catch (error) {
      console.error("Gagal sinkronisasi status verifikasi:", error);
    } // -- FIXED: Typo kata kunci JavaScript diperbaiki menjadi double 'l' --
    finally {
      setIsFetchingProfile(false);
    }
  };

  useEffect(() => {
    // pastikan status awal dari prop juga ternormalisasi
    const normalizeProp = (raw: string) => {
      const v = (raw || "").toString().trim().toUpperCase();
      if (v.includes("VERIFIED")) return "VERIFIED";
      if (v === "INCOMPLETE") return "INCOMPLETE";
      if (v === "PENDING" || v === "PENDING_ADMIN" || v === "PENDING_VERIFICATION") return "PENDING";
      if (v === "REJECTED" || v === "REJECTED_ADMIN") return "REJECTED";
      return v || "INCOMPLETE";
    };

    setStatus(normalizeProp(userStatus));
    checkCurrentStatus();
  }, []);

  // 2. Handle Kirim Data Formulir Mandiri
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.foto_ktp) return alert("Silakan unggah foto KTP/KK terlebih dahulu!");
    if (formData.no_kk.length !== 16) return alert("Nomor Kartu Keluarga (KK) harus tepat 16 digit angka!");
    if (!formData.alamat.trim()) return alert("Alamat rumah tidak boleh kosong!");
    if (!formData.rt.trim() || !formData.rw.trim()) return alert("Kolom RT dan RW wajib diisi!");

    setIsLoading(true);
    const data = new FormData();
    data.append("no_kk", formData.no_kk);
    data.append("status_hubungan", formData.status_hubungan);
    data.append("status_tinggal", formData.status_tinggal);
    data.append("alamat", formData.alamat); 
    data.append("rt", formData.rt);         
    data.append("rw", formData.rw);         
    data.append("foto_ktp", formData.foto_ktp);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/v1/auth/onboarding", data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data.success) {
        alert("Data formulir kependudukan berhasil dikirim ke Admin!");
        setStatus("PENDING"); // Ubah UI ke mode stand-by/menunggu
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal mengirim formulir onboarding");
    } // -- FIXED: Typo kata kunci JavaScript diperbaiki menjadi double 'l' --
    finally {
      setIsLoading(false);
    }
  };

  // 3. Fungsi Logout (Jika warga ingin keluar akun)
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  if (isFetchingProfile) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memeriksa Otoritas Akun...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased flex items-center justify-center p-6 relative">
      
      {/* Tombol Logout di Pojok Atas */}
      <button 
        onClick={handleLogout}
        className="absolute top-8 right-8 flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold shadow-sm hover:bg-red-50 hover:text-red-600 transition-all"
      >
        <LogOut size={14} /> Keluar Akun
      </button>

      <div className="w-full max-w-2xl bg-white rounded-[3rem] border border-slate-100 shadow-xl p-12 relative overflow-hidden">
        
        {/* ─── KONDISI 1: INCOMPLETE & REJECTED (FORMULIR ISI DATA) ─── */}
        {(status === "INCOMPLETE" || status === "REJECTED") && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${status === 'REJECTED' ? 'bg-red-500 shadow-red-500/20' : 'bg-red-600 shadow-red-600/20'}`}>
                {status === 'REJECTED' ? <XCircle size={26} /> : <ShieldAlert size={26} />}
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {status === 'REJECTED' ? 'Verifikasi Data Ditolak' : 'Verifikasi Akun Warga'}
                </h1>
                <p className="text-xs font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Formulir Kependudukan Mandiri DigiDesa</p>
              </div>
            </div>

            {/* Alertbox khusus jika statusnya REJECTED (Ditolak Admin) */}
            {status === "REJECTED" && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3.5">
                <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-black text-red-700 uppercase tracking-wide">Alasan Penolakan Dari RT/RW:</p>
                  <p className="text-sm font-bold text-red-600 mt-1">"{alasanDitolak || 'Data fisik KTP tidak sesuai atau tidak jelas.'}"</p>
                  <p className="text-[10px] font-medium text-red-400 mt-2">Mohon periksa kembali inputan Anda dan ajukan ulang formulir di bawah ini dengan benar.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* INPUT 1: NOMOR KK */}
              <div>
                <label htmlFor="no_kk" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Nomor Kartu Keluarga (KK)</label>
                <div className="relative flex items-center">
                  <input 
                    id="no_kk"
                    required 
                    type="number" 
                    value={formData.no_kk}
                    onChange={(e) => setFormData({...formData, no_kk: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:border-red-600 outline-none transition-colors" 
                    placeholder="Masukkan 16 digit nomor KK" 
                  />
                  <FileText size={16} className="absolute left-4 text-slate-400" />
                </div>
              </div>

              {/* INPUT GRID ALAMAT, RT, RW */}
              <div className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl space-y-4">
                <div>
                  <label htmlFor="alamat" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Alamat Rumah Lengkap (Domisili Sekarang)</label>
                  <div className="relative flex items-center">
                    <input 
                      id="alamat"
                      required 
                      type="text" 
                      value={formData.alamat}
                      onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:border-red-600 outline-none transition-colors" 
                      placeholder="Contoh: Jl. Cisaladah No. 12 RT 01" 
                    />
                    <Home size={16} className="absolute left-4 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="rt" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Rukun Tetangga (RT)</label>
                    <div className="relative flex items-center">
                      <input 
                        id="rt"
                        required 
                        type="text" 
                        maxLength={5}
                        value={formData.rt}
                        onChange={(e) => setFormData({...formData, rt: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold focus:border-red-600 outline-none transition-colors" 
                        placeholder="Misal: 01" 
                      />
                      <MapPin size={14} className="absolute left-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="rw" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Rukun Warga (RW)</label>
                    <div className="relative flex items-center">
                      <input 
                        id="rw"
                        required 
                        type="text" 
                        maxLength={5}
                        value={formData.rw}
                        onChange={(e) => setFormData({...formData, rw: e.target.value})}
                        className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold focus:border-red-600 outline-none transition-colors" 
                        placeholder="Misal: 10" 
                      />
                      <MapPin size={14} className="absolute left-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* INPUT SELECT HUBUNGAN & DOMISILI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="status_hubungan" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Status Hubungan di KK</label>
                  <select 
                    id="status_hubungan"
                    value={formData.status_hubungan}
                    onChange={(e) => setFormData({...formData, status_hubungan: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:border-red-600 outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Kepala Keluarga">Kepala Keluarga</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Anggota Keluarga">Anggota Keluarga</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status_tinggal" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Status Domisili / Tinggal</label>
                  <select 
                    id="status_tinggal"
                    value={formData.status_tinggal}
                    onChange={(e) => setFormData({...formData, status_tinggal: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:border-red-600 outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="TETAP">Warga Tetap (Lokal Desa)</option>
                    <option value="PENDATANG">Warga Pendatang (Kontrak/Kos)</option>
                  </select>
                </div>
              </div>

              {/* COMPONENT UPLOAD FOTO BUKTI */}
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-1.5 block">Unggah Foto KTP / Berkas KK</span>
                <label className="w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 hover:border-red-500 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer relative overflow-hidden group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e: any) => setFormData({...formData, foto_ktp: e.target.files[0]})}
                    className="hidden" 
                  />
                  {formData.foto_ktp ? (
                    <div className="text-center p-4">
                      <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={32} />
                      <p className="text-sm font-black text-slate-800 tracking-tight max-w-xs truncate">{formData.foto_ktp.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Klik untuk mengganti gambar</p>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <UploadCloud className="mx-auto mb-2 group-hover:text-red-600 group-hover:scale-110 transition-transform" size={36} />
                      <p className="text-xs font-black uppercase text-slate-700 tracking-wide">Pilih Gambar KTP</p>
                      <p className="text-[10px] font-medium mt-1">Format JPG, JPEG, PNG (Maks 5MB)</p>
                    </div>
                  )}
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 mt-4 bg-red-600 hover:bg-red-700 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-red-600/20 flex justify-center items-center gap-2 transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Formulir Verifikasi"}
              </button>
            </form>
          </div>
        )}

        {/* ─── KONDISI 2: PENDING (MENUNGGU ACC ADMIN) ─── */}
        {status === "PENDING" && (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[2rem] flex items-center justify-center shadow-xl shadow-amber-500/10 mb-8 border border-amber-100 animate-pulse">
              <Clock size={36} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Menunggu Verifikasi Data</h2>
            <p className="text-sm font-bold text-slate-400 max-w-md mt-3 leading-relaxed">
              Formulir kependudukan mandiri Anda berhasil direkam. Saat ini data sedang dalam proses peninjauan audit oleh Admin RT/RW setempat.
            </p>
            
            <div className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 mt-10 text-left space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 uppercase tracking-wider">Durasi Proses</span>
                <span className="text-slate-900 font-black">Estimasi 1 x 24 Jam</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold border-t border-slate-200/60 pt-3">
                <span className="text-slate-400 uppercase tracking-wider">Status Berkas</span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-wider">Pending Audit</span>
              </div>
            </div>

            <button 
              onClick={checkCurrentStatus}
              className="mt-10 px-8 py-3.5 bg-slate-900 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              Refresh Status Akun
            </button>
          </div>
        )}

      </div>
    </div>
  );
}