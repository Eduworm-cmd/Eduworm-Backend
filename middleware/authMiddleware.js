const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();


const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(403).json({ message: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded, allowedRoles)
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: `Access denied for role: ${decoded.role}` });
      }

      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

module.exports = roleMiddleware;