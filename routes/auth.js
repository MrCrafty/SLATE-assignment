const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, getRoleId } = require('../db');
const { APIDataResponse, APIMessageResponse } = require('../ResponseModel');
const emailjs = require('@emailjs/browser');
const crypto = require('crypto');


const router = express.Router();
router.post('/register', async (req, res) => {
    //getting all the fields from the request body
    let { username = null, email = null, password = null, role = null, linked_student_id = null } = req.body;

    //Null checks
    if (username == null || email == null || password == null || role == null) return res.status(400).json({ error: 'Missing fields' });
    //checking if the user exists
    const user = await pool.query('SELECT * FROM Users WHERE name = $1', [username]);
    if (user.rowCount !== 0) {
        return res.status(401).json({ error: 'user exists' });
    }

    //getting the role Id
    const roleId = await getRoleId(role);
    if (!roleId) return res.status(400).json({ error: 'Invalid role' });

    //Checking if the user role is school and Linked student id is provided, then changing the linked student id to null
    if (role === 'school') linked_student_id = null;

    //Generating a random linked student id if the role is student
    if (role === 'student') linked_student_id = crypto.randomUUID().toString();

    //Returning error if the role is parent and linked student id is null
    if (role === 'parent' && linked_student_id == null) return res.status(401).json({ error: 'Parent must be linked to a student' });

    //Checking if the linked student id is valid user
    const linkedUser = await pool.query(`select * from users where role_id=1 AND linked_student_id='${linked_student_id}';`)

    if ((role === 'parent') && linkedUser.rowCount == 0) return res.status(400).json({ 'message': 'Invalid linked Student' })
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        //Inserting new user into the database
        const newUser = await pool.query(
            `INSERT INTO Users (name, email, password, role_id, linked_student_id) VALUES ('${username}', '${email}', '${hashedPassword}', ${roleId}, '${linked_student_id}') RETURNING *`,
        );
        res.json({ message: 'User registered', user: newUser.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login User
router.post('/login', async (req, res) => {

    //getting all the fields from the request body
    const { username, password } = req.body;

    //Getting user from database
    const user = await pool.query('SELECT * FROM Users WHERE name = $1', [username]);

    //Returning error if the user is not found
    if (user.rowCount === 0) {
        return APIMessageResponse(res, 401, 'User not found');
    }
    // Checking if the password matches
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
        return APIMessageResponse(res, 401, 'Invalid password');
    }
    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role_id, linked_student: user.rows[0].linked_student_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return APIDataResponse(res, 200, { token })
});

router.get("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (user.rowCount === 0) {
        return APIMessageResponse(res, 401, 'User not found');
    }
    const Id = crypto.randomUUID().toString();
    const hashedId = bcrypt.hash(Id, 10);
    await pool.query('INSERT INTO password_change_requests (user_id, id) VALUES ($1, $2)', [user.rows[0].id, hashedId]);
    const resetLink = `http://localhost:5000/reset-password?id=${user.rows[0].id}&token=${Id}`;
    emailjs.send("service_k5kxf4h", "template_rrv7nat", { "reset_link": resetLink, "to_email": email });
    return APIMessageResponse(res, 200, "Please Check your email");
});

//Reset Password
router.post("/reset-password", async (req, res) => {
    const token = req.query.token;
    const id = req.query.id;
    const passwordRequest = await pool.query("SELECT * FROM password_change_requests WHERE user_id = $1", [id]);
    if (passwordRequest.rowCount > 0) {
        const validToken = bcrypt.compare(token, passwordRequest.rows[0].id);
        if (validToken) {
            const { password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query("UPDATE Users SET password = $1 WHERE id = $2", [hashedPassword, id]);
            return APIMessageResponse(res, 200, "Password updated successfully");
        }
        return APIMessageResponse(res, 401, "Invalid Token");
    }
});

module.exports = router;
