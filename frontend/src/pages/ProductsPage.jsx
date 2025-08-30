import { useEffect, useState } from "react";
import {
  getPaginatedProducts,
  addProduct,
  editProduct,
  deleteProduct,
} from "../services/api";
import { useAuth } from "../contexts/useAuth";

import ProductTable from "../components/ProductTable";
import ProductFormModal from "../components/ProductFormModal";
import ProductViewModal from "../components/ProductViewModal";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ProductsPage = () => {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Form modal state
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // View modal state
  const [showView, setShowView] = useState(false);
  const [viewingProductId, setViewingProductId] = useState(null);

  // Fetch paginated products
  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getPaginatedProducts(token, page, limit);
      setProducts(res.data.data);
      setFilteredProducts(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token, page]);

  // Search/Filter
  useEffect(() => {
  if (!searchQuery) {
    setFilteredProducts(products);
    return;
  }

  const lower = searchQuery.toLowerCase();

  const filtered = products.filter((product) => {
    const fieldsToSearch = [
      product.name,
      product.sku,
      product.category_name,
      product.subcategory_name,
      product.color,
      product.fabric_type,
      product.weaving_type,
      product.price?.toString(),
      product.discount_price?.toString(),
      product.stock_qty?.toString(),
      product.meta_title,
      product.meta_description,
      ...(product.occasion || []),
      ...(product.pattern || []),
      ...(product.highlights || []),
    ];

    return fieldsToSearch
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(lower));
  });

  setFilteredProducts(filtered);
}, [searchQuery, products]);


  // Add Product
  const handleAdd = () => {
    setEditingProductId(null);
    setShowForm(true);
  };

  // Edit Product
  const handleEdit = (product) => {
    setEditingProductId(product.id);
    setShowForm(true);
  };

  // Delete Product
  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await deleteProduct(token, product.id);
        fetchProducts();
      } catch (err) {
        console.error(err);
        alert("Failed to delete product.");
      }
    }
  };

  // Save handler
  const handleSave = async (formData) => {
    try {
      if (editingProductId) {
        await editProduct(token, editingProductId, formData);
      } else {
        await addProduct(token, formData);
      }
      setShowForm(false);
      setEditingProductId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error saving product.");
    }
  };

  // View Product
  const handleView = (product) => {
    setViewingProductId(product.id);
    setShowView(true);
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "SKU",
      "Category",
      "Subcategory",
      "Price",
      "Discount Price",
      "Stock",
      "Color",
      "Fabric",
      "Weaving",
      "Active",
    ];
    const rows = filteredProducts.map((p) => [
      p.id,
      `"${p.name}"`,
      p.sku,
      p.category_name || "-",
      p.subcategory_name || "-",
      p.price,
      p.discount_price,
      p.stock_qty,
      p.color || "-",
      p.fabric_type || "-",
      p.weaving_type || "-",
      p.active ? "Yes" : "No",
    ]);

    const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `products_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(14);
    doc.text("Products Report", 14, 20);

    const columns = [
      { header: "ID", dataKey: "id" },
      { header: "Name", dataKey: "name" },
      { header: "SKU", dataKey: "sku" },
      { header: "Category", dataKey: "category_name" },
      { header: "Subcategory", dataKey: "subcategory_name" },
      { header: "Price", dataKey: "price" },
      { header: "Discount Price", dataKey: "discount_price" },
      { header: "Stock", dataKey: "stock_qty" },
      { header: "Color", dataKey: "color" },
      { header: "Fabric", dataKey: "fabric_type" },
      { header: "Weaving", dataKey: "weaving_type" },
      { header: "Active", dataKey: "active" },
    ];

    const rows = filteredProducts.map((p) => ({
      id: p.id,
      name: p.name || "-",
      sku: p.sku || "-",
      category_name: p.category_name || "-",
      subcategory_name: p.subcategory_name || "-",
      price: p.price != null ? `${Number(p.price).toFixed(2)}` : "-",
      discount_price:
        p.discount_price != null
          ? `${Number(p.discount_price).toFixed(2)}`
          : "-",
      stock_qty: p.stock_qty != null ? p.stock_qty : "-",
      color: p.color || "-",
      fabric_type: p.fabric_type || "-",
      weaving_type: p.weaving_type || "-",
      active: p.active ? "Yes" : "No",
    }));

    autoTable(doc, {
      columns,
      body: rows,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], halign: "center" },
      bodyStyles: { halign: "center" },
      theme: "grid",
      columnStyles: {
        id: { cellWidth: 10 },
        name: { cellWidth: 40 },
        sku: { cellWidth: 30 },
        category_name: { cellWidth: 25 },
        subcategory_name: { cellWidth: 25 },
        price: { cellWidth: 20 },
        discount_price: { cellWidth: 25 },
        stock_qty: { cellWidth: 15 },
        color: { cellWidth: 20 },
        fabric_type: { cellWidth: 20 },
        weaving_type: { cellWidth: 20 },
        active: { cellWidth: 15 },
      },
    });

    doc.save(`products_page_${page}.pdf`);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            🧾 Products Management
          </h1>
  
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleAdd}
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
          >
            + Add Product
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
          >
            Export CSV
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-sm transition"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by name, SKU, category, color..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="text-center py-4 text-blue-500 font-medium">
          Loading products...
        </div>
      )}
      {error && (
        <div className="text-center py-4 text-red-500 font-semibold">
          {error}
        </div>
      )}

      {/* Products Table + Pagination */}
      {!loading && !error && (
        <>
          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
            >
              ← Previous
            </button>
            <span className="text-gray-700 font-medium">
              Page <strong>{page}</strong> of{" "}
              <strong>{Math.ceil(total / limit)}</strong>
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(Math.ceil(total / limit), p + 1))
              }
              disabled={page === Math.ceil(total / limit)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
            >
              Next →
            </button>
          </div>
        </>
      )}

      {/* Modals */}
      {showForm && (
        <ProductFormModal
          visible={showForm}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          editingProduct={editingProductId}
          token={token}
        />
      )}

      {showView && (
        <ProductViewModal
          visible={showView}
          onClose={() => setShowView(false)}
          productId={viewingProductId}
          token={token}
        />
      )}
    </div>
  );
};

export default ProductsPage;
