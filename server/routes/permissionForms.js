const express = require('express');
const router = express.Router();
const PermissionForm = require('../models/PermissionForm');

// Add new permission form
router.post('/add', async (req, res) => {
    const { maSV, tenSV, email, noiDungDon, hinhThucDon } = req.body;

    try {
        const newForm = new PermissionForm({ maSV, tenSV, email, noiDungDon, hinhThucDon, status: 0 }); // Initial status as Pending
        await newForm.save();
        res.status(201).json({ success: true, form: newForm });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating form', error });
    }
});

// Get all permission forms for a specific student
router.get('/student/:id', async (req, res) => {
    try {
        const forms = await PermissionForm.find({ maSV: req.params.id });
        res.status(200).json({ success: true, forms });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching forms', error });
    }
});

// Approve or reject permission form

router.put('/approve/:id/:status', async (req, res) => {
    const { id, status } = req.params; // Expecting status as a URL parameter (1 for rejected, 2 for approved)
    console.log(req.params);
    try {
        const updatedForm = await PermissionForm.findByIdAndUpdate(
            id,
            { tinhTrang: status }, // Update status directly
            { new: true } // Return the updated document
        );

        if (!updatedForm) {
            return res.status(404).json({ success: false, message: 'Form not found' });
        }

        res.status(200).json({ success: true, message: 'Application status updated successfully', form: updatedForm });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});


// Delete permission form by ID
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedForm = await PermissionForm.findByIdAndDelete(id);
        if (!deletedForm) {
            return res.status(404).json({ success: false, message: 'Form not found' });
        }
        res.status(200).json({ success: true, message: 'Form deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting form', error });
    }
});

module.exports = router;
