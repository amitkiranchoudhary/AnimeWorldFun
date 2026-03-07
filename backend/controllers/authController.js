const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const logger = require('../utils/logger');

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Helper to build user response data with loyalty badge
const buildUserResponse = (user) => {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        loyaltyBadge: user.loyaltyBadge,
        createdAt: user.createdAt
    };
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

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

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
            data: { token, user: buildUserResponse(user) }
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
            data: { token, user: buildUserResponse(user) }
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
            data: { user: buildUserResponse(user) }
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
            data: { user: buildUserResponse(user) }
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

// ─── Forgot Password Flow ─────────────────────────────

// POST /api/auth/forgot-password — send OTP to email
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email.'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if email exists
            return res.json({
                success: true,
                message: 'If that email is registered, you will receive an OTP.'
            });
        }

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email: email.toLowerCase() });

        // Generate a 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash the OTP before storing
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otpCode, salt);

        // Store OTP with 5-minute expiry
        await OTP.create({
            email: email.toLowerCase(),
            otp: hashedOTP,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        });

        // Log OTP to console (for dev testing without SMTP)
        logger.info(`🔑 OTP for ${email}: ${otpCode} (expires in 5 minutes)`);
        console.log(`\n🔑 ==========================================`);
        console.log(`   OTP for ${email}: ${otpCode}`);
        console.log(`   Expires in 5 minutes`);
        console.log(`==========================================\n`);

        // Try to send email if SMTP is configured
        try {
            const nodemailer = require('nodemailer');
            const smtpUser = process.env.SMTP_USER;
            const smtpPass = process.env.SMTP_PASS;

            if (smtpUser && smtpPass) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: { user: smtpUser, pass: smtpPass }
                });

                await transporter.sendMail({
                    from: `"AnimeWorldFun" <${smtpUser}>`,
                    to: email,
                    subject: 'Password Reset OTP — AnimeWorldFun',
                    html: `
                        <div style="font-family:Arial,sans-serif;max-width:400px;margin:0 auto;padding:20px;background:#0a0e1a;color:#f0eae0;border-radius:12px;">
                            <h2 style="color:#8b5cf6;">🔐 Password Reset</h2>
                            <p>Your OTP code is:</p>
                            <div style="background:#1a1a2e;padding:16px;border-radius:8px;text-align:center;font-size:32px;letter-spacing:8px;font-weight:bold;color:#ec4899;">${otpCode}</div>
                            <p style="margin-top:16px;color:#6b6e7a;font-size:13px;">This code expires in 5 minutes. If you didn't request this, ignore this email.</p>
                        </div>
                    `
                });

                logger.info(`OTP email sent to ${email}`);
            }
        } catch (emailError) {
            logger.warn(`Email sending failed: ${emailError.message}. OTP logged to console.`);
        }

        res.json({
            success: true,
            message: 'If that email is registered, you will receive an OTP.'
        });
    } catch (error) {
        logger.error(`ForgotPassword error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// POST /api/auth/verify-otp — verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP.'
            });
        }

        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired or not found. Please request a new one.'
            });
        }

        const isValid = await bcrypt.compare(otp, otpRecord.otp);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please try again.'
            });
        }

        // Mark as verified
        otpRecord.verified = true;
        await otpRecord.save();

        res.json({
            success: true,
            message: 'OTP verified successfully. You can now reset your password.'
        });
    } catch (error) {
        logger.error(`VerifyOTP error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

// POST /api/auth/reset-password — reset password after OTP verification
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, OTP, and new password.'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters.'
            });
        }

        // Check for verified OTP
        const otpRecord = await OTP.findOne({
            email: email.toLowerCase(),
            verified: true,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'OTP not verified or expired. Please start over.'
            });
        }

        // Verify the OTP matches (double check)
        const isValid = await bcrypt.compare(otp, otpRecord.otp);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP.'
            });
        }

        // Reset the password
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        user.password = newPassword;
        await user.save();

        // Clean up OTPs for this email
        await OTP.deleteMany({ email: email.toLowerCase() });

        logger.info(`Password reset successful: ${user.email}`);

        res.json({
            success: true,
            message: 'Password reset successfully. You can now log in.'
        });
    } catch (error) {
        logger.error(`ResetPassword error: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
