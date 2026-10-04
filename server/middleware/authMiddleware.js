const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  if (!token || token.trim() === "") {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET is not configured in environment variables.");
    return res.status(500).json({ message: "Server authentication configuration error." });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    const userId = decoded.id.toString();
    req.user = {
      id: userId,
      _id: userId,
      email: decoded.email
    };
    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
