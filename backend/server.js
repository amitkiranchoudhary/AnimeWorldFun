require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const animeTrackerRoutes = require('./routes/animeTracker');

const app = express();

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Middleware ─────────────────────────────────────────
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging via Morgan → Winston
app.use(morgan('combined', { stream: logger.stream }));

// Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// ─── API Routes ────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/anime', animeTrackerRoutes);

// ─── Health Check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'AnimeWorldFun API is running 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// ─── 404 Handler ───────────────────────────────────────
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// ─── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack });
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
});

// ─── Seed Admin & Start Server ─────────────────────────
const seedAdmin = require('./utils/seedAdmin');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await seedAdmin();

        app.listen(PORT, () => {
            logger.info(`
╔═══════════════════════════════════════════╗
║   AnimeWorldFun API Server               ║
║   Port: ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}            ║
║   Status: RUNNING 🚀                     ║
╚═══════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
};

startServer();
