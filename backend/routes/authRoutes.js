const express = require('express');
const router = express.Router();

// මෙතන signup වෙනුවට registerUser ඉම්පෝට් කරගන්න
const { registerUser, loginUser, googleAuth, forgotPassword, resetPassword, getAdminStats, getAllUsers, getUsersWithData, deleteUser, updateUser } = require('../controllers/authController');

// Route එකත් හරිද බලන්න
router.post('/register', registerUser); // ✅ මෙතනත් registerUser තියෙන්න ඕන
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.get('/admin/stats', getAdminStats); // ✅ Admin Stats Route

// 1. GET ALL USERS (ADMIN ONLY)
router.get('/users', getAllUsers);

// 2. GET USERS WITH DATA (ADMIN ONLY)
router.get('/users-with-data', getUsersWithData);

// 3. DELETE USER (ADMIN ONLY)
router.delete('/user/:id', deleteUser);

// 4. UPDATE USER (ADMIN ONLY)
router.put('/user/:id', updateUser);

module.exports = router;