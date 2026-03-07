const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// POST /api/auth/signup
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters.'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

        // Create user with visitor role
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: 'visitor'
        });

        const token = generateToken(user);

        logger.info(`Signup successful: ${user.email} (visitor)`);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    bio: user.bio
                }
            }
        });
    } catch (error) {
        logger.error(`Signup error: ${error.message}`);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password.'
            });
        }

        // Find user with password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            logger.warn(`Login failed: No user found for email ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        if (!user.isActive) {
            logger.warn(`Login failed: Inactive account ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated.'
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            logger.warn(`Login failed: Wrong password for ${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const token = generateToken(user);

        logger.info(`Login successful: ${user.email} (${user.role})`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                    bio: user.bio
                }
            }
        });
    } catch (error) {
        logger.error(`Login error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            data: { user }
        });
    } catch (error) {
        logger.error(`GetMe error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, avatar } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (bio !== undefined) updates.bio = bio;
        if (avatar !== undefined) updates.avatar = avatar;

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });

        logger.info(`Profile updated: ${user.email}`);

        res.json({
            success: true,
            message: 'Profile updated',
            data: { user }
        });
    } catch (error) {
        logger.error(`UpdateProfile error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters.'
            });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect.'
            });
        }

        user.password = newPassword;
        await user.save();

        logger.info(`Password changed: ${user.email}`);

        res.json({
            success: true,
            message: 'Password changed successfully.'
        });
    } catch (error) {
        logger.error(`ChangePassword error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
