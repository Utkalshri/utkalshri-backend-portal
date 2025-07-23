import { pool } from '../models/db.js';

// ✅ Get all products (basic list)
export const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Get single product with gallery images
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const productResult = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];

    // Also fetch gallery images
    const imagesResult = await pool.query(
      'SELECT image_url FROM product_images WHERE product_id = $1',
      [id]
    );

    product.gallery_images = imagesResult.rows.map(row => row.image_url);

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Paginated Products
export const getPaginatedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const totalResult = await pool.query('SELECT COUNT(*) FROM products');
    const total = parseInt(totalResult.rows[0].count);

    const dataResult = await pool.query(`
      SELECT id, name, sku, category_name, price, discount_price, stock_qty, image_url, active, created_at
      FROM products
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      total,
      page,
      limit,
      data: dataResult.rows
    });

  } catch (err) {
    console.error('Error fetching paginated products:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Add Product
export const addProduct = async (req, res) => {
  const {
    name, sku,
    category_name, subcategory_name,
    occasion, pattern,
    price, discount_price, stock_qty,
    weight, length, width, height,
    color, fabric_type, weaving_type,
    description, highlights,
    image_url, active,
    meta_title, meta_description,
    gallery_images
  } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO products (
        name, sku,
        category_name, subcategory_name,
        occasion, pattern,
        price, discount_price, stock_qty,
        weight, length, width, height,
        color, fabric_type, weaving_type,
        description, highlights,
        image_url, active,
        meta_title, meta_description
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,
        $10,$11,$12,$13,
        $14,$15,$16,
        $17,$18,
        $19,$20,
        $21,$22
      )
      RETURNING *
      `,
      [
        name, sku,
        category_name, subcategory_name,
        occasion, pattern,
        price, discount_price, stock_qty,
        weight, length, width, height,
        color, fabric_type, weaving_type,
        description, highlights,
        image_url, active,
        meta_title, meta_description
      ]
    );

    const newProduct = result.rows[0];

    // ✅ Insert gallery images if provided
    if (gallery_images && Array.isArray(gallery_images) && gallery_images.length > 0) {
      const insertPromises = gallery_images.map(url =>
        pool.query(
          `INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)`,
          [newProduct.id, url]
        )
      );
      await Promise.all(insertPromises);
    }

    res.status(201).json(newProduct);

  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'SKU already exists. Please choose a unique SKU.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Edit Product
export const editProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name, sku,
    category_name, subcategory_name,
    occasion, pattern,
    price, discount_price, stock_qty,
    weight, length, width, height,
    color, fabric_type, weaving_type,
    description, highlights,
    image_url, active,
    meta_title, meta_description,
    gallery_images
  } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE products SET
        name=$1, sku=$2,
        category_name=$3, subcategory_name=$4,
        occasion=$5, pattern=$6,
        price=$7, discount_price=$8, stock_qty=$9,
        weight=$10, length=$11, width=$12, height=$13,
        color=$14, fabric_type=$15, weaving_type=$16,
        description=$17, highlights=$18,
        image_url=$19, active=$20,
        meta_title=$21, meta_description=$22,
        updated_at=NOW()
      WHERE id=$23
      RETURNING *
      `,
      [
        name, sku,
        category_name, subcategory_name,
        occasion, pattern,
        price, discount_price, stock_qty,
        weight, length, width, height,
        color, fabric_type, weaving_type,
        description, highlights,
        image_url, active,
        meta_title, meta_description,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = result.rows[0];

    // ✅ Replace gallery images if provided
    if (gallery_images && Array.isArray(gallery_images)) {
      // Remove old
      await pool.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);

      // Insert new
      const insertPromises = gallery_images.map(url =>
        pool.query(
          `INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)`,
          [id, url]
        )
      );
      await Promise.all(insertPromises);
    }

    res.json(updatedProduct);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // Cascades should handle images if ON DELETE CASCADE is set
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ Low Stock Report
export const getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;
    const result = await pool.query(
      `SELECT id, name, sku, stock_qty
       FROM products
       WHERE stock_qty <= $1
       ORDER BY stock_qty ASC`,
      [threshold]
    );

    res.json(result.rows);

  } catch (err) {
    console.error('Error fetching low stock products:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
