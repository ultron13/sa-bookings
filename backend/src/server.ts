import 'reflect-metadata';
import app from './app';
import { config } from './config';
import { initializeDatabase } from './config/database';
import { logger } from './config/logger';
import { runSeeds } from './seeds/run';

async function start(): Promise<void> {
  try {
    await initializeDatabase();
    logger.info('Database connected');

    if (config.env === 'development') {
      await runSeeds();
    }

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
      logger.info(`API docs: http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
