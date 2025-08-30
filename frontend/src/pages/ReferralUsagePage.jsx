import React, { useEffect, useState } from "react";
import ReferralUsageTable from "../components/ReferralUsageTable";
import { Search } from "lucide-react";

export default function ReferralUsagePage() {
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsages = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5003/api/admin/referral-usage");
      const data = await res.json();
      setUsages(data || []);
    } catch (err) {
      console.error("Failed to fetch referral usage", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsages();
  }, []);

  // Match against all visible columns
  const filteredUsages = usages.filter((u) => {
    const query = searchQuery.toLowerCase();
    return (
      u.referred_name?.toLowerCase().includes(query) ||
      u.referrer_name?.toLowerCase().includes(query) ||
      u.referral_code?.toLowerCase().includes(query) ||
      (u.order_id && u.order_id.toString().toLowerCase().includes(query)) ||
      (u.reward_applied ? "applied" : "not applied").includes(query) ||
      new Date(u.created_at)
        .toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .toLowerCase()
        .includes(query)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Referral Usage History
        </h2>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any column..."
            className="pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white w-full focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <ReferralUsageTable usages={filteredUsages} loading={loading} />
    </div>
  );
}
