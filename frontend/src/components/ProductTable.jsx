import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const ProductTable = ({ products, onView, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-lg shadow-md border bg-white">
      <table className="min-w-full table-auto text-sm text-gray-700">
        <thead className="bg-gray-100 text-xs font-semibold uppercase text-gray-600 border-b">
          <tr>
            <th className="px-4 py-3 text-left">Sl No.</th>
            <th className="px-4 py-3 text-left">Image</th>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">SKU</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-left">Price</th>
            <th className="px-4 py-3 text-left">Stock</th>
            <th className="px-4 py-3 text-left">Active</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-6 text-gray-500">
                No products found.
              </td>
            </tr>
          ) : (
            products.map((p, index) => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-3">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-16 h-16 rounded object-cover border"
                    />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{p.name || "-"}</td>
                <td className="px-4 py-3">{p.sku || "-"}</td>
                <td className="px-4 py-3">{p.category_name || "-"}</td>
                <td className="px-4 py-3 text-green-700 font-semibold">
                  ₹{" "}
                  {p.price && !isNaN(Number(p.price))
                    ? Number(p.price).toFixed(2)
                    : "-"}
                </td>
                <td className="px-4 py-3">{p.stock_qty ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                      p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.active ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-3 whitespace-nowrap">
                  <button
                    onClick={() => onView(p)}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="View"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => onEdit(p)}
                    className="text-green-600 hover:text-green-800 transition"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => onDelete(p)}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
