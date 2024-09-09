// __tests__/tasks.test.js
const request = require('supertest');
const express = require('express');
const Task = require('../models/Task');
const { authMiddleware } = require('../middleware/auth');
const taskRoutes = require('../routes/taskRoutes'); // Adjust path if needed

jest.mock('../models/Task');
jest.mock('../middleware/auth');

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

describe('Task Routes', () => {
    beforeEach(() => {
        authMiddleware.mockImplementation((req, res, next) => {
            req.user = { userId: 'userId' }; // Mock authenticated user
            next();
        });
    });

    // Test for creating a task
    it('should create a new task', async () => {
        const mockSave = jest.fn();
        Task.mockImplementation(() => ({ save: mockSave }));

        const res = await request(app)
            .post('/api/tasks')
            .send({
                title: 'Task 1',
                description: 'Sample task',
                column: 'To Do',
            });

        expect(res.statusCode).toBe(201);
        expect(mockSave).toHaveBeenCalled();
    });

    // Test for creating a task with missing column
    it('should return 400 if column is missing', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({
                title: 'Task 1',
                description: 'Sample task',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Column is required.');
    });

    // Test for fetching tasks for the logged-in user
    it('should fetch all tasks for the logged-in user', async () => {
        const tasks = [{ title: 'Task 1', description: 'Sample task', column: 'To Do', userId: 'userId' }];
        Task.find.mockResolvedValue(tasks);

        const res = await request(app).get('/api/tasks');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(tasks);
    });

    // Test for updating a task
    it('should update a task for the logged-in user', async () => {
        const updatedTask = { title: 'Task 1', description: 'Updated task', column: 'In Progress' };
        Task.findOneAndUpdate.mockResolvedValue(updatedTask);

        const res = await request(app)
            .put('/api/tasks/taskId')
            .send({ description: 'Updated task', column: 'In Progress' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(updatedTask);
    });

    // Test for deleting a task
    it('should delete a task for the logged-in user', async () => {
        Task.findOneAndDelete.mockResolvedValue({ _id: 'taskId' });

        const res = await request(app).delete('/api/tasks/taskId');

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Task deleted successfully.');
    });
});
