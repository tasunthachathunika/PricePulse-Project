const Notification = require('../models/Notification');
const User = require('../models/User');

// GET all notifications for a specific user (and global notifications)
exports.getNotifications = async (req, res) => {
    try {
        const { userEmail } = req.query;
        const user = await User.findOne({ email: userEmail });
        
        if (!user) return res.status(404).json({ error: "User not found" });

        // Get notifications specific to user OR global notifications (user: null)
        const notifications = await Notification.find({
            $or: [{ user: user._id }, { user: null }]
        }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

// POST a new notification (Admin Only)
exports.createNotification = async (req, res) => {
    try {
        const { userId, title, message } = req.body;
        
        const notification = new Notification({
            user: userId || null, // null means global
            title,
            message
        });

        await notification.save();
        res.status(201).json({ message: "Notification sent successfully", notification });
    } catch (error) {
        console.error("Create Notification Error:", error);
        res.status(500).json({ error: "Failed to send notification" });
    }
};

// PUT mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: "Failed to mark notification as read" });
    }
};

// DELETE a notification
exports.deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ message: "Notification deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete notification" });
    }
};
