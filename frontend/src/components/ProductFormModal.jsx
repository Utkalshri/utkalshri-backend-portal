/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect } from "react";
import Select from "react-select";
import { uploadFile, getProductById } from "../services/api";



const ProductFormModal = ({
  visible,
  onClose,
  onSave,
  editingProduct,
  token,
}) => {
  if (!visible) return null;

  // Helper to turn array into react-select options
  const toOptions = (arr) =>
    arr ? arr.map((v) => ({ value: v, label: v })) : [];
const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category_name: "",
    subcategory_name: "",
    occasion: [],
    pattern: [],
    price: "",
    discount_price: "",
    stock_qty: "",
    weight: "",
    length: "",
    width: "",
    color: "",
    fabric_type: "",
    weaving_type: "",
    description: "",
    highlights: [],
    image_url: "",
    gallery_images: [],
    active: true,
    meta_title: "",
    meta_description: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      if (!editingProduct) {
        setForm({
          name: "",
          sku: "",
          category_name: "",
          subcategory_name: "",
          occasion: [],
          pattern: [],
          price: "",
          discount_price: "",
          stock_qty: "",
          weight: "",
          length: "",
          width: "",
          color: "",
          fabric_type: "",
          weaving_type: "",
          description: "",
          highlights: [],
          image_url: "",
          gallery_images: [],
          active: true,
          meta_title: "",
          meta_description: "",
        });
        return;
      }

      setLoading(true);
      try {
        const res = await getProductById(editingProduct, token);
        const data = res.data;
        setForm({
          ...data,
          occasion: data.occasion || [],
          pattern: data.pattern || [],
          highlights: data.highlights || [],
          gallery_images: data.gallery_images || [],
        });
      } catch (err) {
        console.error("Error loading product:", err);
        alert("Failed to load product details.");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [editingProduct, token, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleHighlightsChange = (e) => {
    const vals = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((prev) => ({ ...prev, highlights: vals }));
  };

  const handleMultiSelect = (name, selected) => {
    setForm((prev) => ({
      ...prev,
      [name]: selected ? selected.map((s) => s.value) : [],
    }));
  };

  const handleFileUpload = async (e, isGallery = false) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const res = await uploadFile(file, token);
        uploadedUrls.push(res.data.url);
      }

      if (isGallery) {
        setForm((prev) => ({
          ...prev,
          gallery_images: [...prev.gallery_images, ...uploadedUrls],
        }));
      } else {
        setForm((prev) => ({ ...prev, image_url: uploadedUrls[0] }));
      }
    } catch (err) {
      console.error(err);
      alert("File upload failed.");
    }
  };

  const removeGalleryImage = (index) => {
    setForm((prev) => {
      const updated = [...prev.gallery_images];
      updated.splice(index, 1);
      return { ...prev, gallery_images: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-xl overflow-y-auto max-h-screen space-y-6">
        <h2 className="text-2xl font-bold mb-4">
          {editingProduct ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product Name"
              required
              className="border px-3 py-2 rounded w-full"
            />
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="SKU"
              required
              className="border px-3 py-2 rounded w-full"
            />
            <input
              name="category_name"
              value={form.category_name}
              onChange={handleChange}
              placeholder="Category Name"
              className="border px-3 py-2 rounded w-full"
            />
            <input
              name="subcategory_name"
              value={form.subcategory_name}
              onChange={handleChange}
              placeholder="Subcategory Name"
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              required
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="number"
              name="discount_price"
              value={form.discount_price}
              onChange={handleChange}
              placeholder="Discount Price"
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="number"
              name="stock_qty"
              value={form.stock_qty}
              onChange={handleChange}
              placeholder="Stock Quantity"
              required
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Physical */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              placeholder="Weight (kg)"
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="number"
              name="length"
              value={form.length}
              onChange={handleChange}
              placeholder="Length (m)"
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="number"
              name="width"
              value={form.width}
              onChange={handleChange}
              placeholder="Width (m)"
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Additional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="Color"
              className="border px-3 py-2 rounded w-full"
            />
            <input
              name="fabric_type"
              value={form.fabric_type}
              onChange={handleChange}
              placeholder="Fabric Type"
              className="border px-3 py-2 rounded w-full"
            />
            <input
              name="weaving_type"
              value={form.weaving_type}
              onChange={handleChange}
              placeholder="Weaving Type"
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Multi-Select */}
          <div>
            <label className="block mb-1 font-medium">Occasion</label>
            <Select
              isMulti
              value={toOptions(form.occasion)}
              onChange={(selected) => handleMultiSelect("occasion", selected)}
              options={[
                { value: "Festive", label: "Festive" },
                { value: "Wedding", label: "Wedding" },
                { value: "Casual", label: "Casual" },
              ]}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Pattern</label>
            <Select
              isMulti
              value={toOptions(form.pattern)}
              onChange={(selected) => handleMultiSelect("pattern", selected)}
              options={[
                { value: "Ikat", label: "Ikat" },
                { value: "Temple Border", label: "Temple Border" },
                { value: "Plain", label: "Plain" },
              ]}
            />
          </div>

          {/* Highlights */}
          <div>
            <label className="block mb-1 font-medium">
              Highlights (comma-separated)
            </label>
            <input
              type="text"
              value={form.highlights.join(", ")}
              onChange={handleHighlightsChange}
              placeholder="e.g. Handloom, Silk, Dry Clean Only"
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
              rows={4}
            />
          </div>

          {/* Images */}
          <div>
            <label className="block mb-1 font-medium">Main Image Upload</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, false)}
            />
            {form.image_url && (
              <img
                src={form.image_url}
                alt="Main"
                className="w-24 h-24 object-cover rounded mt-2"
              />
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Gallery Images Upload
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e, true)}
            />
            {form.gallery_images.length > 0 && (
              <div className="flex flex-wrap mt-2">
                {form.gallery_images.map((img, i) => (
                  <div key={i} className="relative mr-2 mb-2">
                    <img
                      src={img}
                      alt={`Gallery ${i + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            <label>Active</label>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="meta_title"
              value={form.meta_title}
              onChange={handleChange}
              placeholder="Meta Title"
              className="border px-3 py-2 rounded w-full"
            />
            <input
              name="meta_description"
              value={form.meta_description}
              onChange={handleChange}
              placeholder="Meta Description"
              className="border px-3 py-2 rounded w-full"
            />
          </div>

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
              disabled={loading}
            >
              {loading ? "Loading..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
