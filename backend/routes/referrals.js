//referral.js
import express from "express";
const router = express.Router();
import { pool } from "../models/db.js";

//
// 🔹 Admin: Get all referral codes with user info
//
router.get("/referral-codes", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rc.*, c.name AS user_name
       FROM referral_codes rc
       JOIN customers c ON rc.user_id = c.id
       ORDER BY rc.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching all referral codes:", err);
    res.status(500).json({ message: "Failed to fetch referral codes" });
  }
});

//
// 🔹 Admin: Create Referral Code (with reward_amount)
//
router.post("/referral-codes", async (req, res) => {
  const { user_id, code, reward_amount } = req.body;
  try {
    await pool.query(
      `INSERT INTO referral_codes (user_id, code, reward_amount)
       VALUES ($1, $2, $3)`,
      [user_id, code.trim().toUpperCase(), reward_amount]
    );
    res.status(201).json({ message: "Referral code created" });
  } catch (err) {
    console.error("❌ Error creating referral code:", err);
    res.status(500).json({ message: "Failed to create referral code" });
  }
});

//
// 🔹 Admin: Update Referral Code
//
router.put("/referral-codes/:id", async (req, res) => {
  const { id } = req.params;
  const { code, reward_amount } = req.body;
  try {
    await pool.query(
      `UPDATE referral_codes SET code = $1, reward_amount = $2 WHERE id = $3`,
      [code.trim().toUpperCase(), reward_amount, id]
    );
    res.json({ message: "Referral code updated" });
  } catch (err) {
    console.error("❌ Error updating referral code:", err);
    res.status(500).json({ message: "Failed to update referral code" });
  }
});

//
// 🔹 Admin: Delete Referral Code
//
router.delete("/referral-codes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM referral_codes WHERE id = $1`, [id]);
    res.json({ message: "Referral code deleted" });
  } catch (err) {
    console.error("❌ Error deleting referral code:", err);
    res.status(500).json({ message: "Failed to delete referral code" });
  }
});

//
// 🔹 Get Referral Code by User ID (optional)
//
router.get("/referral-codes/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM referral_codes WHERE user_id = $1",
      [user_id]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    console.error("❌ Error fetching referral code by user:", err);
    res.status(500).json({ message: "Failed to fetch referral code" });
  }
});

//
// 🔹 Record Referral Usage (already fine)
//
// 🔹 Admin: Get All Referral Usage
// GET /api/admin/referral-usage
router.get("/referral-usage", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ru.*, 
             referrer.name AS referrer_name,
             referred.name AS referred_name
      FROM referral_usage ru
      JOIN customers referrer ON ru.referrer_user_id = referrer.id
      JOIN customers referred ON ru.referred_user_id = referred.id
      ORDER BY ru.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching referral usage:", err);
    res.status(500).json({ message: "Failed to fetch referral usage" });
  }
});



//
// 🔹 Mark Reward as Applied (already fine)
//
router.put("/referral-usage/:id/reward", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      `UPDATE referral_usage SET reward_applied = true WHERE id = $1`,
      [id]
    );
    res.json({ message: "Reward marked as applied" });
  } catch (err) {
    console.error("❌ Error updating reward:", err);
    res.status(500).json({ message: "Failed to apply reward" });
  }
});


export default router;
