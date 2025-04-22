const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer'); // Import multer
const router = express.Router();
const User = require('../models/User');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the destination folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`); // Use a timestamp for unique file names
    }
});

const upload = multer({ storage }); // Create the upload middleware
router.get('/api/instructors', async (req, res) => {
    try {
        const instructors = await User.find({ level: 2 });
        res.json(instructors);
    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
});
router.get('/alluser', async (req, res) => {
    try {
        const instructors = await User.find({ level: 1 });
        res.json(instructors);
    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
});
// Middleware to find user by ID from the database
async function findUserById(req, res, next) {
    const { userId } = req.params;
    console.log(userId);
    
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// **1. Get Student Information**
router.get('/profile/:userId', findUserById, async (req, res) => {
    // Return the complete user profile (including sensitive data)
    const { user } = req;
    // console.log(user);
    // console.log(user);
    
    res.status(200).json({
        email: user.email,
        name: user.name,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        atmNumber: user.atmNumber,
        description: user.description,
        level: user.level,
        diemTrungBinh: user.diemTrungBinh,
        avatar: user.avatar,
        residence: user.residence,
        cccd: user.cccd,
        major: user.major,
        systemAffiliation: user.systemAffiliation
    });
});

// **2. Update Student Information**
router.put('/profile/:userId', upload.single('avatar'), findUserById, async (req, res) => {
    const { user } = req;
    const {
        name, dateOfBirth, phoneNumber, atmNumber, description, level,
        residence, cccd, major
    } = req.body;
    console.log(req.body);
    
    // Update user fields
    user.name = name || user.name;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.atmNumber = atmNumber || user.atmNumber;
    user.description = description || user.description;
    user.level = level || user.level;
    user.avatar = req.file ? req.file.path : user.avatar; // Save the image path
    user.residence = residence || user.residence;
    user.cccd = cccd || user.cccd;
    user.major = major || user.major;

    try {
        await user.save();
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PATCH /classes/:id/remove


module.exports = router;
