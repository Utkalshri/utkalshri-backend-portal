// routes/coupons.js
import express from "express";
const router = express.Router();
import { backendPool, pool } from '../models/db.js'; // ✅ Use ES import

// Add a coupon
// Add a coupon
router.post("/coupons", async (req, res) => {
  const {
    code,
    discount_type,
    discount_value,
    min_order,
    max_discount,
    expires_at,
    usage_limit,
    active,
  } = req.body;

  try {
    const client = await backendPool.connect();

    await client.query(
      `INSERT INTO coupons
        (code, discount_type, discount_value, min_order, max_discount, expires_at, usage_limit, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        code?.trim().toUpperCase(),
        discount_type,
        Number(discount_value) || 0,           // ✅ ensure numeric
        Number(min_order) || 0,                // ✅ ensure numeric
        max_discount === "" ? null : Number(max_discount), // ✅ allow null
        expires_at === "" ? null : expires_at,             // ✅ allow null
        Number(usage_limit) || 1,
        active === "false" || active === false ? false : true,
      ]
    );

    client.release();
    res.status(201).json({ message: "Coupon added successfully" });
  } catch (err) {
    console.error("❌ Add coupon error:", err);
    res.status(500).json({ message: "Failed to add coupon" });
  }
});


router.put("/coupons/:id", async (req, res) => {
  const id = req.params.id;
  const {
    code,
    discount_type,
    discount_value,
    min_order,
    max_discount,
    expires_at,
    usage_limit,
    active,
  } = req.body;

  try {
    const client = await backendPool.connect();

    await client.query(
      `UPDATE coupons SET
        code = $1,
        discount_type = $2,
        discount_value = $3,
        min_order = $4,
        max_discount = $5,
        expires_at = $6,
        usage_limit = $7,
        active = $8,
        updated_at = NOW()
      WHERE id = $9`,
      [
        code.trim().toUpperCase(),
        discount_type,
        discount_value,
        min_order,
        max_discount,
        expires_at,
        usage_limit,
        active,
        id,
      ]
    );

    client.release();
    res.json({ message: "Coupon updated successfully" });
  } catch (err) {
    console.error("❌ Update coupon error:", err);
    res.status(500).json({ message: "Failed to update coupon" });
  }
});

router.delete("/coupons/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const client = await backendPool.connect();
    await client.query(`DELETE FROM coupons WHERE id = $1`, [id]);
    client.release();
    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    console.error("❌ Delete coupon error:", err);
    res.status(500).json({ message: "Failed to delete coupon" });
  }
});

router.get("/coupons", async (req, res) => {
  try {
    const client = await backendPool.connect();
    const result = await client.query(`SELECT * FROM coupons ORDER BY created_at DESC`);
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Get coupons error:", err);
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
});

export default router; // ✅ Use ESM export
