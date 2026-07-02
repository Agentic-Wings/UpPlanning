const express = require('express');
const router = express.Router();
const drawingController = require('../controllers/drawingController');

router.get('/', drawingController.getDrawings);
router.get('/:id', drawingController.getDrawing);
router.post('/', drawingController.createDrawing);
router.put('/:id', drawingController.updateDrawing);
router.delete('/:id', drawingController.deleteDrawing);

module.exports = router;
