import { useEffect, useState } from "react";
import { getDashboardSummary } from "../services/api";
import { useAuth } from "../contexts/useAuth";
import { FaBoxOpen, FaClipboardList, FaExclamationTriangle } from "react-icons/fa";

const DashboardPage = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await getDashboardSummary(token);
        setSummary(res.data);
      } catch (err) {
        setError("Failed to load dashboard.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [token]);

  if (loading) return <div className="p-6 text-gray-600">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!summary) return <div className="p-6">No data available.</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📊 Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        
        {/* Total Products */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white p-5 rounded-xl shadow-md flex items-center gap-4">
          <FaBoxOpen className="text-4xl opacity-80" />
          <div>
            <h2 className="text-sm font-medium uppercase">Total Products</h2>
            <p className="text-3xl font-bold">{summary.total_products ?? 0}</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-5 rounded-xl shadow-md flex items-center gap-4">
          <FaClipboardList className="text-4xl opacity-80" />
          <div>
            <h2 className="text-sm font-medium uppercase">Total Orders</h2>
            <p className="text-3xl font-bold">{summary.total_orders ?? 0}</p>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-5 rounded-xl shadow-md flex items-center gap-4">
          <FaExclamationTriangle className="text-4xl opacity-80" />
          <div>
            <h2 className="text-sm font-medium uppercase">Low Stock Items</h2>
            <p className="text-3xl font-bold">{summary.low_stock_count ?? 0}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
