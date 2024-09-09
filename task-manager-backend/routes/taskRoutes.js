const express = require('express');
const Task = require('../models/Task'); // Assuming Task model is defined
const { authMiddleware } = require('../middleware/auth'); // Assuming JWT middleware
const router = express.Router();

// 1. Create a new task (POST /tasks)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, column } = req.body;
        // Basic validation
        if (!title) {
            return res.status(400).json({ message: 'Title is required.' });
        }

        const task = new Task({
            title,
            description,
            column,
            userId: req.user.userId, // Assuming userId is available in the token
            createdAt: new Date(),
        });

        await task.save();
        res.status(201).json(task); // Send back the created task
    } catch (err) {
        res.status(500).json({ message: 'Server error while creating task.', error: err.message });
    }
});

// 2. Get all tasks for the logged-in user (GET /tasks)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.userId }); // Fetch tasks for the logged-in user
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching tasks.', error: err.message });
    }
});

// 3. Update an existing task (PUT /tasks/:id)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, column } = req.body;

        if (!description && !title) {
            return res.status(400).json({ message: 'Description is required' });
        }

        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, userId: req.user.userId },
            { title, description, column },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found or you do not have permission to update it.' });
        }

        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(500).json({ message: 'Error updating task.', error: err.message });
    }
});

// 4. Delete a task (DELETE /tasks/:id)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const task = await Task.findOneAndDelete({ _id: id, userId: req.user.userId }); // Only allow the owner to delete

        if (!task) {
            return res.status(404).json({ message: 'Task not found or you do not have permission to delete it.' });
        }

        res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting task.', error: err.message });
    }
});

module.exports = router;
