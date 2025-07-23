/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from "react";
import { addCustomer, editCustomer } from "../services/api";

const CustomerFormModal = ({ visible, onClose, editingCustomer, token, onSaved }) => {
  if (!visible) return null;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "Active",
    notes: ""
  });

  useEffect(() => {
    if (editingCustomer) {
      setForm({
        name: editingCustomer.name || "",
        email: editingCustomer.email || "",
        phone: editingCustomer.phone || "",
        address: editingCustomer.address || "",
        status: editingCustomer.status || "Active",
        notes: editingCustomer.notes || ""
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "Active",
        notes: ""
      });
    }
  }, [editingCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await editCustomer(token, editingCustomer.id, form);
      } else {
        await addCustomer(token, form);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert("Error saving customer.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{editingCustomer ? "Edit Customer" : "Add New Customer"}</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            disabled
            className="border px-3 py-2 rounded w-full"
          />

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            disabled
            className="border px-3 py-2 rounded w-full"
          />

          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            disabled
            className="border px-3 py-2 rounded w-full"
          />

          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="border px-3 py-2 rounded w-full"
            rows={2}
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Notes"
            className="border px-3 py-2 rounded w-full"
            rows={2}
          />

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
