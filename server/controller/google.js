const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/UserAuthSocial');
const router = express.Router();
require('dotenv').config();

// Set up Passport for Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        if (!profile.id) {
            return done(new Error("No user ID found from Google."), null);
        }

        // Check if the user already exists
        let user = await User.findOne({ id_User: profile.id, provider: 'google' });
        if (!user) {
            console.log('Adding new user to DB...');

            // Generate public and private keys
            const keyPublic = crypto.randomBytes(16).toString('hex');
            const keyPrivate = crypto.randomBytes(16).toString('hex');

            // Get email or use default
            const email = (profile.emails && profile.emails.length > 0) 
            ? profile.emails[0].value 
            : 'defaultemail@mail.com';



            // Create access and refresh tokens
            const tokenAccess = jwt.sign({ id: profile.id }, keyPublic, { expiresIn: '15m' });
            const tokenRefresh = jwt.sign({ id: profile.id }, keyPrivate, { expiresIn: '7d' });

            // Create new user object
            user = new User({
                id_User: profile.id, // Set the Google user ID
                email: email,
                TokenAcess: tokenAccess,
                TokenRefress: tokenRefresh,
                KeyPublic: keyPublic,
                KeyPrivate: keyPrivate,
                provider: 'google',
                accountId:profile.id,
            });
            console.log(user);
            
            // Save the user to the database
            await user.save();
        } else {
            console.log('User already exists in DB.');
        }

        return done(null, user);
    } catch (error) {
        console.error('Error during authentication:', error);
        return done(error, null);
    }
}));

// Route for Google login
router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route from Google
router.get('/callback',
    passport.authenticate('google', { failureRedirect: '/auth/google/error' }),
    (req, res) => {
        // Success, redirect to success page
        res.redirect('/auth/google/success');
    });

// Route for successful login
router.get('/success', (req, res) => {
    const userInfo = req.user;
    console.log('User Info:', userInfo); // Thêm dòng log này
    res.render('google-success', { user: userInfo });
});


// Route for login failure
router.get('/error', (req, res) => {
    res.send('Google login failed.');
});

// Route for logout
router.get('/signout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(400).send('Error logging out');
        res.redirect('/');
    });
});

module.exports = router;
