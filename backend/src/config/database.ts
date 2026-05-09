import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './index';
import path from 'path';

const options: DataSourceOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: config.database.synchronize,
  logging: config.database.logging,
  entities: [path.join(__dirname, '..', 'entities', '*.{ts,js}')],
  migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
  subscribers: [],
  ssl: config.env === 'production' ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(options);

export async function initializeDatabase(): Promise<DataSource> {
  try {
    const dataSource = await AppDataSource.initialize();
    console.log('Database connection established successfully');
    return dataSource;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}
