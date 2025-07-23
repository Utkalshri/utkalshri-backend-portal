import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import {
  getAllOrders,
  getOrderDetail,
  updateOrderStatus,
  getPaginatedOrders
} from '../controllers/orderController.js';

const router = express.Router();

// ✅ Pagination with optional filtering (open to all verified users)
router.get('/paginated', verifyToken, getPaginatedOrders);

// ✅ General listing
router.get('/', verifyToken, getAllOrders);

// ✅ Single order details
router.get('/:id', verifyToken, getOrderDetail);

// ✅ Status update - restricted!
router.patch('/:id/status', verifyToken, checkRole(['super_admin', 'order_manager']), updateOrderStatus);

export default router;
