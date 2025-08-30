import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

export default function CouponFormModal({ initialData, onClose, onSuccess }) {
  const [form, setForm] = useState({
    code: "",
    discount_type: "flat",
    discount_value: 0,
    min_order: 0,
    max_discount: "",
    expires_at: "",
    usage_limit: 1,
    active: true,
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initialData) {
        await axios.put(`http://localhost:5003/api/admin/coupons/${initialData.id}`, form);
      } else {
        await axios.post("http://localhost:5003/api/admin/coupons", form);
      }
      onSuccess();
    } catch (err) {
      console.error("Failed to save coupon", err);
      alert("Failed to save coupon");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-xl shadow-xl p-6 relative">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            {initialData ? "Edit Coupon" : "Add Coupon"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Coupon Code</label>
              <input
                type="text"
                name="code"
                value={form.code}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-black"
                required
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Discount Type</label>
              <select
                name="discount_type"
                value={form.discount_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              >
                <option value="flat">Flat</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Discount Value</label>
              <input
                type="number"
                name="discount_value"
                value={form.discount_value}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                required
              />
            </div>

            {/* Min Order */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Minimum Order Amount</label>
              <input
                type="number"
                name="min_order"
                value={form.min_order}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
            </div>

            {/* Max Discount */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Max Discount (optional)</label>
              <input
                type="number"
                name="max_discount"
                value={form.max_discount || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date</label>
              <input
                type="datetime-local"
                name="expires_at"
                value={form.expires_at?.slice(0, 16) || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
            </div>

            {/* Usage Limit */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Usage Limit</label>
              <input
                type="number"
                name="usage_limit"
                value={form.usage_limit}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              />
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="accent-black w-4 h-4"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">Active</label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
          >
            {initialData ? "Update Coupon" : "Create Coupon"}
          </button>
        </form>
      </div>
    </div>
  );
}
