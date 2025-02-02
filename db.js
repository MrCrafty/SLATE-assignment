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
    const role = await pool.query(`SELECT id FROM roles WHERE name = ${roleName}`);
    return role.rows.length > 0 ? role.rows[0].id : null;
};

const getUserId = async (userName) => {
    const user = await pool.query(`SELECT id FROM users WHERE name = ${userName}`);
    return user.rows.length > 0 ? user.rows[0].id : null;
}

const checkStudent = async (user_id) => {
    const student = await pool.query(`SELECT * FROM Users WHERE role_id=1 AND linked_student_id='${user_id}'`);
    return student.rows.length > 0 ? true : false;
}
module.exports = { pool, getRoleId, checkStudent, getUserId };
