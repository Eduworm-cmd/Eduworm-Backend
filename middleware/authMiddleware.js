const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
console.log(decoded)
        if (decoded.role !== "schooladmin") {
            return res.status(403).json({ message: "Only SchoolAdmin allowed" });
        }

        req.user = decoded; // decoded includes: id and role
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;
