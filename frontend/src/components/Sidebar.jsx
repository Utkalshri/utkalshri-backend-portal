import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBoxOpen,
  FaClipboardList,
  FaSignOutAlt
} from "react-icons/fa";
import { useAuth } from "../contexts/useAuth";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
     ${isActive
      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
      : "text-gray-300 hover:bg-gray-800 hover:text-white"}`;

  return (
    <aside className="flex flex-col h-screen w-64 bg-gray-900 shadow-lg">
      {/* Brand Header */}
      <div className="flex items-center justify-center h-16 border-b border-gray-800 bg-gradient-to-r from-purple-700 to-indigo-700">
        <span className="text-xl font-bold text-white tracking-wide">
          🧵 Utkalshri Backend
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          <li>
            <NavLink to="/" className={navLinkClass}>
              <FaHome className="w-5 h-5" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className={navLinkClass}>
              <FaBoxOpen className="w-5 h-5" />
              Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/orders" className={navLinkClass}>
              <FaClipboardList className="w-5 h-5" />
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink to="/customers" className={navLinkClass}>
              <FaClipboardList className="w-5 h-5" />
              Customers
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-medium"
        >
          <FaSignOutAlt className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
