// const express = require('express');
// const dotenv = require('dotenv');
// const connectDB = require('./config/db');
// const logger = require('./utils/logger');

// // Routes
// const authRoutes = require('./routes/authRoutes');
// const cameraRoutes = require('./routes/cameraRoutes');
// const analyticsRoutes = require('./routes/analyticsRoutes');
// const logRoutes = require('./routes/logRoutes');

// // Middlewares
// const { errorHandler, notFound } = require('./middlewares/errorHandler');

// // Load environment variables
// dotenv.config();

// // Initialize Express app
// const app = express();

// // Middleware for JSON Parsing
// app.use(express.json());

// // Log incoming requests for debugging
// app.use((req, res, next) => {
//     logger.info(`Incoming request: ${req.method} ${req.url}`);
//     next();
// });

// // Database Connection
// connectDB();

// // Routes
// // app.use('/api/auth', authRoutes); // User authentication routes
// app.use('/api/cameras', cameraRoutes); // Camera management routes
// // app.use('/api/analytics', analyticsRoutes); // Analytics-related routes
// // app.use('/api/logs', logRoutes); // Log-related routes

// // Error Handling Middleware
// app.use(notFound); // Handle 404 errors
// app.use(errorHandler); // Handle other errors

// module.exports = app;

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const cors = require('cors');  // <-- Import the cors package

// Routes
const authRoutes = require('./routes/authRoutes');
const cameraRoutes = require('./routes/cameraRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const logRoutes = require('./routes/logRoutes');

// Middlewares
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Enable CORS for all origins (for development)
app.use(cors());

// Optionally: If you want more fine-grained control, you can pass options:
// app.use(cors({
//   origin: 'http://localhost:3001', // allow only this origin
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // allowed methods
//   credentials: true,
// }));

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
// app.use('/api/auth', authRoutes); // User authentication routes
app.use('/api/cameras', cameraRoutes); // Camera management routes
// app.use('/api/analytics', analyticsRoutes); // Analytics-related routes
// app.use('/api/logs', logRoutes); // Log-related routes

// Error Handling Middleware
app.use(notFound); // Handle 404 errors
app.use(errorHandler); // Handle other errors

module.exports = app;
