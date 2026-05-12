const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const auth = require('../middleware/auth');

// Get all batches
router.get('/', auth, async (req, res) => {
  try {
    const batches = await Batch.find({ department: req.user.department }).sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a batch
router.post('/', auth, async (req, res) => {
  const batch = new Batch({
    name: req.body.name,
    semester: req.body.semester,
    room: req.body.room,
    department: req.user.department
  });
  try {
    const newBatch = await batch.save();
    res.status(201).json(newBatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a batch
router.delete('/:id', auth, async (req, res) => {
  try {
    await Batch.findOneAndDelete({ _id: req.params.id, department: req.user.department });
    res.json({ message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a batch
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedBatch = await Batch.findOneAndUpdate(
      { _id: req.params.id, department: req.user.department },
      { name: req.body.name, semester: req.body.semester, room: req.body.room },
      { returnDocument: 'after' }
    );
    res.json(updatedBatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
