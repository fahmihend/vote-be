// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  isVoted: Boolean,
});

module.exports = mongoose.model('User', userSchema);
