const { db } = require('../config/firebase');

const COLLECTION_NAME = 'prompts';

// GET all prompts
exports.getPrompts = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const snapshot = await db.collection(COLLECTION_NAME).orderBy('createdAt', 'desc').get();
    const prompts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST new prompt
exports.createPrompt = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const { judul, kategori, isiTeks } = req.body;
    if (!judul || !isiTeks) {
      return res.status(400).json({ error: 'Judul dan Isi Teks wajib diisi' });
    }

    const newPrompt = {
      judul,
      kategori: kategori || 'Umum',
      isiTeks,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection(COLLECTION_NAME).add(newPrompt);
    res.status(201).json({ id: docRef.id, ...newPrompt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT (update) prompt
exports.updatePrompt = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedAt = new Date().toISOString();
    
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    res.json({ id, ...updateData, message: 'Prompt updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE prompt
exports.deletePrompt = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const { id } = req.params;
    await db.collection(COLLECTION_NAME).doc(id).delete();
    res.json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
