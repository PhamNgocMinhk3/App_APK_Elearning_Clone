const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    subject: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    tinhtrang :{type:String,default:"0"},
    Malop:{type:[String]}
});

module.exports = mongoose.model('paymentSchema', paymentSchema);
