import React, { useState } from "react";
import { Dialog } from "@headlessui/react";

export default function ReferralCodeModal({ initialData, onClose, refresh }) {
  const [form, setForm] = useState({
    user_id: initialData?.user_id || "",
    code: initialData?.code || "",
    reward_amount: initialData?.reward_amount || "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = initialData
        ? `http://localhost:5003/api/admin/referral-codes/${initialData.id}`
        : "http://localhost:5003/api/admin/referral-codes";

      const method = initialData ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to save referral code");

      refresh();
      onClose();
    } catch (err) {
      console.error("❌ Error saving referral code:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50">
      {/* Blurred background */}
      <div className="min-h-screen flex items-center justify-center px-4 bg-black/30 backdrop-blur-sm">
        <Dialog.Panel className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6">
          <Dialog.Title className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {initialData ? "Edit Referral Code" : "Create Referral Code"}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* User ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User ID
              </label>
              <input
                type="text"
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                required
                placeholder="e.g. user_123"
                className="w-full px-4 py-2 rounded-md border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Referral Code
              </label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                placeholder="e.g. JOIN50"
                className="w-full px-4 py-2 rounded-md border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* Reward Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reward Amount (₹)
              </label>
              <input
                type="number"
                name="reward_amount"
                value={form.reward_amount}
                onChange={handleChange}
                required
                placeholder="e.g. 100"
                className="w-full px-4 py-2 rounded-md border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`px-5 py-2 text-sm text-white rounded-md transition ${
                  saving
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-black hover:bg-gray-900"
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
