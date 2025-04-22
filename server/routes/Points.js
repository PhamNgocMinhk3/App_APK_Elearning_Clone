// routes/points.js
const express = require('express');
const router = express.Router();
const Point = require('../models/Points'); // Đảm bảo rằng đường dẫn đúng
const User = require('../models/User'); // Giả định có model User

// API lưu điểm

router.post('/saveGrades', async (req, res) => {
    const { grades, classId } = req.body; // Get classId along with grades
    console.log("data điểm từ server :", grades);
    try {
        for (const studentId in grades) {
            const studentGrades = grades[studentId];

            // Thông tin tên và email từ grades
            const TenSV = studentGrades.TenSV;
            const EmailSV = studentGrades.EmailSV;

            // Kiểm tra xem đã có điểm cho sinh viên chưa
            const existingPoint = await Point.findOne({ studentId, MaLop: classId }); // Find by studentId and classId

            if (existingPoint) {
                // Nếu đã có, cập nhật điểm
                existingPoint.Diem1 = studentGrades.Diem1;
                existingPoint.Diem2 = studentGrades.Diem2;
                existingPoint.Diem3 = studentGrades.Diem3;
                existingPoint.Diem4 = studentGrades.Diem4;
                existingPoint.Diem5 = studentGrades.Diem5;
                existingPoint.Diem6 = studentGrades.Diem6;
                existingPoint.Diem7 = studentGrades.Diem7;
                // Cập nhật tên và email nếu cần
                existingPoint.TenSV = TenSV;
                existingPoint.EmailSV = EmailSV;
                await existingPoint.save();
            } else {
                // Nếu chưa có, tạo mới
                const newPoint = new Point({
                    MaLop: classId, // Save classId (MaLop)
                    studentId,
                    TenSV, // Lưu tên sinh viên
                    EmailSV, // Lưu email sinh viên
                    Diem1: studentGrades.Diem1,
                    Diem2: studentGrades.Diem2,
                    Diem3: studentGrades.Diem3,
                    Diem4: studentGrades.Diem4,
                    Diem5: studentGrades.Diem5,
                    Diem6: studentGrades.Diem6,
                    Diem7: studentGrades.Diem7,
                });
                await newPoint.save();
            }
        }
        res.status(200).json({ message: 'Điểm đã được lưu thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lưu điểm.', error });
    }
});

router.post('/getGrades', async (req, res) => {
    const { studentIds } = req.body; // Expecting an array of student IDs
    try {
        // Fetch grades for the given student IDs
        const grades = await Point.find({ studentId: { $in: studentIds } });
        res.status(200).json(grades);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy điểm.', error });
    }
});

// Hàm để lấy thông tin sinh viên
const getStudentInfo = async (studentId) => {
    // Lấy thông tin sinh viên từ database
    const user = await User.findById(studentId); // Sử dụng model User để tìm thông tin
    if (!user) {
        throw new Error('Sinh viên không tồn tại');
    }
    return {
        TenSV: user.TenSV,
        EmailSV: user.EmailSV
    };
};

module.exports = router;
