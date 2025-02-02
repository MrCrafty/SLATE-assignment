const jwt = require('jsonwebtoken');
const { APIMessageResponse } = require('../ResponseModel');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return APIMessageResponse(res, 401, 'Access Denied');

    try {
        const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return APIMessageResponse(res, 400, 'Invalid Token');
    }
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return APIMessageResponse(res, 403, "Access Denied");
        }
        next();
    };
};

const checkLinkedStudent = (req, res, next) => {
    if (req.user.linked_student !== req.query.id) {
        return APIMessageResponse(res, 403, "Access Denied");
    }
    next();
}

module.exports = { authenticateToken, authorizeRole, checkLinkedStudent };
