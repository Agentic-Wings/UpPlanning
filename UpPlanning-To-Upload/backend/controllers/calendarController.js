const { db } = require('../config/firebase');

const COLLECTION_NAME = 'calendar_events';

// GET all events
exports.getEvents = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi. Mohon pastikan file firebase-service-account.json ada atau ENV sudah diatur.' });
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST new event
exports.createEvent = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi. Mohon pastikan file firebase-service-account.json ada atau ENV sudah diatur.' });
  try {
    const { tanggal, judul, deskripsi, label } = req.body;
    const newEvent = {
      tanggal,
      judul,
      deskripsi: deskripsi || '',
      label: label || 'Lainnya',
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection(COLLECTION_NAME).add(newEvent);
    res.status(201).json({ id: docRef.id, ...newEvent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT (update) event
exports.updateEvent = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi. Mohon pastikan file firebase-service-account.json ada atau ENV sudah diatur.' });
  try {
    const { id } = req.params;
    const updateData = req.body;
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    res.json({ id, ...updateData, message: 'Event updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE event
exports.deleteEvent = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi. Mohon pastikan file firebase-service-account.json ada atau ENV sudah diatur.' });
  try {
    const { id } = req.params;
    await db.collection(COLLECTION_NAME).doc(id).delete();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
