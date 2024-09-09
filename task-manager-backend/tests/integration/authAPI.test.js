const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

jest.mock('../models/User');
jest.mock('bcryptjs');

describe('Auth API Integration Test', () => {
    it('should log in with valid credentials', async () => {
        const mockUser = { email: 'user@example.com', password: 'hashedPassword' };
        User.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@example.com', password: 'password123' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
        User.findOne.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'user@example.com', password: 'wrongpassword' });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('Invalid email or password');
    });
});
