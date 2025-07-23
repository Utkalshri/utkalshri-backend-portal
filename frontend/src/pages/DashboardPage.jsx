import { useEffect, useState } from 'react';
import { getDashboardSummary } from '../services/api';
import { useAuth } from '../contexts/useAuth';

const DashboardPage = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await getDashboardSummary(token);
        setSummary(res.data);
      } catch (err) {
        setError('Failed to load dashboard.');
        console.log(err);
        
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [token]);

  if (loading) {
    return <div className="p-4">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (!summary) {
    return <div className="p-4">No data available.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Products</h2>
          <p className="text-3xl font-bold">{summary.total_products ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-3xl font-bold">{summary.total_orders ?? 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Low Stock Items</h2>
          <p className="text-3xl font-bold">{summary.low_stock_count ?? 0}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
