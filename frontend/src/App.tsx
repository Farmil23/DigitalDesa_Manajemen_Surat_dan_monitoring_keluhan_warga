import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, type ReactElement } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import DashboardWarga from "./pages/DashboardWarga";
import Layanan from "./pages/Layanan";
import Lapor from "./pages/Lapor";
import Finansial from "./pages/Finansial";
import Profil from "./pages/Profil";

import AdminDashboard from "./pages/AdminDashboard";
import AdminValidasiSurat from "./pages/AdminValidasiSurat";
import AdminLaporan from "./pages/AdminLaporan";
import AdminPenduduk from "./pages/AdminPenduduk";
import AdminKeuangan from "./pages/AdminKeuangan";
import AdminPengaturan from "./pages/AdminPengaturan";

import WargaOnboarding from "./pages/WargaOnboarding";

// ─── GATEKEEPER IMPLEMENTATION (SYSTEM ANALYST GUARD) ───
const ProtectedRoute = ({ children, requiredRole }: { children: ReactElement, requiredRole?: string }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const statusAkun = localStorage.getItem("statusAkun") || "INCOMPLETE";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika rolenya WARGA dan status kependudukannya belum VERIFIED, paksa onboarding
  if (userRole === "WARGA" && statusAkun !== "VERIFIED") {
    return <Navigate to="/onboarding" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const OnboardingRoute = ({
  currentStatus,
  setCurrentStatus,
}: {
  currentStatus: string;
  setCurrentStatus: (next: string) => void;
}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <WargaOnboarding
      userStatus={currentStatus}
      onVerified={() => {
        localStorage.setItem("statusAkun", "VERIFIED");
        setCurrentStatus("VERIFIED");
        globalThis.location.href = "/dashboard-warga";
      }}
    />
  );
};

function App() {
  const [currentStatus, setCurrentStatus] = useState<string>(
    localStorage.getItem("statusAkun") || "INCOMPLETE"
  );

  return (
    <Router>
      <div className="font-sans text-slate-900 antialiased bg-slate-50 min-h-screen">
        <Routes>
          {/* Rute Publik */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Rute Onboarding */}
          <Route
            path="/onboarding"
            element={<OnboardingRoute currentStatus={currentStatus} setCurrentStatus={setCurrentStatus} />}
          />
          {/* Alias route lama biar tidak putus (opsional) */}
          <Route
            path="/lengkapi-data"
            element={<OnboardingRoute currentStatus={currentStatus} setCurrentStatus={setCurrentStatus} />}
          />

          {/* Rute Warga (Butuh Login & Wajib VERIFIED) */}
          <Route path="/dashboard-warga" element={<ProtectedRoute requiredRole="WARGA"><DashboardWarga /></ProtectedRoute>} />
          <Route path="/layanan" element={<ProtectedRoute requiredRole="WARGA"><Layanan /></ProtectedRoute>} />
          <Route path="/lapor" element={<ProtectedRoute requiredRole="WARGA"><Lapor /></ProtectedRoute>} />
          <Route path="/finansial" element={<ProtectedRoute requiredRole="WARGA"><Finansial /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute requiredRole="WARGA"><Profil /></ProtectedRoute>} />

          {/* Rute Admin */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/validasi" element={<ProtectedRoute requiredRole="ADMIN"><AdminValidasiSurat /></ProtectedRoute>} />
          <Route path="/admin/laporan" element={<ProtectedRoute requiredRole="ADMIN"><AdminLaporan /></ProtectedRoute>} />
          <Route path="/admin/penduduk" element={<ProtectedRoute requiredRole="ADMIN"><AdminPenduduk /></ProtectedRoute>} />
          <Route path="/admin/keuangan" element={<ProtectedRoute requiredRole="ADMIN"><AdminKeuangan /></ProtectedRoute>} />
          <Route path="/admin/pengaturan" element={<ProtectedRoute requiredRole="ADMIN"><AdminPengaturan /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;