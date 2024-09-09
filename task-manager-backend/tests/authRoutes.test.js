// __tests__/auth.test.js
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const authRoutes = require('../routes/authRoutes'); // Adjust path if needed

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/User');
jest.mock('passport');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
    // Test for Google OAuth Redirect
    it('should redirect to Google for authentication', async () => {
        passport.authenticate.mockImplementationOnce(() => (req, res, next) => next());
        const res = await request(app).get('/api/auth/google');
        expect(res.statusCode).toBe(302); // Expecting a redirect
    });

    // Test for Google Callback
    it('should handle Google OAuth callback and redirect with token', async () => {
        const token = 'sampleToken';
        passport.authenticate.mockImplementationOnce((strategy, options) => (req, res, next) => {
            req.user = { token };
            next();
        });

        const res = await request(app).get('/api/auth/google/callback');
        expect(res.statusCode).toBe(302); // Expecting a redirect
        expect(res.header.location).toContain(`http://localhost:3000/dashboard?token=${token}`);
    });

    // Test for signup
    it('should register a new user', async () => {
        User.findOne.mockResolvedValue(null); // No user exists
        bcrypt.hash.mockResolvedValue('hashedPassword');
        const mockSave = jest.fn();
        User.mockImplementation(() => ({ save: mockSave }));

        const res = await request(app)
            .post('/api/auth/signup')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('User registered successfully');
        expect(mockSave).toHaveBeenCalled();
    });

    // Test for login with valid credentials
    it('should log in a user with valid credentials', async () => {
        const user = { _id: 'userId', password: 'hashedPassword' };
        User.findOne.mockResolvedValue(user);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('jwtToken');

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'john@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBe('jwtToken');
    });

    // Test for login with invalid credentials
    it('should return 400 for invalid login credentials', async () => {
        User.findOne.mockResolvedValue(null); // No user found

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'invalid@example.com',
                password: 'wrongpassword',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('Invalid Email or password');
    });
});
