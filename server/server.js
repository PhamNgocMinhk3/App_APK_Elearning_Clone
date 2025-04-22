const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Kết nối MongoDB
const authRoutes = require('./routes/auth'); // Các route xác thực (login, register)
const userProfile = require('./routes/userProfile');
const Class = require('./routes/class');
const payment = require('./routes/payment.js');
const Point = require("./routes/Points.js");
const GetPoints = require("./routes/getPoints.js");
const UpdateExample = require("./routes/updateExample.js");
const notificationsRouter = require('./routes/notifications.js');
const permissionFormsRoutes = require('./routes/permissionForms');
const feedback = require('./routes/feedback.js');

const authenticateToken = require('./middleware/authenticateToken'); // Middleware xác thực JWT
const verifyToken = require('./middleware/middlewareRouter'); // Middleware kiểm tra token
const session = require('express-session'); // Middleware quản lý session
const passport = require('passport'); // Passport cho đăng nhập mạng xã hội
const path = require('path'); // Import path module

dotenv.config(); // Load biến môi trường từ .env

const app = express();
app.set('view engine', 'ejs');

// Middleware setup
app.use(cors()); // Cho phép CORS để gọi API từ frontend
app.use(express.json()); // Để phân tích các request với payload JSON

// Setup session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Khóa bí mật cho session
    resave: false,
    saveUninitialized: true,
}));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Kết nối đến MongoDB
connectDB();

// Initialize passport for session management
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Sử dụng các route xác thực thông thườngr
app.use('/api/auth', authRoutes);
app.use('/', Class);
app.use('/', userProfile);
app.use('/', payment);
app.use('/', Point);
app.use('/', GetPoints);
app.use('/', UpdateExample);
app.use('/', notificationsRouter);
app.use('/', permissionFormsRoutes);
app.use('/', feedback);

// Route để lấy thông tin người dùng đã đăng nhập (bảo vệ bởi JWT)
app.post('/api/me', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Route để xác thực token từ client (bảo vệ bởi JWT)
app.post('/api/verify', verifyToken, (req, res) => {
    res.json({ user: req.user });
});

// Route kiểm tra để đảm bảo server đang chạy
app.get('/', (req, res) => {
    res.send('Server is running!');
});


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).json({ message: 'Something went wrong!', error: err.message }); // Send error response
});

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
