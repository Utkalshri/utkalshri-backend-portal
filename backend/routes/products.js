import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import {
  getAllProducts,
  getProductById,
  addProduct,
  editProduct,
  deleteProduct,
  getPaginatedProducts,
  getLowStockProducts
} from '../controllers/productController.js';

const router = express.Router();

// 📌 Specific routes first
router.get('/low-stock', verifyToken, checkRole(['super_admin', 'inventory_manager']), getLowStockProducts);
router.get('/paginated', verifyToken, getPaginatedProducts);

// 📌 General listing (all logged-in users can view)
router.get('/', verifyToken, getAllProducts);
router.get('/:id', verifyToken, getProductById);

// 📌 Admin-only actions
router.post('/', verifyToken, checkRole(['super_admin', 'inventory_manager']), addProduct);
router.put('/:id', verifyToken, checkRole(['super_admin', 'inventory_manager']), editProduct);
router.delete('/:id', verifyToken, checkRole(['super_admin', 'inventory_manager']), deleteProduct);

export default router;
