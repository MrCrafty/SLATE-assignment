const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
});

// Function to get role ID by role name
const getRoleId = async (roleName) => {
    const role = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
    return role.rows.length > 0 ? role.rows[0].id : null;
};

module.exports = { pool, getRoleId };
