const mongoose = require('mongoose');
const ClassSchema = new mongoose.Schema({
    MaGV: { type: String, required: true }, 
    TenMH: { type: String, required: true }, 
    SiSoLop: { type: Number }, 
    ThanhVienLop: Array, 
    MaNganh: { type: String }, 
    SoTietHoc: { type: Number, default: 60 },
    ThoiGianHoc: [{ type: String }], 
    BuoiHoc: { type: String, enum: ['Sáng', 'Trưa', 'Chiều-Tối'] }, 
    NgayBatDau: { type: Date }, 
    Thu:{type: String },
    GiaTien:{type: Number},
    LichThi:{type:Date}, 
    PhongThi:{type: String},
    GioBatDau:{type: String},
    Phut:{type: String}, 
    PhongHoc:{type:String}//mới update nè
});

module.exports = mongoose.model('Class', ClassSchema);
