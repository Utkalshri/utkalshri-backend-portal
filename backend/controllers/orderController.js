import { pool } from '../models/db.js';

/**
 * POST /api/admin/orders
 * Add new order
 */
// export const addOrder = async (req, res) => {
//   const {
//     customer_name, customer_phone, customer_email,
//     shipping_address, payment_method, payment_status,
//     status, notes, items
//   } = req.body;

//   // ✅ Validate
//   if (!items || !Array.isArray(items) || items.length === 0) {
//     return res.status(400).json({ error: 'Order must include at least one item.' });
//   }

//   if (!customer_name || !customer_phone || !shipping_address) {
//     return res.status(400).json({ error: 'Customer name, phone, and shipping address are required.' });
//   }

//   try {
//     // ✅ Check if all product IDs exist in products table
//     for (const item of items) {
//       const productCheck = await pool.query(
//         `SELECT id FROM products WHERE id = $1`,
//         [item.product_id]
//       );

//       if (productCheck.rowCount === 0) {
//         return res.status(400).json({
//           error: `Invalid product_id: ${item.product_id}. This product does not exist.`
//         });
//       }
//     }

//     // ✅ Calculate total_amount
//     const total_amount = items.reduce((sum, item) => sum + (item.total || 0), 0);

//     // 1️⃣ Insert order header
//     const orderResult = await pool.query(
//       `INSERT INTO orders (
//          customer_name, customer_phone, customer_email,
//          shipping_address, total_amount, status,
//          payment_status, payment_method, notes
//        )
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
//        RETURNING *`,
//       [
//         customer_name, customer_phone, customer_email,
//         shipping_address, total_amount, status || 'Pending',
//         payment_status || 'Unpaid', payment_method, notes
//       ]
//     );

//     const order = orderResult.rows[0];

//     // 2️⃣ Insert order items
//     const insertPromises = items.map(item =>
//       pool.query(
//         `INSERT INTO order_items (
//            order_id, product_id, product_name, sku,
//            price, quantity, total
//          )
//          VALUES ($1,$2,$3,$4,$5,$6,$7)`,
//         [
//           order.id,
//           item.product_id,
//           item.product_name,
//           item.sku,
//           item.price,
//           item.quantity,
//           item.total
//         ]
//       )
//     );

//     await Promise.all(insertPromises);

//     res.status(201).json(order);

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

export const addOrder = async (req, res) => {
  const {
    customer_id, customer_name, customer_phone, customer_email,
    shipping_address, payment_method, payment_status,
    status, notes, items
  } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one item.' });
  }

  if (!customer_name || !customer_phone || !shipping_address) {
    return res.status(400).json({ error: 'Customer name, phone, and shipping address are required.' });
  }

  try {
    // ✅ Step 1: Ensure products are valid
    for (const item of items) {
      const productCheck = await pool.query(
        `SELECT id FROM products WHERE id = $1`,
        [item.product_id]
      );

      if (productCheck.rowCount === 0) {
        return res.status(400).json({
          error: `Invalid product_id: ${item.product_id}. This product does not exist.`
        });
      }
    }

    // ✅ Step 2: Ensure customer exists, or create one
    let finalCustomerId = customer_id;

    if (!finalCustomerId && customer_email) {
      const existingCustomer = await pool.query(
        `SELECT id FROM customers WHERE email = $1`,
        [customer_email]
      );

      if (existingCustomer.rowCount > 0) {
        finalCustomerId = existingCustomer.rows[0].id;
      } else {
        const inserted = await pool.query(
          `INSERT INTO customers (name, email, phone, address, status, notes)
           VALUES ($1, $2, $3, $4, 'Active', '')
           RETURNING id`,
          [customer_name, customer_email, customer_phone, shipping_address]
        );
        finalCustomerId = inserted.rows[0].id;
      }
    }

    // ✅ Step 3: Calculate total
    const total_amount = items.reduce((sum, item) => sum + (item.total || 0), 0);

    // ✅ Step 4: Insert order
    const orderResult = await pool.query(
      `INSERT INTO orders (
         customer_id, customer_name, customer_phone, customer_email,
         shipping_address, total_amount, status,
         payment_status, payment_method, notes
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        finalCustomerId || null,
        customer_name, customer_phone, customer_email,
        shipping_address, total_amount, status || 'Pending',
        payment_status || 'Unpaid', payment_method, notes
      ]
    );

    const order = orderResult.rows[0];

    // ✅ Step 5: Insert order items
    const insertPromises = items.map(item =>
      pool.query(
        `INSERT INTO order_items (
           order_id, product_id, product_name, sku,
           price, quantity, total
         )
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          order.id,
          item.product_id,
          item.product_name,
          item.sku,
          item.price,
          item.quantity,
          item.total
        ]
      )
    );

    await Promise.all(insertPromises);

    // ✅ Step 6: Update customer stats
    if (finalCustomerId) {
      await pool.query(
        `UPDATE customers
         SET
           last_order_at = NOW(),
           total_orders = total_orders + 1,
           total_spent = total_spent + $1,
           updated_at = NOW()
         WHERE id = $2`,
        [total_amount, finalCustomerId]
      );
    }

    res.status(201).json(order);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


