import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBoxOpen,
  FaClipboardList,
  FaUsers,
  FaSignOutAlt,
  FaTicketAlt
} from "react-icons/fa";
import { RiShareForwardLine } from "react-icons/ri";
import { MdHistory } from "react-icons/md";

import { useAuth } from "../contexts/useAuth";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200
    ${isActive
      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
      : "text-gray-400 hover:text-white hover:bg-gray-800"}`;

  return (
    <aside className="flex flex-col h-screen w-64 bg-gray-900 border-r border-gray-800">
      {/* Brand Header */}
      <div className="flex items-center justify-center h-16 bg-gradient-to-r from-purple-700 to-indigo-700 shadow-md">
        <span className="text-xl font-bold text-white tracking-wide">
          Utkalshri Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-1 px-3">
          <li>
            <NavLink to="/" className={navLinkClass}>
              <FaHome className="w-5 h-5 group-hover:scale-110 transition" />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className={navLinkClass}>
              <FaBoxOpen className="w-5 h-5 group-hover:scale-110 transition" />
              Products
            </NavLink>
          </li>
          <li>
            <NavLink to="/orders" className={navLinkClass}>
              <FaClipboardList className="w-5 h-5 group-hover:scale-110 transition" />
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink to="/customers" className={navLinkClass}>
              <FaUsers className="w-5 h-5 group-hover:scale-110 transition" />
              Customers
            </NavLink>
          </li>
          <li>
            <NavLink to="/coupons" className={navLinkClass}>
              <FaTicketAlt className="w-5 h-5 group-hover:scale-110 transition" />
              Coupons
            </NavLink>
          </li>
          <li>
            <NavLink to="/referral" className={navLinkClass}>
              <RiShareForwardLine className="w-5 h-5 group-hover:scale-110 transition" />
              Referral
            </NavLink>
          </li>
          <li>
            <NavLink to="/referral-usage" className={navLinkClass}>
              <MdHistory className="w-5 h-5 group-hover:scale-110 transition" />
              Referral Usage
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="border-t border-gray-800 px-4 py-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition duration-150"
        >
          <FaSignOutAlt className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
