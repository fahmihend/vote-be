// Middleware for authentication
const jwt = require('jsonwebtoken');
const authenticateJWT = (req, res, next) => {
  const token = (req.headers?.authorization)?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ status: 'Failed', message: 'Token not provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ status: 'Failed', message: err.message });
    }

    req.user = user.user;
    next();
  });
}

const isAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    res
      .status(401)
      .json({ status: 'Failed', message: "Access denied. Only admin users are allowed." });
  }
};

module.exports = { authenticateJWT, isAdmin }
