require('dotenv').config();
const express = require('express');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, department, status, created_at FROM users ORDER BY id'
    );
    res.json({ count: result.rowCount, users: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Users API running on http://localhost:${PORT}`);
});
