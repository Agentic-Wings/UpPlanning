const { db } = require('../config/firebase');

const COLLECTION_NAME = 'chat_sessions';

// GET all chat sessions (list for sidebar)
exports.getSessions = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const snapshot = await db.collection(COLLECTION_NAME).orderBy('updatedAt', 'desc').get();
    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // We only need id, title, updatedAt, and systemPrompt for sidebar
    const sidebarSessions = sessions.map(s => ({
      id: s.id,
      title: s.title,
      updatedAt: s.updatedAt,
      systemPrompt: s.systemPrompt
    }));
    res.json(sidebarSessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET a specific chat session with its messages
exports.getSessionById = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const { id } = req.params;
    const doc = await db.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Session not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST create a new chat session
exports.createSession = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const { title, systemPrompt, messages } = req.body;
    const newSession = {
      title: title || 'New Conversation',
      systemPrompt: systemPrompt || 'You are a helpful assistant.',
      messages: messages || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await db.collection(COLLECTION_NAME).add(newSession);
    res.status(201).json({ id: docRef.id, ...newSession });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update a chat session (add messages, update title, update systemPrompt)
exports.updateSession = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    await db.collection(COLLECTION_NAME).doc(id).update(updateData);
    res.json({ id, ...updateData, message: 'Session updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE a chat session
exports.deleteSession = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const { id } = req.params;
    await db.collection(COLLECTION_NAME).doc(id).delete();
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET persistent user memory
exports.getMemory = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const doc = await db.collection('chat_memory').doc('global').get();
    if (!doc.exists) return res.json({ memory: '' });
    res.json({ memory: doc.data().memory || '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update persistent user memory
exports.updateMemory = async (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not initialized' });
  try {
    const { memory } = req.body;
    await db.collection('chat_memory').doc('global').set({
      memory,
      updatedAt: new Date().toISOString()
    });
    res.json({ message: 'Memory updated', memory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

// Define Gemini Tools
const agentTools = [{
  functionDeclarations: [
    {
      name: "create_task",
      description: "Buat tugas baru di halaman Tasks (Kanban Board).",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Judul tugas." },
          description: { type: SchemaType.STRING, description: "Deskripsi atau detail tugas." },
          status: { type: SchemaType.STRING, description: "Status tugas: 'todo', 'in_progress', atau 'done'." },
          deadline: { type: SchemaType.STRING, description: "Tanggal tenggat waktu format YYYY-MM-DD." }
        },
        required: ["title", "status"]
      }
    },
    {
      name: "delete_task",
      description: "Hapus sebuah tugas dari halaman Tasks berdasarkan ID.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          taskId: { type: SchemaType.STRING, description: "ID tugas yang akan dihapus." }
        },
        required: ["taskId"]
      }
    },
    {
      name: "list_tasks",
      description: "Ambil daftar semua tugas di halaman Tasks. Gunakan ini untuk mencari ID tugas sebelum menghapusnya.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    {
      name: "create_event",
      description: "Buat acara/jadwal baru di halaman Calendar.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING, description: "Judul acara." },
          description: { type: SchemaType.STRING, description: "Deskripsi acara." },
          date: { type: SchemaType.STRING, description: "Tanggal acara format YYYY-MM-DD." },
          label: { type: SchemaType.STRING, description: "Label acara (misal: 'Penting', 'Lainnya')." }
        },
        required: ["title", "date"]
      }
    },
    {
      name: "delete_event",
      description: "Hapus acara dari Calendar berdasarkan ID.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          eventId: { type: SchemaType.STRING, description: "ID acara yang akan dihapus." }
        },
        required: ["eventId"]
      }
    },
    {
      name: "list_events",
      description: "Ambil daftar semua acara di halaman Calendar.",
      parameters: { type: SchemaType.OBJECT, properties: {} }
    },
    {
      name: "update_permanent_memory",
      description: "Simpan fakta atau preferensi penting tentang pengguna ke memori permanen. LAKUKAN INI OTOMATIS jika mendapat info baru tentang pengguna.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          new_facts: { type: SchemaType.STRING, description: "Fakta/preferensi baru yang ditambahkan." }
        },
        required: ["new_facts"]
      }
    }
  ]
}];

