const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const Class = require('../models/Class');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensure this is included to load environment variables

// Endpoint to delete a notification
router.delete('/deleteNotification/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const notification = await Notification.findByIdAndDelete(id); // Delete notification by ID
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        return res.status(200).json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
// Configure your transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

router.post('/add-notification', async (req, res) => {
    const { title, content, by, email, type, malop } = req.body;
    console.log(req.body);

    // Validate required fields
    if (!title || !content || !by || !email || !type) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        // If malop is provided, send email to students in that class
        if (malop) {
            // Fetch the class details
            const classData = await Class.findOne({ _id: malop });
            console.log("Ma Lop :", classData);

            if (classData && classData.ThanhVienLop) {
                // Fetch email addresses of students in the class
                const students = await User.find({ _id: { $in: classData.ThanhVienLop } });
                const studentEmails = students.map(student => student.email);
                console.log("Students' Emails:", studentEmails);

                // Send email to each student
                const promises = studentEmails.map(email => {
                    return transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: title,
                        text: content,
                    });
                });

                await Promise.all(promises); // Wait for all emails to be sent
                return res.status(200).json({ success: true, message: 'Emails sent successfully.' });
            } else {
                return res.status(404).json({ success: false, message: 'Class not found or no students in the class.' });
            }
        }

        // If malop is not provided, save the notification
        const newNotification = new Notification({
            title,
            content,
            by,
            email,
        });
        await newNotification.save();

        return res.status(201).json({ success: true, message: 'Notification added successfully.' });
    } catch (error) {
        console.error('Error processing notification:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});
router.get('/getNoficationsAllSchool', async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }); // Fetch notifications, sorted by newest first
        return res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});
module.exports = router;
