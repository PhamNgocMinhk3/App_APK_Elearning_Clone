const jwt = require('jsonwebtoken');
const UserAuth = require('../models/UserAuth'); // Điều chỉnh đường dẫn nếu cần
const crypto = require('crypto');

const authenticateToken = async (req, res, next) => {
    // Nhận tokenRefresh và userid từ client
    const { user: userid, tokenRefresh } = req.body; 
    console.log('tokenRefresh:', tokenRefresh); 
    console.log('id user:', userid); 
    
    // Kiểm tra xem tokenRefresh có tồn tại không
    if (!tokenRefresh) return res.status(401).json({ message: 'Token refresh missing' });

    try {
        // Tìm userAuth dựa trên userid
        const userAuth = await UserAuth.findOne({ id_User: userid });
        if (!userAuth) {
            return res.status(403).json({ message: 'Invalid user' });
        }
        // Kiểm tra xem tokenRefresh có nằm trong lịch sử token không
        console.log('KeyPublic used for verification:', userAuth.KeyPublic);
        if (userAuth.HistoryToken.includes(tokenRefresh)) {
            console.log('Token đã tồn tại trong lịch sử, xóa userAuth');
            await UserAuth.deleteOne({ id_User: userid });
            return res.status(200).json({ message: 'User auth deleted due to duplicate token' });
        } else {
            console.log('Token không nằm trong lịch sử, không cần xóa userAuth');
        }

        // Tạo token mới và cập nhật thông tin
        const newKeyPublic = crypto.randomBytes(60).toString('hex');
        const newKeyPrivate = crypto.randomBytes(60).toString('hex');
        const newAccessToken = jwt.sign({ id: userid }, newKeyPrivate, { expiresIn: '10m' });
        const newRefreshToken = jwt.sign({ id: userid }, newKeyPublic, { expiresIn: '1d' });

        // Lưu token mới vào userAuth
        userAuth.HistoryToken.push(tokenRefresh);
        userAuth.TokenAcess = newAccessToken;
        userAuth.TokenRefress = newRefreshToken;
        userAuth.KeyPublic = newKeyPublic;
        userAuth.KeyPrivate = newKeyPrivate;
        await userAuth.save();

        // Gửi token mới về client
        req.user = { id: userid };
        req.newAccessToken = newAccessToken;
        req.newRefreshToken = newRefreshToken;

        return res.status(200).json({
            newAccessToken: newAccessToken,
            newRefreshToken: newRefreshToken,
        });
        
    } catch (err) {
        console.error('Error:', err);
        const isExpired = err.name === 'TokenExpiredError';
        return res.status(403).json({ message: isExpired ? 'Token expired, please log in again' : 'Invalid token' });
    }
};

module.exports = authenticateToken;
