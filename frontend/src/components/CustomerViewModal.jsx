/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from "react";
import { getCustomerDetail } from "../services/api";

const getStatusBadgeClass = (status) => {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700";
    case "inactive":
      return "bg-gray-100 text-gray-600";
    case "blocked":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

const getOrderStatusBadge = (status) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "confirmed":
      return "bg-blue-100 text-blue-700";
    case "shipped":
      return "bg-indigo-100 text-indigo-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

const getPaymentStatusBadge = (status) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

const CustomerViewModal = ({ visible, onClose, customerId, token }) => {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customerId || !visible) return;

    const fetchCustomer = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getCustomerDetail(token, customerId);
        setCustomer(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load customer details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, token, visible]);

  if (!visible || !customerId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-3xl max-h-screen rounded-lg shadow-xl p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-800">Customer Details</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && customer && (
          <div className="space-y-8">
            {/* General Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div><strong>Customer ID:</strong> {customer.id}</div>
                <div><strong>Name:</strong> {customer.name}</div>
                <div><strong>Email:</strong> {customer.email || "-"}</div>
                <div><strong>Phone:</strong> {customer.phone || "-"}</div>
                <div className="md:col-span-2"><strong>Address:</strong> {customer.address || "-"}</div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span className={`inline-block px-2 py-0.5 text-xs rounded font-medium ${getStatusBadgeClass(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>
                <div><strong>Total Orders:</strong> {customer.total_orders ?? 0}</div>
                <div><strong>Total Spent:</strong> ₹{Number(customer.total_spent || 0).toFixed(2)}</div>
                <div><strong>Last Order At:</strong> {customer.created_at ? new Date(customer.created_at).toLocaleString() : "-"}</div>
              </div>
            </div>

            {/* Notes */}
            {customer.notes && (
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Notes</h3>
                <p className="border p-4 rounded bg-gray-50 text-gray-600 leading-relaxed">
                  {customer.notes}
                </p>
              </div>
            )}

            {/* Recent Orders */}
            <div>
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Recent Orders</h3>
              {customer.orders && customer.orders.length > 0 ? (
                <div className="space-y-6">
                  {customer.orders.map((o) => (
                    <div key={o.id} className="border rounded-lg p-4 bg-white shadow-md">
                      <div className="flex justify-between items-center mb-2">
                        <div><strong>Order ID:</strong> #{o.id}</div>
                        <div><strong>Total:</strong> ₹{Number(o.total_amount).toFixed(2)}</div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                        <span>
                          <strong>Status:</strong>{" "}
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getOrderStatusBadge(o.status)}`}>
                            {o.status}
                          </span>
                        </span>
                        <span>
                          <strong>Payment:</strong>{" "}
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getPaymentStatusBadge(o.payment_status)}`}>
                            {o.payment_status}
                          </span>
                        </span>
                        <span><strong>Date:</strong> {new Date(o.created_at).toLocaleString()}</span>
                      </div>
                      {o.items && o.items.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white text-sm border">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="text-left px-3 py-2 border-b">Product</th>
                                <th className="text-left px-3 py-2 border-b">Price</th>
                                <th className="text-left px-3 py-2 border-b">Qty</th>
                                <th className="text-left px-3 py-2 border-b">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 border-b">{item.product_name}</td>
                                  <td className="px-3 py-2 border-b">₹{Number(item.price).toFixed(2)}</td>
                                  <td className="px-3 py-2 border-b">{item.quantity}</td>
                                  <td className="px-3 py-2 border-b">₹{Number(item.total).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent orders found.</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerViewModal;
