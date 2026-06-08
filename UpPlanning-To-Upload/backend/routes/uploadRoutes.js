const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.array('assetFiles', 20), uploadController.uploadFile);

module.exports = router;
