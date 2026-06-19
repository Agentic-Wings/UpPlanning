const { db } = require('../config/firebase');

const COLLECTION_NAME = 'tasks';

// GET all tasks
exports.getTasks = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi. Mohon pastikan file firebase-service-account.json ada atau ENV sudah diatur.' });
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST new task
exports.createTask = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi. Mohon pastikan file firebase-service-account.json ada atau ENV sudah diatur.' });
  try {
    const { title, description, deadline, status } = req.body;
    const newTask = {
      title,
      description: description || '',
      deadline: deadline || '',
      status: status || 'todo', // 'todo', 'in_progress', 'done'
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection(COLLECTION_NAME).add(newTask);
    res.status(201).json({ id: docRef.id, ...newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT (update) task
exports.updateTask = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi. Mohon pastikan file firebase-service-account.json ada atau ENV sudah diatur.' });
  try {
    const { id } = req.params;
    const updateData = req.body;
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    res.json({ id, ...updateData, message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE task
exports.deleteTask = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database tidak terkoneksi. Mohon pastikan file firebase-service-account.json ada atau ENV sudah diatur.' });
  try {
    const { id } = req.params;
    await db.collection(COLLECTION_NAME).doc(id).delete();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
