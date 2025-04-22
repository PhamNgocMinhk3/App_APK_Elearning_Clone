const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const User = require('../models/UserAuthSocial');
const router = express.Router();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// Thiết lập Passport cho Facebook
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'emails'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Ensure profile.id exists
        if (!profile.id) {
          return done(new Error('Invalid Facebook profile ID'), null);
        }
        // Check for user in the database
        let user = await User.findOne({ id_User: profile.id, provider: 'facebook' });
        if (!user) {
          console.log('Thêm người dùng mới vào DB...');
          // Generate public and private keys
          const keyPublic = crypto.randomBytes(16).toString('hex');
          const keyPrivate = crypto.randomBytes(16).toString('hex');
          // Set default email if missing
          const email = (profile.emails && profile.emails[0].value) 
                        ? profile.emails[0].value 
                        : 'writeemail@gmail.com';
          // Generate access and refresh tokens
          const tokenAccess = jwt.sign({ id: profile.id }, keyPublic, { expiresIn: '15m' });
          const tokenRefresh = jwt.sign({ id: profile.id }, keyPrivate, { expiresIn: '7d' });
          // Ensure userId is not null before saving
          user = new User({
            id_User: profile.id,
            name: profile.displayName,
            email: email,
            TokenAcess: tokenAccess,
            TokenRefress: tokenRefresh,
            KeyPublic: keyPublic,
            KeyPrivate: keyPrivate,
            HistoryToken: [],
            provider: 'facebook',
          });

          if (!user.id_User) {
            throw new Error('Cannot save user without id_User.');
          }

          await user.save(); // Save the user
        } else {
          console.log('Người dùng đã tồn tại trong DB.');
        }
        return done(null, user);
      } catch (error) {
        console.error('Error while saving user:', error);
        return done(error, null);
      }
    }
  )
);



// Route đăng nhập qua Facebook
router.get('/', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

// Callback từ Facebook
router.get(
  '/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/facebook/error' }),
  (req, res) => {
    // Thành công, chuyển hướng tới trang success
    res.redirect('/auth/facebook/success');
  }
);

// Route đăng nhập thành công
router.get('/success', (req, res) => {
  const userInfo = req.user;
  res.render('fb-github-success', { user: userInfo });
});

// Route đăng nhập thất bại
router.get('/error', (req, res) => {
  res.send('Đăng nhập Facebook thất bại.');
});

// Route đăng xuất
router.get('/signout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(400).send('Lỗi khi đăng xuất');
    res.redirect('/');
  });
});

module.exports = router;
