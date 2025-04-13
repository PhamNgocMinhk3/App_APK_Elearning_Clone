// models/PermissionForm.js
const mongoose = require('mongoose');

const permissionFormSchema = new mongoose.Schema({
    maSV: { type: String, required: true },
    tenSV: { type: String, required: true },
    email: { type: String, required: true },
    noiDungDon: { type: String, required: true },
    hinhThucDon: { type: String, required: true }, // Dropdown: Đơn xin nghỉ học, etc.
    ngayLapDon: { type: Date, default: Date.now },
    tinhTrang: { type: Number, default: 0 } // 0: Pending, 1: Approved
});

module.exports = mongoose.model('PermissionForm', permissionFormSchema);
