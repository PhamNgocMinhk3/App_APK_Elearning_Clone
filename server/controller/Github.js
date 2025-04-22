    const passport = require('passport');
    const GitHubStrategy = require('passport-github2').Strategy;
    const express = require('express');
    const User = require('../models/UserAuthSocial');
    const router = express.Router();
    const crypto = require('crypto');
    const jwt = require('jsonwebtoken');
    require('dotenv').config();
    // Thiết lập Passport cho GitHub
    passport.use(
        new GitHubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: process.env.GITHUB_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    if (!profile.id) {
                        return done(new Error('Invalid GitHub profile ID'), null);
                    }
    
                    let user = await User.findOne({ id_User: profile.id, provider: 'github' });
                    if (!user) {
                        console.log('Thêm người dùng mới vào DB...');
    
                        const keyPublic = crypto.randomBytes(16).toString('hex');
                        const keyPrivate = crypto.randomBytes(16).toString('hex');
    
                        const email = (profile.emails && profile.emails.length > 0) 
                                        ? profile.emails[0].value 
                                        : 'writeemail@mail.com';
    
                        const tokenAccess = jwt.sign({ id: profile.id }, keyPublic, { expiresIn: '15m' });
                        const tokenRefresh = jwt.sign({ id: profile.id }, keyPrivate, { expiresIn: '7d' });
    
                        // Ensure userId is set properly
                        user = new User({
                            id_User: profile.id,
                            email: email,
                            TokenAcess: tokenAccess,
                            TokenRefress: tokenRefresh,
                            KeyPublic: keyPublic,
                            KeyPrivate: keyPrivate,
                            HistoryToken: [],
                            provider: 'github',
                            accountId:profile.id,
                        });
    
                        console.log(user);
                        
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
    
    // Route đăng nhập qua GitHub
    router.get('/', passport.authenticate('github', { scope: ['user:email'] }));

    // Callback từ GitHub
    router.get(
        '/callback',
        (req, res, next) => {
            console.log(`Callback URL hit: ${req.url}`); // Log the callback URL
            next();
        },
        passport.authenticate('github', { failureRedirect: '/auth/github/error' }),
        (req, res) => {
            // Thành công, chuyển hướng tới trang success
            res.redirect('com.minhdepzaii.authcontextlogin://home');
        }
    );

        // Route đăng nhập thành công
    router.get('/success', (req, res) => {
        const userInfo = req.user;
        res.render('fb-github-success', { user: userInfo });
    });


    // Route đăng nhập thất bại
    router.get('/error', (req, res) => {
    res.send('Đăng nhập GitHub thất bại.');
    });

    // Route đăng xuất
    router.get('/signout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(400).send('Lỗi khi đăng xuất');
    res.redirect('/');
    });
    });

    module.exports = router;
