const jwt = require('jsonwebtoken');
const { APIMessageResponse } = require('../ResponseModel');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Permission denied' });
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
