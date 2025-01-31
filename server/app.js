const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const cors = require('cors'); 

// Routes
const authRoutes = require('./routes/authRoutes');
const cameraRoutes = require('./routes/cameraRoutes');


// Middlewares
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Enable CORS for all origins (for development)
app.use(cors());

// Middleware for JSON Parsing
app.use(express.json());

// Log incoming requests for debugging
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Database Connection
connectDB();

// Routes
app.use('/api/cameras', cameraRoutes); // Camera management routes


// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