async function handleFunctionCall(name, args) {
  if (!db) return { error: "Database not connected" };
  try {
    switch (name) {
      case "create_task": {
        const newTask = {
          title: args.title,
          description: args.description || '',
          status: args.status || 'todo',
          deadline: args.deadline || '',
          createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('tasks').add(newTask);
        return { success: true, taskId: docRef.id, message: "Task created." };
      }
      case "delete_task": {
        await db.collection('tasks').doc(args.taskId).delete();
        return { success: true, message: "Task deleted." };
      }
      case "list_tasks": {
        const snap = await db.collection('tasks').get();
        return { tasks: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
      }
      case "create_event": {
        const newEvent = {
          judul: args.title,
          deskripsi: args.description || '',
          tanggal: args.date,
          label: args.label || 'Lainnya',
          createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('calendar_events').add(newEvent);
        return { success: true, eventId: docRef.id, message: "Event created." };
      }
      case "delete_event": {
        await db.collection('calendar_events').doc(args.eventId).delete();
        return { success: true, message: "Event deleted." };
      }
      case "list_events": {
        const snap = await db.collection('calendar_events').get();
        return { events: snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) };
      }
      case "update_permanent_memory": {
        const memDoc = await db.collection('chat_memory').doc('global').get();
        let currentMem = memDoc.exists ? (memDoc.data().memory || '') : '';
        const updatedMem = currentMem ? `${currentMem}\n- ${args.new_facts}` : `- ${args.new_facts}`;
        await db.collection('chat_memory').doc('global').set({ memory: updatedMem, updatedAt: new Date().toISOString() });
        return { success: true, message: "Memory updated globally." };
      }
      default: return { error: "Function not found." };
    }
  } catch (error) { return { error: error.message }; }
}

// POST proxy to Pollinations.ai (No API Key — 100% Free & Unlimited)
exports.askAI = async (req, res) => {
  try {
    const { systemPrompt, messages } = req.body;

    if (!messages || messages.length === 0) return res.status(400).json({ error: 'No messages provided' });

    // Load Memory & RAG Context from Firebase
    let userMemory = '';
    let recentHistory = '';
    if (db) {
      try {
        const memDoc = await db.collection('chat_memory').doc('global').get();
        if (memDoc.exists) userMemory = memDoc.data().memory || '';

        const snap = await db.collection(COLLECTION_NAME).orderBy('updatedAt', 'desc').limit(3).get();
        const sessions = snap.docs.map(d => d.data());
        if (sessions.length > 0) {
          recentHistory = '\n\nRIWAYAT SESI BRAINSTORMING SEBELUMNYA:\n' + sessions.map(s => `- ${s.title}`).join('\n');
        }
      } catch (e) { console.error('Error fetching context:', e); }
    }

    const BASE_INSTRUCTION = `Kamu adalah asisten pribadi yang sangat cerdas, ramah, dan membantu. Jawablah secara natural dan santai.

ATURAN FORMAT (WAJIB):
- DILARANG menggunakan **teks tebal**, *miring*, ## judul, atau - poin bullet dengan tanda strip.
- Tulis dalam paragraf biasa saja.
- Tabel boleh digunakan jika perlu perbandingan data.

ATURAN BRAINSTORMING & DISKUSI:
Setiap kali pengguna meminta bantuan brainstorming atau mendiskusikan ide, ajukan 1-3 pertanyaan balikan di akhir jawabanmu untuk menggali informasi lebih dalam, agar hasil akhir yang kamu berikan lebih terstruktur dan maksimal.`
      + (userMemory ? `\n\nMEMORI PERMANEN PENGGUNA — SELALU INGAT:\n${userMemory}` : '')
      + (systemPrompt ? `\n\nKONTEKS SESI INI:\n${systemPrompt}` : '')
      + recentHistory;

    // Build messages array for Pollinations.ai
    const pollinationsMessages = [
      { role: 'system', content: BASE_INSTRUCTION },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }))
    ];

    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: pollinationsMessages,
        model: 'openai',
        seed: Math.floor(Math.random() * 10000),
        private: true
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Pollinations error:', errText);
      return res.status(500).json({ response: 'Maaf, server AI sedang sibuk. Coba lagi dalam beberapa detik.' });
    }

    const aiText = await response.text();
    res.json({ response: aiText || 'Maaf, tidak ada respon dari AI.' });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ response: 'Maaf, terjadi kesalahan. Coba lagi ya.' });
  }
};
