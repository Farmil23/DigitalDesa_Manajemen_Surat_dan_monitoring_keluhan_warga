import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              DigiDesa
            </Link>
          </div>

          {/* Menu Links */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">Beranda</Link>
            <Link to="/lapor" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium">Lapor Warga</Link>
          </div>

          {/* Tombol Login */}
          <div>
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
              Masuk / Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;