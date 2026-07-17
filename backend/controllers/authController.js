const User = require('../models/User');
const Product = require('../models/Product'); // Product Model eka oni wenawa items delete karanna saha lookup karanna
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token Generator
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');

// 1. MANUAL SIGNUP
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ name, email, password: hashedPassword });

        if (user) {
            // Send Welcome Email
            await sendEmail(user.email, 'welcome', { name: user.name });

            res.status(201).json({
                _id: user.id, name: user.name, email: user.email, token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. MANUAL LOGIN
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                img: user.img,
                role: user.role, // ✅ Role eka return karanawa
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: "Invalid Email or Password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. GOOGLE AUTH (LOGIN & SIGNUP BOTH)
const googleAuth = async (req, res) => {
    const { name, email, img } = req.body;
    try {
        let user = await User.findOne({ email });

        if (user) {
            // User innawa -> LOGIN
            res.status(200).json({
                success: true, message: "Google Login Successful",
                user: { _id: user._id, name: user.name, email: user.email, img: user.img, role: user.role, token: generateToken(user._id) }
            });
        } else {
            // User na -> SIGNUP (Save & Login)
            user = await User.create({
                name, email, img, password: "", fromGoogle: true
            });

            // Send Welcome Email for Google Signup
            await sendEmail(user.email, 'welcome', { name: user.name });

            res.status(201).json({
                success: true, message: "Google Signup Successful",
                user: { _id: user._id, name: user.name, email: user.email, img: user.img, role: user.role, token: generateToken(user._id) }
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- 4. FORGOT PASSWORD ---
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Email not found" });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash and save to DB
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

        await user.save();

        // Create Reset URL
        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`; // Verify Frontend URL

        // Send Email
        const emailSent = await sendEmail(user.email, 'reset_password', {
            name: user.name,
            resetLink: resetUrl
        });

        if (emailSent) {
            res.status(200).json({ success: true, data: "Email sent" });
        } else {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            res.status(500).json({ error: "Email could not be sent" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 5. RESET PASSWORD ---
const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid Token" });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, data: "Password Reset Success" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- 6. ADMIN STATS ---
const getAdminStats = async (req, res) => {
    try {
        // 1. Get total users count
        const userCount = await User.countDocuments({ role: "user" });

        // 2. Get all users details (excluding password)
        const users = await User.find({ role: "user" }).select("-password");

        res.json({
            totalUsers: userCount,
            usersList: users,
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching stats" });
    }
};

// --- 7. GET ALL USERS (ADMIN ONLY) ---
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
};

// --- 8. GET USERS WITH ITEMS (ADMIN ONLY) ---
const getUsersWithData = async (req, res) => {
    try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: 'products', // Collection methods in mongo are usually pluralized, check if it is 'products' in your DB
                    localField: '_id',
                    foreignField: 'user',
                    as: 'trackedItems'
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    password: 0,
                    "trackedItems.user": 0
                }
            }
        ]);

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user data" });
    }
};

// --- 9. DELETE USER (ADMIN ONLY) ---
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        // Optional: Delete user's items
        await Product.deleteMany({ user: req.params.id });
        res.json({ message: "User Removed" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user" });
    }
};

// --- 10. UPDATE USER (ADMIN ONLY) ---
const updateUser = async (req, res) => {
    const { name, email, role } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            user.role = role || user.role;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating user" });
    }
};

module.exports = { registerUser, loginUser, googleAuth, forgotPassword, resetPassword, getAdminStats, getAllUsers, getUsersWithData, deleteUser, updateUser };