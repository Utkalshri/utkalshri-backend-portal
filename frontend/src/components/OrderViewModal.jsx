/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { getOrderDetail, updateOrderStatus } from "../services/api";

const OrderViewModal = ({ visible, onClose, orderId, token }) => {
  if (!visible || !orderId) return null;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");
      setOrder(null);
      try {
        const res = await getOrderDetail(token, orderId);
        setOrder(res.data);
        setNewStatus(res.data.status || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return isNaN(d) ? "-" : d.toLocaleString();
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return "-";
    const num = parseFloat(val);
    return isNaN(num) ? "-" : `₹${num.toFixed(2)}`;
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) {
      alert("Please select a different status to update.");
      return;
    }

    setStatusUpdateLoading(true);
    try {
      await updateOrderStatus(token, order.id, newStatus);
      setOrder((prev) => ({ ...prev, status: newStatus }));
      alert("Order status updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update order status.");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Order Details</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-xl"
          >
            &times;
          </button>
        </div>

        {loading && <p className="text-gray-600">Loading order details...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && order && (
          <div className="space-y-6">
            {/* General Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                General Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <strong>Order ID:</strong> {order.id ?? "-"}
                </div>
                <div>
                  <strong>Date:</strong> {formatDate(order.created_at)}
                </div>
                <div className="flex items-center space-x-2">
                  <strong>Status:</strong>
                  <span>{order.status || "-"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <strong>Update Status:</strong>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="">--Select--</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={statusUpdateLoading}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {statusUpdateLoading ? "Updating..." : "Update"}
                  </button>
                </div>
                <div>
                  <strong>Payment Status:</strong> {order.payment_status || "-"}
                </div>
                <div>
                  <strong>Payment Method:</strong> {order.payment_method || "-"}
                </div>
                <div>
                  <strong>Total Amount:</strong>{" "}
                  {formatCurrency(order.total_amount)}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <strong>Name:</strong> {order.customer_name || "-"}
                </div>
                <div>
                  <strong>Phone:</strong> {order.customer_phone || "-"}
                </div>
                <div>
                  <strong>Email:</strong> {order.customer_email || "-"}
                </div>
                <div className="md:col-span-2">
                  <strong>Shipping Address:</strong>
                  <div>{order.shipping_address || "-"}</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {order.notes && order.notes.trim() && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="border p-3 rounded bg-gray-50">{order.notes}</p>
              </div>
            )}

            {/* Items */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Order Items</h3>
              {order.items && order.items.length > 0 ? (
                <div className="overflow-x-auto border rounded">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-4 py-2 border-b">
                          Product
                        </th>
                        <th className="text-left px-4 py-2 border-b">SKU</th>
                        <th className="text-left px-4 py-2 border-b">Price</th>
                        <th className="text-left px-4 py-2 border-b">Qty</th>
                        <th className="text-left px-4 py-2 border-b">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b">
                            <div className="flex items-center gap-2">
                              {item.image_url && (
                                <img
                                  src={item.image_url}
                                  alt={item.product_name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <span>{item.product_name || "-"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2 border-b">
                            {item.sku || "-"}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {item.quantity ?? "-"}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No items found for this order.</p>
              )}
            </div>

            {/* Status History */}
            {order.status_history && order.status_history.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Status History</h3>
                <div className="overflow-x-auto border rounded">
                  <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-4 py-2 border-b">Status</th>
                        <th className="text-left px-4 py-2 border-b">
                          Changed At
                        </th>
                        <th className="text-left px-4 py-2 border-b">
                          Changed By
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.status_history.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border-b">{entry.status}</td>
                          <td className="px-4 py-2 border-b">
                            {formatDate(entry.changed_at)}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {entry.changed_by}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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

export default OrderViewModal;
