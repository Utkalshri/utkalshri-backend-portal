import { pool } from '../models/db.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const [
      totalOrdersResult,
      pendingOrdersResult,
      completedOrdersResult,
      totalSalesResult,
      totalProductsResult
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM orders`),
      pool.query(`SELECT COUNT(*) FROM orders WHERE status = 'Pending'`),
      pool.query(`SELECT COUNT(*) FROM orders WHERE status = 'Delivered'`),
      pool.query(`SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'Paid'`),
      pool.query(`SELECT COUNT(*) FROM products`)
    ]);

    res.json({
      total_orders: parseInt(totalOrdersResult.rows[0].count),
      pending_orders: parseInt(pendingOrdersResult.rows[0].count),
      completed_orders: parseInt(completedOrdersResult.rows[0].count),
      total_sales_amount: parseFloat(totalSalesResult.rows[0].coalesce),
      total_products: parseInt(totalProductsResult.rows[0].count)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
