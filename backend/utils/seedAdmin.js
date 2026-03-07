const User = require('../models/User');
const logger = require('./logger');

const seedAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping admin seed');
            return;
        }

        const normalizedEmail = adminEmail.toLowerCase().trim();

        // Check if admin with this email already exists
        const existingAdmin = await User.findOne({ email: normalizedEmail });

        if (existingAdmin) {
            // If exists but not admin role, promote to admin
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                logger.info(`✅ Existing user promoted to admin: ${normalizedEmail}`);
            } else {
                logger.info(`Admin account already exists: ${normalizedEmail}`);
            }
            return;
        }

        // Create new admin account
        const admin = await User.create({
            name: 'Supreme Admin',
            email: normalizedEmail,
            password: adminPassword,
            role: 'admin'
        });

        logger.info(`✅ Admin account seeded: ${admin.email}`);
    } catch (error) {
        logger.error(`Seed admin error: ${error.message}`);
    }
};

module.exports = seedAdmin;
