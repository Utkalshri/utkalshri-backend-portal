import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Admin DB (default)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

// Backend DB (for coupons, etc.)
export const backendPool = new Pool({
  connectionString: process.env.BACKEND_DATABASE_URL,
  ssl: process.env.BACKEND_DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});
backendPool.on('connect', () => {
  console.log('🔁 Connected to Backend PostgreSQL');
});

