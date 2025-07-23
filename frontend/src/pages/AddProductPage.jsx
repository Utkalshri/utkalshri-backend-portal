import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { addProduct } from '../services/api';

const AddProductPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock_qty: '',
    image_url: '',
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate price and stock
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock_qty: parseInt(form.stock_qty),
      };

      await addProduct(payload, token);
      navigate('/products');
    } catch (err) {
      console.error(err);
      setError('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>

      {error && (
        <div className="mb-4 text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Name</label>
          <input
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div>
          <label className="block text-gray-700">Description</label>
          <textarea
            name="description"
            required
            value={form.description}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-gray-700">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              name="price"
              required
              value={form.price}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
          <div className="flex-1">
            <label className="block text-gray-700">Stock Quantity</label>
            <input
              type="number"
              name="stock_qty"
              required
              value={form.stock_qty}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700">Image URL</label>
          <input
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            className="mt-1 w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-gray-700">Active</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProductPage;
