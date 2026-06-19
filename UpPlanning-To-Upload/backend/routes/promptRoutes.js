const express = require('express');
const router = express.Router();
const promptController = require('../controllers/promptController');

router.get('/', promptController.getPrompts);
router.post('/', promptController.createPrompt);
router.put('/:id', promptController.updatePrompt);
router.delete('/:id', promptController.deletePrompt);

module.exports = router;
