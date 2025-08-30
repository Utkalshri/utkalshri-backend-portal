import React, { useEffect, useState } from "react";
import ReferralCodeTable from "../components/ReferralCodeTable";
import ReferralCodeModal from "../components/ReferralCodeModal";
import { Plus, Search } from "lucide-react";

export default function ReferralCodePage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5003/api/admin/referral-codes");
      const data = await res.json();
      setCodes(data || []);
    } catch (err) {
      console.error("Failed to fetch referral codes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleEdit = (code) => {
    setSelectedCode(code);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5003/api/admin/referral-codes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete referral code");
      fetchCodes();
    } catch (err) {
      console.error("❌ Error deleting referral code:", err);
    }
  };

  const handleClose = () => {
    setSelectedCode(null);
    setShowForm(false);
  };

  // Filter by user_id, code, or reward_amount
  const filteredCodes = codes.filter((code) => {
    const query = searchQuery.toLowerCase();
    return (
      code.user_id?.toString().toLowerCase().includes(query) ||
      code.code?.toLowerCase().includes(query) ||
      (code.reward_amount !== null && code.reward_amount.toString().includes(query))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Referral Code Management
          </h2>
        </div>

        {/* Right Controls: Search + New */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search code, user or reward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:text-white"
            />
          </div>

          <button
            onClick={() => {
              setSelectedCode(null);
              setShowForm(true);
            }}
            className="flex items-center bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-md transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Code
          </button>
        </div>
      </div>

      {/* Table Block */}
      <div>
        <ReferralCodeTable
          codes={filteredCodes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modal */}
      {showForm && (
        <ReferralCodeModal
          initialData={selectedCode}
          onClose={handleClose}
          refresh={fetchCodes}
        />
      )}
    </div>
  );
}
