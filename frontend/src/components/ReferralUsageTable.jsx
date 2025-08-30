import React from "react";

export default function ReferralUsageTable({ usages = [], loading }) {
  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-900 shadow-sm border rounded-xl">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Referral Code</th>
            <th className="px-4 py-3">Referred User</th>
            <th className="px-4 py-3">Referrer</th>
            <th className="px-4 py-3">Order ID</th>
            <th className="px-4 py-3">Reward</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="text-gray-800 dark:text-gray-100">
          {loading ? (
            <tr>
              <td colSpan="7" className="text-center px-4 py-6">
                Loading...
              </td>
            </tr>
          ) : usages.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center px-4 py-6 text-gray-500 dark:text-gray-400">
                No records found.
              </td>
            </tr>
          ) : (
            usages.map((row, index) => (
              <tr
                key={row.id}
                className={`transition ${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800"
                } hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 font-mono text-sm font-semibold text-black">{row.referral_code}</td>
                <td className="px-4 py-3">{row.referred_name}</td>
                <td className="px-4 py-3">{row.referrer_name}</td>
                <td className="px-4 py-3">{row.order_id || "-"}</td>
                <td className="px-4 py-3">
                  {row.reward_applied ? (
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                      Applied
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-700 rounded-full">
                      Not Applied
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {new Date(row.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
