import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function CouponTable({ coupons, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow-sm border rounded-xl">
      <table className="w-full table-auto text-sm border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
          <tr>
            <th className="text-left px-4 py-3">#</th>
            <th className="text-left px-4 py-3">Code</th>
            <th className="text-left px-4 py-3">Type</th>
            <th className="text-right px-4 py-3">Value</th>
            <th className="text-right px-4 py-3">Min Order</th>
            <th className="text-right px-4 py-3">Max Discount</th>
            <th className="text-center px-4 py-3">Expires</th>
            <th className="text-center px-4 py-3">Used / Limit</th>
            <th className="text-center px-4 py-3">Active</th>
            <th className="text-center px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700 dark:text-gray-200">
          {Array.isArray(coupons) && coupons.length > 0 ? (
            coupons.map((c, index) => (
              <tr
                key={c.id}
                className={`${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800"
                } hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150`}
              >
                <td className="px-4 py-3 capitalize">{index + 1}</td>
                <td className="px-4 py-3 font-mono font-semibold text-black dark:text-white">
                  {c.code}
                </td>
                <td className="px-4 py-3 capitalize">{c.discount_type}</td>
                <td className="px-4 py-3 text-right">{c.discount_value}</td>
                <td className="px-4 py-3 text-right">{c.min_order}</td>
                <td className="px-4 py-3 text-right">
                  {c.max_discount || "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  {c.expires_at
                    ? new Date(c.expires_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "-"}
                </td>

                <td className="px-4 py-3 text-center">
                  {c.used_count} / {c.usage_limit}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      c.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onEdit(c)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="9"
                className="text-center px-4 py-8 text-gray-500 dark:text-gray-400"
              >
                No coupons found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
