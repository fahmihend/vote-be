const jwt = require('jsonwebtoken');
const auth = {}

auth.generateToken = async (user) => {
  return jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

module.exports = auth;
