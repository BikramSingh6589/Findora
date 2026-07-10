import * as dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { initSocket } from './services/socket.service';
import { initAIWorker } from './workers/ai.worker';

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Attempt database connection
    await connectDB();
  } catch (error) {
    console.error('Failed to initialize database connection. Continuing to start server...');
  }

  // Initialize background AI matching queue worker
  await initAIWorker();

  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();
