const jwtUtility = require('../utilities/jwtUtility');

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    const decoded = jwtUtility.verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Неверный токен' });
    }

    req.user = decoded;
    next();
}

module.exports = authMiddleware;
