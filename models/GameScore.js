// models/GameScore.js
const mongoose = require('mongoose');

const GameScoreSchema = new mongoose.Schema({
  initials: {
    type: String,
    required: true,
    maxlength: 3,
  },
  score: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('GameScore', GameScoreSchema);
