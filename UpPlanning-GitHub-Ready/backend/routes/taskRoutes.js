const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// GET all tasks
router.get('/', taskController.getTasks);

// POST a new task
router.post('/', taskController.createTask);

// PUT (update) a task (e.g. status or details)
router.put('/:id', taskController.updateTask);

// DELETE a task
router.delete('/:id', taskController.deleteTask);

module.exports = router;
