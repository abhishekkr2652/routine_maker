const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "B.Tech CSE 2024"
  semester: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', batchSchema);
