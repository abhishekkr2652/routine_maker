const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // e.g., "CS101"
  abbreviation: { type: String, required: true }, // e.g., "MOOC-1"
  department: { type: String },
  semester: { type: Number },
  type: { type: String, enum: ['Theory', 'Lab'], required: true },
  credit: { type: Number, required: true },
  color: { type: String, default: '#E2E8F0' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subject', subjectSchema);
