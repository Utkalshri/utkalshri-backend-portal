import { useEffect, useState } from "react";
import CouponFormModal from "../components/CouponFormModal";
import CouponTable from "../components/CouponTable";
import axios from "axios";
import { Plus, Search } from "lucide-react";

export default function CouponsPage() {
  const [showModal, setShowModal] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchCoupons = async () => {
    const res = await axios.get("http://localhost:5003/api/admin/coupons");
    setCoupons(res.data);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      await axios.delete(`http://localhost:5003/api/admin/coupons/${id}`);
      fetchCoupons();
    }
  };

  // Search Filter
  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.discount_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentCoupons = filteredCoupons.slice(indexOfFirst, indexOfLast);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header + Controls */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
         Coupon Management
        </h1>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by code or type..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // reset page when searching
              }}
              className="w-full md:w-64 pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={() => {
              setEditingCoupon(null);
              setShowModal(true);
            }}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-900 transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4 inline-block mr-1" />
            Add Coupon
          </button>
        </div>
      </div>

      {/* Table */}
      <CouponTable
        coupons={currentCoupons}
        onEdit={(coupon) => {
          setEditingCoupon(coupon);
          setShowModal(true);
        }}
        onDelete={handleDelete}
      />

      {/* Pagination UI */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-1 text-sm border rounded-md ${
                  currentPage === page
                    ? "bg-black text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CouponFormModal
          initialData={editingCoupon}
          onClose={() => {
            setEditingCoupon(null);
            setShowModal(false);
          }}
          onSuccess={() => {
            setEditingCoupon(null);
            setShowModal(false);
            fetchCoupons();
          }}
        />
      )}
    </div>
  );
}
