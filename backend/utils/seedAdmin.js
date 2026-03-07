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

        const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

        if (existingAdmin) {
            logger.info(`Admin account already exists: ${adminEmail}`);
            return;
        }

        const admin = await User.create({
            name: 'Supreme Admin',
            email: adminEmail.toLowerCase(),
            password: adminPassword,
            role: 'admin'
        });

        logger.info(`✅ Admin account seeded: ${admin.email}`);
    } catch (error) {
        logger.error(`Seed admin error: ${error.message}`);
    }
};

module.exports = seedAdmin;
