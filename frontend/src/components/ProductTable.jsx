import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const ProductTable = ({
  products,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="overflow-x-auto rounded shadow">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3 border-b">Image</th>
            <th className="text-left p-3 border-b">Name</th>
            <th className="text-left p-3 border-b">SKU</th>
            <th className="text-left p-3 border-b">Category</th>
            <th className="text-left p-3 border-b">Price</th>
            <th className="text-left p-3 border-b">Stock</th>
            <th className="text-left p-3 border-b">Active</th>
            <th className="text-left p-3 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center p-4 text-gray-500">
                No products found.
              </td>
            </tr>
          )}

          {products.map((p) => (
            <tr
              key={p.id}
              className="hover:bg-gray-50 transition"
            >
              <td className="p-3 border-b">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  "-"
                )}
              </td>
              <td className="p-3 border-b">{p.name || "-"}</td>
              <td className="p-3 border-b">{p.sku || "-"}</td>
              <td className="p-3 border-b">{p.category_name || "-"}</td>
              <td className="p-3 border-b">
                ₹{" "}
                {p.price && !isNaN(Number(p.price))
                  ? Number(p.price).toFixed(2)
                  : "-"}
              </td>
              <td className="p-3 border-b">{p.stock_qty ?? "-"}</td>
              <td className="p-3 border-b">
                {p.active ? "Yes" : "No"}
              </td>
              <td className="p-3 border-b space-x-2">
                <button
                  onClick={() => onView(p)}
                  className="text-blue-600 hover:text-blue-800"
                  title="View"
                >
                  <FaEye />
                </button>
                <button
                  onClick={() => onEdit(p)}
                  className="text-green-600 hover:text-green-800"
                  title="Edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDelete(p)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
