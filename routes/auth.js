const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, getRoleId } = require('../db');

const router = express.Router();
router.post('/register', async (req, res) => {
    debugger;
    const { username, password, role } = req.body;
    if (username == null || password == null || role == null) return res.status(400).json({ error: 'Missing fields' });

    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rowCount !== 0) {
        return res.status(401).json({ error: 'user exists' });
    }

    const roleId = await getRoleId(role);
    if (!roleId) return res.status(400).json({ error: 'Invalid role' });

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newUser = await pool.query(
            'INSERT INTO users (username, password, role_id) VALUES ($1, $2, $3) RETURNING *',
            [username, hashedPassword, roleId]
        );
        res.json({ message: 'User registered', user: newUser.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Login User
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rowCount === 0) {
        return res.status(401).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

module.exports = router;
