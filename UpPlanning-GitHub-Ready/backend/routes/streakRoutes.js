const express = require('express');
const router = express.Router();
const streakController = require('../controllers/streakController');

router.get('/', streakController.getStreak);
router.post('/record', streakController.recordActivity);

module.exports = router;
