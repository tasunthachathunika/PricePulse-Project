const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // ඔයාගේ User Model එකේ path එක හරියට දෙන්න

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // DB Connect වෙනවා

        // කලින් Admin කෙනෙක් ඉන්නවද බලනවා (Duplicate නොවෙන්න)
        const adminExists = await User.findOne({ email: "admin@gmail.com" });

        if (adminExists) {
            console.log("⚠️ Admin User Already Exists!");
            process.exit();
        }

        // පාස්වර්ඩ් එක Hash කරනවා
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt); // පාස්වර්ඩ් එක: admin123

        // Admin ව හදනවා
        const adminUser = await User.create({
            name: "Super Admin",
            email: "admin@gmail.com",
            password: hashedPassword,
            role: "admin", // 👈 මෙන්න මේකයි වැදගත්ම කෑල්ල
            fromGoogle: false
        });

        console.log("✅ Admin Created: admin@gmail.com / admin123");
        process.exit();

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

createAdmin();
