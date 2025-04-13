const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    otpcheck: String,
    name: { type: String },
    dateOfBirth: { type: Date },
    phoneNumber: { type: String }, 
    atmNumber: { type: String, unique: true }, 
    description: { type: String }, 
    level: { type: Number, default: 1 }, 
    diemTrungBinh: { type: Number }, 
    avatar: { type: String }, 
    residence: { type: String }, 
    cccd: { type: String, unique: true }, 
    major: { type: String }, 
    systemAffiliation: { type: String } 
});

module.exports = mongoose.model('User', UserSchema);
