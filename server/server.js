// server/server.js

const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 8080;

// Start the server here
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

