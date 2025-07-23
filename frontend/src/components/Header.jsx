import { useAuth } from "../contexts/useAuth";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";

const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-gradient-to-r from-purple-700 to-indigo-700 border-b shadow flex justify-between items-center px-6 py-3">
      {/* <h1 className="text-xl font-semibold text-gray-800">📊 Sambalpuri Admin Dashboard</h1> */}
      <button
        onClick={handleLogout}
        className="ml-auto flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition"
      >
        <FaSignOutAlt className="w-4 h-4" />
        Logout
      </button>
    </header>
  );
};

export default Header;
