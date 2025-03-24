const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_token || "your_jwt_screte";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from header

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized - No Token Provided",
    });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach user to request
    next(); // Continue to next middleware
  } catch (error) {
    res.status(401).json({ message: "Unauthorized - Invalid Token" });
  }
};

module.exports = authMiddleware;
