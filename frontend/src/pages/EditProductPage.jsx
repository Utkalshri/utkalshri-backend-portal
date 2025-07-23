import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { getProduct, editProduct } from '../services/api';

const EditProductPage = () => {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing product on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProduct(id, token);
        setForm({
          name: res.data.name,
          description: res.data.description,
          price: res.data.price,
          stock_qty: res.data.stock_qty,
          image_url: res.data.image_url,
          active: res.data.active,
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock_qty: parseInt(form.stock_qty),
      };

      await editProduct(id, payload, token);
      navigate('/products');
    } catch (err) {
      console.error(err);
      setError('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading product details...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Product</h2>

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
          disabled={saving}
          className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