/**
 * GET /api/admin/orders
 * List all orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, customer_name, customer_phone, customer_email,
             shipping_address, total_amount, status, payment_status,
             payment_method, created_at
      FROM orders
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/orders/:id
 * Get single order with items
 */
// export const getOrderDetail = async (req, res) => {
//   const { id } = req.params;

//   try {
//     // 1️⃣ Get order header
//     const orderResult = await pool.query(
//       `SELECT * FROM orders WHERE id = $1`,
//       [id]
//     );

//     if (orderResult.rows.length === 0) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     const order = orderResult.rows[0];

//     // 2️⃣ Get order items
//     const itemsResult = await pool.query(
//       `SELECT oi.*, p.name AS product_name, p.image_url
//        FROM order_items oi
//        JOIN products p ON oi.product_id = p.id
//        WHERE oi.order_id = $1`,
//       [id]
//     );

//     order.items = itemsResult.rows;

//     // 3️⃣ Get order status history
//     const historyResult = await pool.query(
//       `SELECT * FROM order_status_history
//        WHERE order_id = $1
//        ORDER BY changed_at DESC`,
//       [id]
//     );
//     order.status_history = historyResult.rows;

//     res.json(order);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

/**
 * GET /api/admin/orders/:id
 * Get single order with items
 */
export const getOrderDetail = async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Get order header
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // 2️⃣ Get order items (fixed)
    const itemsResult = await pool.query(
      `SELECT 
         oi.id,
         oi.order_id,
         oi.product_id,
         COALESCE(p.name, oi.product_name) AS product_name,
         oi.sku,
         oi.price,
         oi.quantity,
         oi.total,
         p.image_url
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    order.items = itemsResult.rows;

    // 3️⃣ Get order status history
    const historyResult = await pool.query(
      `SELECT * FROM order_status_history
       WHERE order_id = $1
       ORDER BY changed_at DESC`,
      [id]
    );

    order.status_history = historyResult.rows;

    // ✅ Return complete order
    res.json(order);

  } catch (err) {
    console.error('❌ Error fetching order detail:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/admin/orders/:id/status
 * Update order status
 */
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, changed_by } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  try {
    // 1️⃣ Update order
    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const updatedOrder = result.rows[0];

    // 2️⃣ Optionally insert into status history
    await pool.query(
      `INSERT INTO order_status_history (order_id, status, changed_by)
       VALUES ($1, $2, $3)`,
      [id, status, changed_by || 'Admin']
    );

    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Paginated Orders
export const getPaginatedOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status;

    // Build dynamic WHERE clause
    let whereClause = '';
    const params = [];

    if (statusFilter) {
      whereClause = 'WHERE status = $1';
      params.push(statusFilter);
    }

    // 1️⃣ Get total count
    const countQuery = `SELECT COUNT(*) FROM orders ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // 2️⃣ Get paginated data
    let dataQuery = `
      SELECT id, customer_name, customer_phone, customer_email,
             shipping_address, total_amount, status, payment_status,
             payment_method, created_at
      FROM orders
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);
    const dataResult = await pool.query(dataQuery, params);

    res.json({
      total,
      page,
      limit,
      data: dataResult.rows
    });
  } catch (err) {
    console.error('Error fetching paginated orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
