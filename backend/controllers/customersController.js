// Customer controller 
import { pool } from '../models/db.js';

// ✅ GET /api/admin/customers
export const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ GET /api/admin/customers/:id
export const getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ POST /api/admin/customers
export const createCustomer = async (req, res) => {
  const { name, email, phone, address, status, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO customers (name, email, phone, address, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, email, phone, address, status || 'Active', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ PUT /api/admin/customers/:id
// export const updateCustomer = async (req, res) => {
//   const { id } = req.params;
//   const { name, email, phone, address, status, notes } = req.body;
//   try {
//     const result = await pool.query(
//       `UPDATE customers
//        SET name = $1,
//            email = $2,
//            phone = $3,
//            address = $4,
//            status = $5,
//            notes = $6,
//            updated_at = now()
//        WHERE id = $7
//        RETURNING *`,
//       [name, email, phone, address, status, notes, id]
//     );

//     if (result.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });

//     res.json(result.rows[0]);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// ✅ DELETE /api/admin/customers/:id
// export const deleteCustomer = async (req, res) => {
//   const { id } = req.params;
//   try {
//     await pool.query('DELETE FROM customers WHERE id = $1', [id]);
//     res.json({ message: 'Customer deleted' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// Get paginated all customers
export const getPaginatedCustomers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM customers');
    const total = parseInt(countResult.rows[0].count, 10);

    // const result = await pool.query(
    //   `SELECT id, name, email, phone, address, status, last_order_at,
    //           total_orders, total_spent, created_at
    //    FROM customers
    //    ORDER BY created_at DESC
    //    LIMIT $1 OFFSET $2`,
    //   [limit, offset]
    // );

    // ✅ Fetch customers with live order count
    const result = await pool.query(
      `
      SELECT 
        c.id, c.name, c.email, c.phone, c.address, c.status, c.last_order_at,
        COALESCE(order_counts.total_orders, 0) AS total_orders,
        c.total_spent,
        c.created_at
      FROM customers c
      LEFT JOIN (
        SELECT customer_id, COUNT(*) AS total_orders
        FROM orders
        GROUP BY customer_id
      ) AS order_counts ON order_counts.customer_id = c.id
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    res.json({ total, page, limit, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET Single Customer (with orders)
// export const getCustomerDetail = async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Get customer
//     const customerResult = await pool.query(
//       `SELECT * FROM customers WHERE id = $1`,
//       [id]
//     );

//     if (customerResult.rows.length === 0) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     const customer = customerResult.rows[0];

//     // Get recent orders
//     const ordersResult = await pool.query(
//       `SELECT id, total_amount, status, payment_status, payment_method, created_at
//        FROM orders
//        WHERE customer_id = $1
//        ORDER BY created_at DESC
//        LIMIT 10`,
//       [id]
//     );

//     customer.orders = ordersResult.rows;

//     res.json(customer);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// GET Single Customer (with orders and order items)
export const getCustomerDetail = async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Get customer
    const customerResult = await pool.query(
      `SELECT * FROM customers WHERE id = $1`,
      [id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = customerResult.rows[0];

    // 2️⃣ Calculate true total_orders live
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM orders WHERE customer_id = $1`,
      [id]
    );

    customer.total_orders = parseInt(countResult.rows[0].count, 10);

    // 2️⃣ Get recent orders for customer
    const ordersResult = await pool.query(
      `SELECT id, total_amount, status, payment_status, payment_method, created_at
       FROM orders
       WHERE customer_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [id]
    );

    // ✅ Make sure this line is here!
    const customerOrders = ordersResult.rows;

    // 3️⃣ For each order, get its items
    for (let order of customerOrders) {
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
        [order.id]
      );

      order.items = itemsResult.rows;
    }

    // 4️⃣ Attach orders with items to customer
    customer.orders = customerOrders;

    // ✅ Respond
    res.json(customer);

  } catch (err) {
    console.error('❌ Error fetching customer detail:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
