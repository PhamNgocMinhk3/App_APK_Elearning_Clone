const express = require('express');
const router = express.Router();
const Payment = require('../models/payment'); // Đảm bảo rằng đường dẫn đúng

router.post('/savePayment', async (req, res) => {
    const { userId, subject, amount, Malop } = req.body; // Lấy thêm Malop từ body
    console.log('Received Malop:', req.body.Malop); // Log Malop nhận được từ client

    const payment = new Payment({
        userId,
        subject,
        amount,
        timestamp: new Date(),
        Malop, // Thêm mã lớp vào đối tượng thanh toán
    });

    try {
        await payment.save();
        res.status(201).json({ success: true, message: 'Payment saved successfully' });
    } catch (error) {
        console.error('Error saving payment:', error);
        res.status(500).json({ success: false, message: 'Error saving payment' });
    }
});
// 1. API Lấy tất cả dữ liệu thanh toán cho người dùng
router.get('/getAllPayments/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const payments = await Payment.find({ userId: userId });
        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ success: false, message: 'Error fetching payments' });
    }
});
router.get('/getAllPayments', async (req, res) => {
    try {
        const payments = await Payment.find(); // Fetch all payments without filtering by userId
        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ success: false, message: 'Error fetching payments' });
    }
});

// 2. API Lấy tất cả dữ liệu thanh toán với điều kiện tình trạng = 1
router.get('/getPaymentsByStatus/:userId', async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const payments = await Payment.find({ userId: userId, tinhtrang: '1' }); // Chú ý điều kiện tình trạng
        res.status(200).json({ success: true, data: payments });
    } catch (error) {
        console.error('Error fetching payments by status:', error);
        res.status(500).json({ success: false, message: 'Error fetching payments by status' });
    }
});

// 3. API Cập nhật tình trạng thanh toán theo _id
router.put('/updatePaymentStatus/:id', async (req, res) => {
    const paymentId = req.params.id;
    const { tinhtrang } = req.body; // Lấy tình trạng từ body

    try {
        const updatedPayment = await Payment.findByIdAndUpdate(paymentId, { tinhtrang: tinhtrang }, { new: true });
        
        if (!updatedPayment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        res.status(200).json({ success: true, data: updatedPayment });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ success: false, message: 'Error updating payment status' });
    }
});
router.delete('/deletePayment/:id', async (req, res) => {
    const paymentId = req.params.id;

    try {
        const deletedPayment = await Payment.findByIdAndDelete(paymentId);
        
        if (!deletedPayment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        res.status(200).json({ success: true, message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ success: false, message: 'Error deleting payment' });
    }
});

module.exports = router;
