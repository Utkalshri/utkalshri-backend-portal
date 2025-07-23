/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from "react";
import { getCustomerDetail } from "../services/api";

const CustomerViewModal = ({ visible, onClose, customerId, token }) => {
  if (!visible || !customerId) return null;

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
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
  }, [customerId, token]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Customer Details</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-xl"
          >
            &times;
          </button>
        </div>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && customer && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <strong>ID:</strong> {customer.id}
                </div>
                <div>
                  <strong>Name:</strong> {customer.name}
                </div>
                <div>
                  <strong>Email:</strong> {customer.email || "-"}
                </div>
                <div>
                  <strong>Phone:</strong> {customer.phone || "-"}
                </div>
                <div className="md:col-span-2">
                  <strong>Address:</strong> {customer.address || "-"}
                </div>
                <div>
                  <strong>Status:</strong> {customer.status}
                </div>
                <div>
                  <strong>Total Orders:</strong> {customer.total_orders ?? 0}
                </div>
                <div>
                  <strong>Total Spent:</strong> ₹
                  {Number(customer.total_spent || 0).toFixed(2)}
                </div>
                <div>
                  <strong>Last Order At:</strong>{" "}
                  {customer.created_at
                    ? new Date(customer.created_at).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>

            {customer.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="border p-3 rounded bg-gray-50">
                  {customer.notes}
                </p>
              </div>
            )}

            {/* Recent Orders */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Recent Orders</h3>
              {customer.orders && customer.orders.length > 0 ? (
                <div className="space-y-6">
                  {customer.orders.map((o) => (
                    <div
                      key={o.id}
                      className="border rounded p-3 bg-white shadow"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <strong>Order ID:</strong> {o.id}
                        </div>
                        <div>
                          <strong>Total:</strong> ₹
                          {Number(o.total_amount).toFixed(2)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Status:</strong> {o.status} |{" "}
                        <strong>Payment:</strong> {o.payment_status} |{" "}
                        <strong>Date:</strong>{" "}
                        {new Date(o.created_at).toLocaleString()}
                      </div>
                      {o.items && o.items.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white text-sm">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="text-left px-2 py-1 border-b">
                                  Product
                                </th>
                                <th className="text-left px-2 py-1 border-b">
                                  Price
                                </th>
                                <th className="text-left px-2 py-1 border-b">
                                  Qty
                                </th>
                                <th className="text-left px-2 py-1 border-b">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.items.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-2 py-1 border-b">
                                    {item.product_name}
                                  </td>
                                  <td className="px-2 py-1 border-b">
                                    ₹{Number(item.price).toFixed(2)}
                                  </td>
                                  <td className="px-2 py-1 border-b">
                                    {item.quantity}
                                  </td>
                                  <td className="px-2 py-1 border-b">
                                    ₹{Number(item.total).toFixed(2)}
                                  </td>
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

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerViewModal;
