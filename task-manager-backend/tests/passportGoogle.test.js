const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

jest.mock('../models/User');

describe('Passport Google Strategy', () => {
    it('should initialize Google Strategy', () => {
        require('../middleware/passportGoogle'); // This triggers the GoogleStrategy configuration

        expect(passport.use).toHaveBeenCalledWith(expect.any(GoogleStrategy));
    });

    it('should find an existing user or create a new user', async () => {
        const done = jest.fn();

        const mockProfile = {
            id: 'googleId123',
            displayName: 'Test User',
            emails: [{ value: 'user@example.com' }]
        };

        User.findOne.mockResolvedValue(null); // Simulate new user case
        User.create.mockResolvedValue({ id: 'newUserId' });

        const strategy = new GoogleStrategy({}, (accessToken, refreshToken, profile, done) => {
            User.findOne({ googleId: profile.id }).then((existingUser) => {
                if (existingUser) {
                    return done(null, existingUser);
                } else {
                    User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        name: profile.displayName
                    }).then((newUser) => done(null, newUser));
                }
            });
        });

        await strategy.userProfile(null, null, mockProfile, done);
        expect(done).toHaveBeenCalledWith(null, { id: 'newUserId' });
    });
});
