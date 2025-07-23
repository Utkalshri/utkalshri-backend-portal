import express from 'express';
import multer from 'multer';
import path from 'path';
import { verifyToken } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Setup multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// ✅ Only super_admin and inventory_manager can upload images
router.post(
  '/',
  verifyToken,
  checkRole(['super_admin', 'inventory_manager']),
  upload.any(),
  (req, res) => {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = req.files[0];
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${uploadedFile.filename}`;
    res.json({ url: fileUrl });
  }
);

export default router;
