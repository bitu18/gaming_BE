const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
    const token = req.cookies.token; // token from cookie

    if (!JWT_SECRET_KEY) {
        console.warn('⚠️ JWT_SECRET_KEY is not set in environment variables');
    }

    if (!token) return res.status(401).json({ errorCode: -1, errorMessage: 'Missing token' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        req.user = decoded; // Store user info in req.user for next middleware
        next();
    } catch (error) {
        return res.status(403).json({ errorCode: -2, errorMessage: 'Invalid or expired token' });
    }
};

module.exports = verifyToken;
