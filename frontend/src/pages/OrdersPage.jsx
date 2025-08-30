import { useEffect, useState } from "react";
import { getOrderDetail, getPaginatedOrders } from "../services/api";
import { useAuth } from "../contexts/useAuth";
import { FaEye } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import OrderViewModal from "../components/OrderViewModal";

const OrdersPage = () => {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [showView, setShowView] = useState(false);
  const [viewingOrderId, setViewingOrderId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getPaginatedOrders(token, page, limit);
        setOrders(res.data.data);
        setFilteredOrders(res.data.data);
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, page]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
    } else {
      const lower = searchQuery.toLowerCase();

      const match = (value) =>
        typeof value === "string"
          ? value.toLowerCase().includes(lower)
          : typeof value === "number"
          ? value.toString().includes(lower)
          : false;

      setFilteredOrders(
        orders.filter((o, index) =>
          [
            (page - 1) * limit + index + 1, // SL No
            o.id,
            o.customer_name,
            o.customer_phone,
            o.total_amount,
            o.status,
            o.payment_status,
            o.payment_method,
            new Date(o.created_at).toLocaleDateString(),
          ].some(match)
        )
      );
    }
  }, [searchQuery, orders, page, limit]);

  const fetchAllOrderDetails = async () => {
    const details = [];
    for (const order of filteredOrders) {
      try {
        const res = await getOrderDetail(token, order.id);
        details.push(res.data);
      } catch (e) {
        console.error(`Failed to fetch details for order ${order.id}`, e);
      }
    }
    return details;
  };

  const exportToCSV = async () => {
    const allDetails = await fetchAllOrderDetails();

    const csvHeaders = [
      "Order ID",
      "Customer Name",
      "Phone",
      "Email",
      "Shipping Address",
      "Total Amount",
      "Status",
      "Payment Status",
      "Payment Method",
      "Created At",
      "Item IDs",
      "Product Names",
      "SKUs",
      "Prices",
      "Quantities",
      "Item Totals",
    ];

    const csvRows = [csvHeaders];

    allDetails.forEach((order) => {
      let itemIds = "-",
        productNames = "-",
        skus = "-",
        prices = "-",
        quantities = "-",
        totals = "-";
      if (order.items && order.items.length > 0) {
        itemIds = order.items.map((i) => i.id).join("|");
        productNames = order.items.map((i) => i.product_name || "-").join("|");
        skus = order.items.map((i) => i.sku || "-").join("|");
        prices = order.items.map((i) => Number(i.price).toFixed(2)).join("|");
        quantities = order.items.map((i) => i.quantity).join("|");
        totals = order.items.map((i) => Number(i.total).toFixed(2)).join("|");
      }
      csvRows.push([
        order.id,
        order.customer_name,
        order.customer_phone,
        order.customer_email || "-",
        order.shipping_address || "-",
        Number(order.total_amount).toFixed(2),
        order.status,
        order.payment_status,
        order.payment_method || "-",
        new Date(order.created_at).toLocaleString(),
        itemIds,
        productNames,
        skus,
        prices,
        quantities,
        totals,
      ]);
    });

    const csvContent = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `orders_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    const allDetails = await fetchAllOrderDetails();

    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text("Orders Report", 14, 20);

    const tableColumn = [
      "Order ID",
      "Customer",
      "Phone",
      "Email",
      "Shipping",
      "Total",
      "Status",
      "Payment Status",
      "Payment Method",
      "Date",
      "Item IDs",
      "Product Names",
      "SKUs",
      "Prices",
      "Quantities",
      "Item Totals",
    ];

    const tableRows = [];

    allDetails.forEach((order) => {
      let itemIds = "-",
        productNames = "-",
        skus = "-",
        prices = "-",
        quantities = "-",
        totals = "-";
      if (order.items && order.items.length > 0) {
        itemIds = order.items.map((i) => i.id).join("|");
        productNames = order.items.map((i) => i.product_name || "-").join("|");
        skus = order.items.map((i) => i.sku || "-").join("|");
        prices = order.items
          .map((i) => `₹${Number(i.price).toFixed(2)}`)
          .join("|");
        quantities = order.items.map((i) => i.quantity).join("|");
        totals = order.items
          .map((i) => `₹${Number(i.total).toFixed(2)}`)
          .join("|");
      }

      tableRows.push([
        order.id,
        order.customer_name,
        order.customer_phone,
        order.customer_email || "-",
        order.shipping_address || "-",
        `${Number(order.total_amount).toFixed(2)}`,
        order.status,
        order.payment_status,
        order.payment_method || "-",
        new Date(order.created_at).toLocaleString(),
        itemIds,
        productNames,
        skus,
        prices,
        quantities,
        totals,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], halign: "center" },
      columnStyles: {
        0: { cellWidth: 15 }, // ID
        1: { cellWidth: 30 }, // Customer
        2: { cellWidth: 30 }, // Phone
        3: { cellWidth: 40 }, // Email
        4: { cellWidth: 40 }, // Shipping
        5: { cellWidth: 20 }, // Total
        6: { cellWidth: 25 }, // Status
        7: { cellWidth: 25 }, // Payment Status
        8: { cellWidth: 25 }, // Payment Method
        9: { cellWidth: 35 }, // Date
        10: { cellWidth: 20 }, // Item IDs
        11: { cellWidth: 40 }, // Product Names
        12: { cellWidth: 30 }, // SKUs
        13: { cellWidth: 20 }, // Prices
        14: { cellWidth: 20 }, // Quantities
        15: { cellWidth: 20 }, // Item Totals
      },
    });

    doc.save(`orders_page_${page}.pdf`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        🧾 Orders Management
      </h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by ID, name, phone, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-blue-600 font-medium">Loading orders...</p>
      ) : error ? (
        <p className="text-red-600 font-semibold">{error}</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-500 italic">No orders found.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
            <table className="min-w-full bg-white text-sm">
              <thead className="bg-gray-100 text-gray-800 text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-center">#</th>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="text-center px-4 py-3 font-semibold text-gray-500">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">{order.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-800">
                        {order.customer_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.customer_phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block
      ${order.status === "Delivered" ? "bg-green-100 text-green-700" : ""}
      ${order.status === "Pending" ? "bg-yellow-100 text-yellow-800" : ""}
      ${order.status === "Cancelled" ? "bg-red-100 text-red-700" : ""}
      ${order.status === "Shipped" ? "bg-blue-100 text-blue-700" : ""}
      ${
        !["Delivered", "Pending", "Cancelled", "Shipped"].includes(order.status)
          ? "bg-gray-100 text-gray-700"
          : ""
      }
    `}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block
      ${
        order.payment_status === "Paid" ? "bg-emerald-100 text-emerald-700" : ""
      }
      ${order.payment_status === "Failed" ? "bg-rose-100 text-rose-700" : ""}
      ${
        order.payment_status === "Refunded"
          ? "bg-indigo-100 text-indigo-700"
          : ""
      }
      ${
        !["Paid", "Failed", "Refunded"].includes(order.payment_status)
          ? "bg-gray-100 text-gray-700"
          : ""
      }
    `}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.payment_method}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setViewingOrderId(order.id);
                          setShowView(true);
                        }}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition"
                      >
                        <FaEye className="w-4 h-4" />
                        <span className="text-sm font-medium">View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 text-sm text-gray-700">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              ← Previous
            </button>
            <span>
              Page <strong>{page}</strong> of{" "}
              <strong>{Math.ceil(total / limit)}</strong>
            </span>
            <button
              onClick={() =>
                setPage((prev) =>
                  prev < Math.ceil(total / limit) ? prev + 1 : prev
                )
              }
              disabled={page >= Math.ceil(total / limit)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Next →
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Showing {filteredOrders.length} of {total} orders
          </p>
        </>
      )}

      {/* Modal */}
      {showView && viewingOrderId && (
        <OrderViewModal
          visible={showView}
          onClose={() => setShowView(false)}
          orderId={viewingOrderId}
          token={token}
        />
      )}
    </div>
  );
};

export default OrdersPage;
