const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, getRoleId } = require('../db');
const { APIDataResponse, APIMessageResponse } = require('../ResponseModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();
router.post('/register', async (req, res) => {
    //getting all the fields from the request body
    let { username = null, email = null, password = null, role = null, linked_student_id = null } = req.body;

    //Null checks
    if (username == null || email == null || password == null || role == null) return APIMessageResponse(res, 400, 'All fields are required');
    //checking if the user exists
    const user = await pool.query(`SELECT * FROM Users WHERE name = ${username}`);
    if (user.rowCount !== 0) {
        return APIMessageResponse(res, 401, 'User exists');
    }

    //getting the role Id
    const roleId = await getRoleId(role);
    if (!roleId) return APIMessageResponse(res, 400, 'Invalid role');

    //Checking if the user role is school and Linked student id is provided, then changing the linked student id to null
    if (role === 'school') linked_student_id = null;

    //Generating a random student id if the role is student
    if (role === 'student') linked_student_id = crypto.randomUUID().toString();

    //Returning error if the role is parent and linked student id is null
    if (role === 'parent' && linked_student_id == null) return APIMessageResponse(res, 400, 'Parent must be linked to a student');

    //Checking if the linked student id is valid user
    const linkedUser = await pool.query(`select * from users where role_id=1 AND linked_student_id='${linked_student_id}';`)

    if ((role === 'parent') && linkedUser.rowCount == 0) return APIMessageResponse(res, 400, 'Invalid linked student id');
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        //Inserting new user into the database
        const newUser = await pool.query(
            `INSERT INTO Users (name, email, password, role_id, linked_student_id) VALUES ('${username}', '${email}', '${hashedPassword}', ${roleId}, '${linked_student_id}') RETURNING *`,
        );
        return APIMessageResponse(res, 200, 'User registered successfully');
    } catch (err) {
        console.log(err);
        return APIMessageResponse(res, 500, 'Error registering user');
    }
});

// Login User
router.post('/login', async (req, res) => {

    //getting all the fields from the request body
    const { username, password } = req.body;

    //Getting user from database
    const user = await pool.query(`SELECT * FROM Users WHERE name = ${username}`);

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
    const user = await pool.query(`SELECT * FROM Users WHERE email='${email}'`);
    if (user.rowCount === 0) {
        return APIMessageResponse(res, 401, 'User not found');
    }
    const token = randomString(32);
    await pool.query(`INSERT INTO password_change_requests (user_id, token) VALUES ('${user.rows[0].id}', '${token}')`);
    const resetLink = `Token = ${token} and id = ${user.rows[0].id}`;
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "extra.harshmithapara@gmail.com",
            pass: "jvgx pfna gulk mguf"
        }
    })
    const message = {
        text: resetLink,
        from: "Harsh Mithapara",
        to: email,
        subject: "Password Reset Link",
    };
    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log(err);
            return APIMessageResponse(res, 500, "Error sending email");
        }
    });
    return APIMessageResponse(res, 200, "Please Check your email");
});

//Reset Password
router.post("/reset-password", async (req, res) => {
    const { password, token, id } = req.body;
    const passwordRequest = await pool.query(`SELECT * FROM password_change_requests WHERE user_id = ${id}`);
    if (passwordRequest.rowCount > 0) {
        const validToken = token === passwordRequest.rows[0].token
        if (validToken) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(`UPDATE Users SET password = '${hashedPassword}' WHERE id = ${id}`);
            return APIMessageResponse(res, 200, "Password updated successfully");
        }
        return APIMessageResponse(res, 401, "Invalid Token");
    }
});

function randomString(length) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};

module.exports = router;
