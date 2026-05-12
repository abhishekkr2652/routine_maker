const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// Get all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a subject
router.post('/', async (req, res) => {
  const subject = new Subject({
    name: req.body.name,
    code: req.body.code,
    abbreviation: req.body.abbreviation,
    type: req.body.type,
    credit: req.body.credit,
    color: req.body.color
  });
  try {
    const newSubject = await subject.save();
    res.status(201).json(newSubject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a subject
router.delete('/:id', async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a subject
router.put('/:id', async (req, res) => {
  try {
    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        code: req.body.code,
        abbreviation: req.body.abbreviation,
        type: req.body.type,
        credit: req.body.credit,
        color: req.body.color
      },
      { returnDocument: 'after' }
    );
    res.json(updatedSubject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
