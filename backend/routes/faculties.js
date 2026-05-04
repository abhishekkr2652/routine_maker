const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');

// Get all faculties
router.get('/', async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ name: 1 });
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a faculty
router.post('/', async (req, res) => {
  const faculty = new Faculty({
    name: req.body.name,
    department: req.body.department,
    phone: req.body.phone
  });
  try {
    const newFaculty = await faculty.save();
    res.status(201).json(newFaculty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a faculty
router.delete('/:id', async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: 'Faculty deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a faculty
router.put('/:id', async (req, res) => {
  try {
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        department: req.body.department,
        phone: req.body.phone
      },
      { returnDocument: 'after' }
    );
    res.json(updatedFaculty);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
