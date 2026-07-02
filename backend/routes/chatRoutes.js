const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST proxy — ask the AI (server-side, bypasses Turnstile)
router.post('/ask-ai', chatController.askAI);

// GET user persistent memory
router.get('/memory/global', chatController.getMemory);

// PUT update user persistent memory
router.put('/memory/global', chatController.updateMemory);

// GET all chat sessions (for sidebar list)
router.get('/', chatController.getSessions);

// GET a specific chat session (to load chat history)
router.get('/:id', chatController.getSessionById);

// POST a new chat session
router.post('/', chatController.createSession);

// PUT (update) a chat session (append messages, change settings)
router.put('/:id', chatController.updateSession);

// DELETE a chat session
router.delete('/:id', chatController.deleteSession);

module.exports = router;
