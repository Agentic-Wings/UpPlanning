const { db } = require('../config/firebase');

const COLLECTION_NAME = 'drawings';

// GET all drawings
exports.getDrawings = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi.' });
  try {
    const snapshot = await db.collection(COLLECTION_NAME).orderBy('updatedAt', 'desc').get();
    const drawings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(drawings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET single drawing
exports.getDrawing = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi.' });
  try {
    const { id } = req.params;
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Drawing not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST new drawing
exports.createDrawing = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi.' });
  try {
    const { title, elements } = req.body;
    const newDrawing = {
      title: title || 'Untitled Drawing',
      elements: elements || [], // Vector data (lines, strokes)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await db.collection(COLLECTION_NAME).add(newDrawing);
    res.status(201).json({ id: docRef.id, ...newDrawing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update drawing
exports.updateDrawing = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi.' });
  try {
    const { id } = req.params;
    const { title, elements } = req.body;
    
    const updateData = { updatedAt: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (elements !== undefined) updateData.elements = elements;

    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    res.json({ id, ...updateData, message: 'Drawing updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE drawing
exports.deleteDrawing = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi.' });
  try {
    const { id } = req.params;
    await db.collection(COLLECTION_NAME).doc(id).delete();
    res.json({ message: 'Drawing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
