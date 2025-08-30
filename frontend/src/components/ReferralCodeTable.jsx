import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function ReferralCodeTable({ codes, loading, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow-sm border rounded-xl">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">User ID</th>
            <th className="px-4 py-3">Code</th>
            <th className="px-4 py-3">Reward (₹)</th>
            <th className="px-4 py-3">Created At</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-800 dark:text-gray-100">
          {loading ? (
            <tr>
              <td colSpan="6" className="text-center px-4 py-6">
                Loading...
              </td>
            </tr>
          ) : codes.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center px-4 py-6 text-gray-500">
                No referral codes found.
              </td>
            </tr>
          ) : (
            codes.map((code, index) => (
              <tr
                key={code.id}
                className={`transition-all ${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800"
                } hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">{code.user_id}</td>
                <td className="px-4 py-3 font-mono text-sm font-medium">{code.code}</td>
                <td className="px-4 py-3">{code.reward_amount || 0}</td>
                <td className="px-4 py-3">
                  {new Date(code.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => onEdit(code)}
                      title="Edit"
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this referral code?")) {
                          onDelete(code.id);
                        }
                      }}
                      title="Delete"
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
