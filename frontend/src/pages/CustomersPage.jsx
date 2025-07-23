import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { useAuth } from "../contexts/useAuth";
import { getPaginatedCustomers } from "../services/api";
import CustomerViewModal from "../components/CustomerViewModal";

const CustomersPage = () => {
  const { token } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal state
  const [showView, setShowView] = useState(false);
  const [viewingCustomerId, setViewingCustomerId] = useState(null);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await getPaginatedCustomers(token, page, limit);
        setCustomers(res.data.data);
        setFilteredCustomers(res.data.data);
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
        setError("Failed to load customers.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [token, page]);

  // Search filter
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCustomers(customers);
    } else {
      const lower = searchQuery.toLowerCase();
      const filtered = customers.filter((c) =>
        [c.name, c.email, c.phone, c.status].some(
          (field) => field?.toLowerCase().includes(lower)
        )
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Customers Management</h2>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, phone, status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
      </div>

      {loading && <p className="text-gray-600">Loading customers...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          {filteredCustomers.length === 0 ? (
            <p className="text-gray-500">No customers found.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2 border-b">ID</th>
                    <th className="text-left px-4 py-2 border-b">Name</th>
                    <th className="text-left px-4 py-2 border-b">Email</th>
                    <th className="text-left px-4 py-2 border-b">Phone</th>
                    <th className="text-left px-4 py-2 border-b">Status</th>
                    <th className="text-left px-4 py-2 border-b">Orders</th>
                    <th className="text-left px-4 py-2 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b">{c.id}</td>
                      <td className="px-4 py-2 border-b">{c.name}</td>
                      <td className="px-4 py-2 border-b">{c.email || "-"}</td>
                      <td className="px-4 py-2 border-b">{c.phone || "-"}</td>
                      <td className="px-4 py-2 border-b">{c.status}</td>
                      <td className="px-4 py-2 border-b">{c.total_orders ?? 0}</td>
                      <td className="px-4 py-2 border-b">
                        <button
                          onClick={() => {
                            setViewingCustomerId(c.id);
                            setShowView(true);
                          }}
                           className="inline-flex items-center gap-2 px-4 py-1 bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 hover:border-blue-400 rounded-md transition duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          title="View"
                        >
                         View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(total / limit) || 1}
            </span>
            <button
              onClick={() =>
                setPage((p) =>
                  p < Math.ceil(total / limit) ? p + 1 : p
                )
              }
              disabled={page >= Math.ceil(total / limit)}
              className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Showing {filteredCustomers.length} of {total} customers
          </p>
        </>
      )}

      {/* View Modal */}
      {showView && viewingCustomerId && (
        <CustomerViewModal
          visible={showView}
          onClose={() => setShowView(false)}
          customerId={viewingCustomerId}
          token={token}
        />
      )}
    </div>
  );
};

export default CustomersPage;
