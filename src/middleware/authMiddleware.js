const jwt = require("jsonwebtoken");

const JWT_SECRET = "This1s1hesecretk@yt0r8mmate.c0mSit#"; // Use env variable in production

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided" });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { authMiddleware, JWT_SECRET };  // Export JWT_SECRET
