// models/Point.js
const mongoose = require('mongoose');
const { type } = require('os');
const pointSchema = new mongoose.Schema({
    MaLop:{type : String},
    studentId: {
        type: String,
        required: true,
    },
    TenSV: {
        type: String, 
    },
    EmailSV: {
        type: String,
    },
    Diem1:{type:Number},
    Diem2:{type:Number},
    Diem3:{type:Number},
    Diem4:{type:Number},
    Diem5:{type:Number},
    Diem6:{type:Number},
    Diem7:{type:Number},
});

const Point = mongoose.model('Point', pointSchema);
module.exports = Point;
