const express = require('express');
const mongoose = require('mongoose');
const Class = require('../models/Class'); // Model Class
const router = express.Router();
const User = require('../models/User');

// Get all classes
router.get('/classes', async (req, res) => {
    try {
        const classes = await Class.find();
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all classes for a specific teacher
router.get('/classes/:teacherId', async (req, res) => {
    try {
        const classes = await Class.find({ MaGV: req.params.teacherId });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new class
router.post('/classes', async (req, res) => {
    const { 
        MaGV, 
        TenMH, 
        SiSoLop, 
        ThanhVienLop, 
        MaNganh, 
        SoTietHoc, 
        ThoiGianHoc, 
        BuoiHoc, 
        NgayBatDau, 
        Thu, 
        GiaTien, 
        PhongHoc 
    } = req.body;

    console.log(req.body);

    try {
        // Convert NgayBatDau to a Date object
        const formattedDate = new Date(NgayBatDau.split('-').reverse().join('-'));

        const newClass = new Class({
            MaGV, 
            TenMH, 
            SiSoLop, 
            ThanhVienLop, 
            MaNganh, 
            SoTietHoc, 
            ThoiGianHoc, 
            BuoiHoc, 
            NgayBatDau: formattedDate, // Use the formatted date
            Thu,
            GiaTien,
            PhongHoc
        });

        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        console.error('Error saving class:', err); // More detailed logging
        res.status(400).json({ error: err.message });
    }
});

// Update a class
router.put('/classes/:id', async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedClass);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a class
router.delete('/classes/:id', async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.json({ message: 'Class deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register a user to a class
router.patch('/:id/register', async (req, res) => {
    const { userId } = req.body; // Ensure userId is being sent in the request body
    try {
        const updatedClass = await Class.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { ThanhVienLop: userId } }, // Add userId to ThanhVienLop
            { new: true }
        );
        res.status(200).json(updatedClass);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật lớp học', error: error.message });
    }
});

// Remove a user from a class
router.patch('/:id/remove', async (req, res) => {
    const { userId } = req.body; // Ensure userId is being sent in the request body
    try {
        const updatedClass = await Class.findByIdAndUpdate(
            req.params.id,
            { $pull: { ThanhVienLop: userId } }, // Remove userId from ThanhVienLop
            { new: true }
        );
        res.status(200).json(updatedClass);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật lớp học', error: error.message });
    }
});

// Get classes registered by a specific student
router.get('/student/:userId/classes', async (req, res) => {
    try {
        const classes = await Class.find({ ThanhVienLop: req.params.userId });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/getSchedule', async (req, res) => {
    const { id_user } = req.body; // Lấy id_user từ yêu cầu
    if (!id_user) {
        return res.status(400).json({ message: 'id_user không được cung cấp' });
    }
    try {
        // Tìm tất cả các lớp mà học sinh có id_user là thành viên
        const classes = await Class.find({ ThanhVienLop: id_user });

        if (classes.length === 0) {
            return res.status(404).json({ message: 'Không có lớp nào cho học sinh này' });
        }

        // Trả về thông tin các lớp
        const schedule = classes.map(classInfo => ({
            tenmh: classInfo.TenMH,          
            magv: classInfo.MaGV,            
            SoTietHoc: classInfo.SoTietHoc,
            ThoiGianHoc: classInfo.ThoiGianHoc,
            NgayBatDau: classInfo.NgayBatDau,
            Thu:classInfo.Thu,
            Gia:classInfo.GiaTien,
            Malop:classInfo._id,
            ThanhVienLop:classInfo.ThanhVienLop,
            BuoiHoc:classInfo.BuoiHoc,
            PhongHoc: classInfo.PhongHoc // Thêm PhongHoc vào đây
        }));
        return res.status(200).json(schedule);
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error });
    }
});
router.post('/getStudent/teacher', async (req, res) => {
    const { classId } = req.body; // Lấy id_user từ yêu cầu
    if (!classId) {
        return res.status(400).json({ message: 'classId không được cung cấp' });
    }
    try {
        // Tìm tất cả các lớp mà học sinh có classId là thành viên
        const classes = await Class.find({ _id: classId });

        if (classes.length === 0) {
            return res.status(404).json({ message: 'Không có lấy được lớp' });
        }
        // Trả về thông tin các lớp
        const schedule = classes.map(classInfo => ({
            tenmh: classInfo.TenMH,          
            magv: classInfo.MaGV,            
            SoTietHoc: classInfo.SoTietHoc,
            ThoiGianHoc: classInfo.ThoiGianHoc,
            NgayBatDau: classInfo.NgayBatDau,
            Thu:classInfo.Thu,
            Gia:classInfo.GiaTien,
            Malop:classInfo._id,
            ThanhVienLop:classInfo.ThanhVienLop,
            BuoiHoc:classInfo.BuoiHoc,
            PhongHoc: classInfo.PhongHoc // Thêm PhongHoc vào đây
        }));
        return res.status(200).json(schedule);
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error });
    }
});
router.post('/getSchedule/teacher', async (req, res) => {
    const { id_user } = req.body; // Lấy id_user từ yêu cầu
    if (!id_user) {
        return res.status(400).json({ message: 'id_user không được cung cấp' });
    }
    try {
        // Tìm tất cả các lớp mà học sinh có id_user là thành viên
        const classes = await Class.find({ MaGV: id_user });

        if (classes.length === 0) {
            return res.status(404).json({ message: 'Không có lớp nào cho học sinh này' });
        }

        // Trả về thông tin các lớp
        const schedule = classes.map(classInfo => ({
            tenmh: classInfo.TenMH,          
            magv: classInfo.MaGV,            
            SoTietHoc: classInfo.SoTietHoc,
            ThoiGianHoc: classInfo.ThoiGianHoc,
            NgayBatDau: classInfo.NgayBatDau,
            Thu:classInfo.Thu,
            Gia:classInfo.GiaTien,
            Malop:classInfo._id,
            ThanhVienLop:classInfo.ThanhVienLop,
            BuoiHoc:classInfo.BuoiHoc,
            PhongHoc: classInfo.PhongHoc // Thêm PhongHoc vào đây
        }));
        return res.status(200).json(schedule);
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error });
    }
});
router.get('/exam-schedule/:studentId', async (req, res) => {
    const { studentId } = req.params;

    try {
        const classes = await Class.find({
            LichThi: { $exists: true }, // Kiểm tra lịch thi có tồn tại
            ThanhVienLop: studentId // So sánh ID sinh viên
        }).select('TenMH LichThi PhongThi GioBatDau Phut');

        res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching exam schedule' });
    }
});
module.exports = router;
