const express = require('express');
const router = express.Router();
const Class = require('../models/Class'); // Giả sử bạn lưu schema Class trong models/Class.js

// API để cập nhật lịch thi cho một lớp học
const mongoose = require('mongoose');

router.post('/updateExamSchedule', async (req, res) => {
    try {
        const { MaLop, LichThi, PhongThi, GioBatDau, Phut } = req.body;

        // Log the request data for testing
        console.log('Received data:', req.body);

        // Ensure MaLop is provided
        if (!MaLop) {
            return res.status(400).json({ message: 'Missing MaLop' });
        }

        // Validate and convert MaLop to ObjectId if necessary
        let objectIdMaLop;
        if (mongoose.Types.ObjectId.isValid(MaLop)) {
            objectIdMaLop = new mongoose.Types.ObjectId(MaLop); // Use 'new' to instantiate ObjectId
        } else {
            return res.status(400).json({ message: 'Invalid MaLop format' });
        }

        // Find and update the class by ObjectId
        const updatedClass = await Class.findOneAndUpdate(
            { _id: objectIdMaLop }, // Ensure correct field '_id' for MongoDB ObjectId
            { LichThi, PhongThi, GioBatDau, Phut },
            { new: true } // Return the updated document
        );

        // If the class is not found
        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        // Successfully updated
        res.status(200).json({ message: 'Exam schedule updated successfully.', updatedClass });
    } catch (error) {
        console.error('Error updating exam schedule:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});




module.exports = router;
