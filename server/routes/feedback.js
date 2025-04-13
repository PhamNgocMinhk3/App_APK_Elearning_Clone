// In your server code (e.g., server.js or routes.js)
const express = require('express');
const nodemailer = require('nodemailer'); // Make sure to install nodemailer
const router = express.Router();

router.post('/send-feedback', async (req, res) => {
    const { name, phoneNumber, email, content } = req.body;
    console.log( req.body);
    
    // Create a transporter object using SMTP settings
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or your email service provider
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Email options
    const mailOptions = {
        from: email,
        to: 'phamngocminhit2k3@gmail.com', // Recipient email
        subject: `${name} muốn giửi cho bạn một số phản hồi về các vấn đề`,
        text: `
            Tên người giửi phản hồi: ${name}
            Số điện thoại: ${phoneNumber}
            Email người giửi phản hồi: ${email}

            Nội Dung Phản Hồi:
            ${content}
        `,
    };

    // Send email
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Feedback sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send feedback' });
    }
});

module.exports = router;
