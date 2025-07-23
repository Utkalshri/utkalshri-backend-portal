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
    if (!searchQuery) {
      setFilteredOrders(orders);
    } else {
      const lower = searchQuery.toLowerCase();
      setFilteredOrders(
        orders.filter((o) =>
          [o.customer_name, o.customer_phone, o.status]
            .some(f => f?.toLowerCase().includes(lower))
        )
      );
    }
  }, [searchQuery, orders]);

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
      "Order ID", "Customer Name", "Phone", "Email", "Shipping Address",
      "Total Amount", "Status", "Payment Status", "Payment Method", "Created At",
      "Item IDs", "Product Names", "SKUs", "Prices", "Quantities", "Item Totals"
    ];

    const csvRows = [csvHeaders];

    allDetails.forEach(order => {
      let itemIds = "-", productNames = "-", skus = "-", prices = "-", quantities = "-", totals = "-";
      if (order.items && order.items.length > 0) {
        itemIds = order.items.map(i => i.id).join("|");
        productNames = order.items.map(i => i.product_name || "-").join("|");
        skus = order.items.map(i => i.sku || "-").join("|");
        prices = order.items.map(i => Number(i.price).toFixed(2)).join("|");
        quantities = order.items.map(i => i.quantity).join("|");
        totals = order.items.map(i => Number(i.total).toFixed(2)).join("|");
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
        itemIds, productNames, skus, prices, quantities, totals
      ]);
    });

    const csvContent = csvRows.map(r => r.join(",")).join("\n");
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

    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.text("Orders Report", 14, 20);

    const tableColumn = [
      "Order ID", "Customer", "Phone", "Email", "Shipping",
      "Total", "Status", "Payment Status", "Payment Method", "Date",
      "Item IDs", "Product Names", "SKUs", "Prices", "Quantities", "Item Totals"
    ];

    const tableRows = [];

    allDetails.forEach(order => {
      let itemIds = "-", productNames = "-", skus = "-", prices = "-", quantities = "-", totals = "-";
      if (order.items && order.items.length > 0) {
        itemIds = order.items.map(i => i.id).join("|");
        productNames = order.items.map(i => i.product_name || "-").join("|");
        skus = order.items.map(i => i.sku || "-").join("|");
        prices = order.items.map(i => `₹${Number(i.price).toFixed(2)}`).join("|");
        quantities = order.items.map(i => i.quantity).join("|");
        totals = order.items.map(i => `₹${Number(i.total).toFixed(2)}`).join("|");
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
        itemIds, productNames, skus, prices, quantities, totals
      ]);
    });

    autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], halign: 'center' },
    columnStyles: {
      0: { cellWidth: 15 },   // ID
      1: { cellWidth: 30 },   // Customer
      2: { cellWidth: 30 },   // Phone
      3: { cellWidth: 40 },   // Email
      4: { cellWidth: 40 },   // Shipping
      5: { cellWidth: 20 },   // Total
      6: { cellWidth: 25 },   // Status
      7: { cellWidth: 25 },   // Payment Status
      8: { cellWidth: 25 },   // Payment Method
      9: { cellWidth: 35 },   // Date
      10: { cellWidth: 20 },  // Item IDs
      11: { cellWidth: 40 },  // Product Names
      12: { cellWidth: 30 },  // SKUs
      13: { cellWidth: 20 },  // Prices
      14: { cellWidth: 20 },  // Quantities
      15: { cellWidth: 20 }   // Item Totals
    }
  });

    doc.save(`orders_page_${page}.pdf`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Orders Management
      </h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
        <input
          type="text"
          placeholder="Search by name, phone or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Export CSV</button>
          <button onClick={exportToPDF} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">Export PDF</button>
        </div>
      </div>

      {loading && <p className="text-gray-600">Loading orders...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          {filteredOrders.length === 0 ? (
            <p className="text-gray-500">No orders found.</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2 border-b">ID</th>
                      <th className="text-left px-4 py-2 border-b">Customer</th>
                      <th className="text-left px-4 py-2 border-b">Total</th>
                      <th className="text-left px-4 py-2 border-b">Status</th>
                      <th className="text-left px-4 py-2 border-b">Payment</th>
                      <th className="text-left px-4 py-2 border-b">Date</th>
                      <th className="text-left px-4 py-2 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">{order.id}</td>
                        <td className="px-4 py-2 border-b">
                          {order.customer_name}
                          <div className="text-sm text-gray-500">
                            {order.customer_phone}
                          </div>
                        </td>
                        <td className="px-4 py-2 border-b">
                          ₹{Number(order.total_amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 border-b">{order.status}</td>
                        <td className="px-4 py-2 border-b">{order.payment_status}</td>
                        <td className="px-4 py-2 border-b">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 border-b">
                          <button
                            onClick={() => {
                              setViewingOrderId(order.id);
                              setShowView(true);
                            }}
                            className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                          >
                            <FaEye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>
                  Page {page} of {Math.ceil(total / limit) || 1}
                </span>
                <button
                  onClick={() => setPage(prev => (prev < Math.ceil(total / limit) ? prev + 1 : prev))}
                  disabled={page >= Math.ceil(total / limit)}
                  className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                Showing {filteredOrders.length} of {total} orders
              </p>
            </>
          )}
        </>
      )}

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
