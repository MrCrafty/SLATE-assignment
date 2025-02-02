const express = require('express');
const { checkStudent, pool } = require('../utils/db');
const { APIMessageResponse, APIDataResponse } = require("../utils/ResponseModel")

const router = express.Router();

router.get("/achievements", async (req, res) => {
    const user = await pool.query(`SELECT * FROM StudentAchievements WHERE linked_student_id = '${req.query.id}'`);
    return APIDataResponse(res, 200, user.rows);
});

router.post("/achievements", async (req, res) => {
    if (req.body.achievement == undefined) {
        return APIMessageResponse(res, 400, "Achievement is required");
    }
    if (!checkStudent(req.query.id)) return APIMessageResponse(res, 400, "User is not a student");
    if (typeof (req.body.achievement) !== 'string') return APIMessageResponse(res, 400, "Achievement must be a string");

    const user = await pool.query(`Select name from Users where role_id='1' AND linked_student_id='${req.query.id}'`);
    pool.query(`INSERT INTO StudentAchievements (linked_student_id, name, school_name, achievements) VALUES ('${req.query.id}', '${user.rows[0].name}','${req.body.school_name}' ,'${req.body.achievement}')`);
    return APIMessageResponse(res, 200, "Achievement added successfully");
});
module.exports = router;