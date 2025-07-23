import { useEffect, useState } from "react";
import { getProductById } from "../services/api";

const displayValue = (val, suffix = "") =>
  val != null && val !== "" ? `${val}${suffix}` : "-";

const displayArray = (arr) =>
  Array.isArray(arr) && arr.length
    ? arr.join(", ")
    : "-";

const ProductViewModal = ({ visible, onClose, productId, token }) => {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible && productId) {
      loadProduct(productId);
    }
  }, [visible, productId]);

  const loadProduct = async (id) => {
    setLoading(true);
    setError("");
    setProduct(null);
    try {
      const res = await getProductById(id, token);
      const data = res.data;

      // PG arrays arrive as strings like: "{A,B,C}" — clean them:
      const parseArray = (val) =>
        typeof val === "string"
          ? val.replace(/^{|}$/g, "").split(",").map((s) => s.trim()).filter(Boolean)
          : Array.isArray(val)
            ? val
            : [];

      data.occasion = parseArray(data.occasion);
      data.pattern = parseArray(data.pattern);
      data.highlights = parseArray(data.highlights);
      data.gallery_images = parseArray(data.gallery_images);

      setProduct(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load product.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 overflow-y-auto max-h-screen">
        <h2 className="text-2xl font-bold mb-4">
          Product Details
        </h2>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && product && (
          <div className="space-y-6">
            {/* Main Image */}
            {product.image_url && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Main Image</h3>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-48 h-48 object-cover rounded border"
                />
              </div>
            )}

            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><strong>Name:</strong> {displayValue(product.name)}</div>
                <div><strong>SKU:</strong> {displayValue(product.sku)}</div>
                <div><strong>Category:</strong> {displayValue(product.category_name)}</div>
                <div><strong>Subcategory:</strong> {displayValue(product.subcategory_name)}</div>
              </div>
            </div>

            {/* Price & Stock */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Pricing & Stock</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><strong>Price:</strong> ₹ {displayValue(product.price)}</div>
                <div><strong>Discount Price:</strong> ₹ {displayValue(product.discount_price)}</div>
                <div><strong>Stock Quantity:</strong> {displayValue(product.stock_qty)}</div>
                <div><strong>Active:</strong> {product.active ? "Yes" : "No"}</div>
              </div>
            </div>

            {/* Physical */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Physical Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><strong>Weight:</strong> {displayValue(product.weight, " kg")}</div>
                <div><strong>Length:</strong> {displayValue(product.length, " m")}</div>
                <div><strong>Width:</strong> {displayValue(product.width, " m")}</div>
                <div><strong>Color:</strong> {displayValue(product.color)}</div>
              </div>
            </div>

            {/* Fabric & Weaving */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Fabric & Weaving</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><strong>Fabric Type:</strong> {displayValue(product.fabric_type)}</div>
                <div><strong>Weaving Type:</strong> {displayValue(product.weaving_type)}</div>
              </div>
            </div>

            {/* Arrays */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Occasion & Pattern</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><strong>Occasion:</strong> {displayArray(product.occasion)}</div>
                <div><strong>Pattern:</strong> {displayArray(product.pattern)}</div>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Highlights</h3>
              <div>{displayArray(product.highlights)}</div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="border p-3 rounded bg-gray-50">
                  {product.description}
                </p>
              </div>
            )}

            {/* Meta */}
            <div>
              <h3 className="text-lg font-semibold mb-2">SEO Meta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><strong>Meta Title:</strong> {displayValue(product.meta_title)}</div>
                <div><strong>Meta Description:</strong> {displayValue(product.meta_description)}</div>
              </div>
            </div>

            {/* Gallery */}
            {product.gallery_images && product.gallery_images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Gallery Images</h3>
                <div className="flex flex-wrap gap-2">
                  {product.gallery_images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Gallery ${i + 1}`}
                      className="w-24 h-24 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;
