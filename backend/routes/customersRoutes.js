import express from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  getCustomerDetail,
  getPaginatedCustomers
} from '../controllers/customersController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Protect all customer routes
router.use(verifyToken);

// CRUD routes
router.get('/paginated', verifyToken, getPaginatedCustomers);
router.get('/:id', verifyToken, getCustomerDetail);
router.get('/',verifyToken, getAllCustomers);
router.get('/:id',verifyToken, getCustomerById);
router.post('/',verifyToken, createCustomer);
// router.put('/:id',verifyToken, updateCustomer);
// router.delete('/:id',verifyToken, deleteCustomer);

export default router;
