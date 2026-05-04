const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');

// Get all batches
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a batch
router.post('/', async (req, res) => {
  const batch = new Batch({
    name: req.body.name,
    semester: req.body.semester
  });
  try {
    const newBatch = await batch.save();
    res.status(201).json(newBatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a batch
router.delete('/:id', async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a batch
router.put('/:id', async (req, res) => {
  try {
    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name, semester: req.body.semester },
      { returnDocument: 'after' }
    );
    res.json(updatedBatch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
