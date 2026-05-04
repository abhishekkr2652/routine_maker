const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');

// Get all routine entries (can filter by batch or faculty)
router.get('/', async (req, res) => {
  try {
    const { batchId, facultyId } = req.query;
    let query = {};
    if (batchId) query.batchId = batchId;
    if (facultyId) query.facultyId = facultyId;

    const routines = await Routine.find(query)
      .populate('batchId')
      .populate('subjectId')
      .populate('facultyId');
    res.json(routines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check conflict
router.post('/check-conflict', async (req, res) => {
  const { batchId, day, timeSlot, facultyId, room } = req.body;
  try {
    // 1. Faculty Conflict
    const facultyConflict = await Routine.findOne({ facultyId, day, timeSlot, batchId: { $ne: batchId } });
    if (facultyConflict) {
      return res.status(200).json({ hasConflict: true, message: 'Faculty is already assigned to another class at this time.' });
    }
    // 2. Batch Conflict (Handled implicitly by the UI allowing only 1 slot per batch)
    // 3. Room Conflict
    const roomConflict = await Routine.findOne({ room, day, timeSlot, batchId: { $ne: batchId } });
    if (roomConflict) {
      return res.status(200).json({ hasConflict: true, message: 'Room is already occupied at this time.' });
    }

    res.status(200).json({ hasConflict: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save or Update Routine Bulk
router.post('/bulk', async (req, res) => {
  const { batchId, entries } = req.body; // entries is array of routine objects
  try {
    // Delete all existing entries for this batch to replace with new
    await Routine.deleteMany({ batchId });

    if (entries && entries.length > 0) {
      // Add batchId to each entry
      const recordsToInsert = entries.map(entry => ({ ...entry, batchId }));
      await Routine.insertMany(recordsToInsert);
    }
    
    res.status(201).json({ message: 'Routine saved successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
