// models/Vote.js
const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  name: String,
  count: Number,
});

module.exports = mongoose.model('Vote', voteSchema);
