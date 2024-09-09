const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy
const User = require('../models/User');
const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Find or create a user in your database
        const existingUser = await User.findOne({ email: profile.emails[0].value });
        // const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
            const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return done(null, { token });
        }

        // If user doesn't exist, create a new user
        const newUser = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
        });

        await newUser.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return done(null, { user, token });
    } catch (error) {
        return done(error, false);
    }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));