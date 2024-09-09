const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
require('../middleware/passportGoogle');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        // Successful authentication
        const token = req.user.token;
        res.redirect(`http://localhost:3000/dashboard?token=${token}`);
    });

// Failure route for debugging
router.get('/auth/failure', (req, res) => {
    res.send('Google authentication failed');
});

router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Please provide all the entries.' });
    }

    // Check if Password and confirm Password are same
    if (password != confirmPassword) {
        return res.status(400).json({ message: 'Password is not same as Confirm Password.' });
    }

    // to check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists.' });
    }

    // Hashing the password and hence saving User
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ firstName, lastName, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
});

// Login Validation
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    // Checking if user exists and password is correct
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid Email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid Email or Password.' });
    }

    // Generate JWT and send it  back
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
});

module.exports = router;