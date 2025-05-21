// backend/src/config/database.ts

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Referee }    from '../entities/Referee';
import { Game }       from '../entities/Game';
import { User }       from '../entities/User';
import { Log }        from '../entities/Log';
import { MonitoredUser } from '../entities/MonitoredUser';

// Configuration for different environments
const isProduction = process.env.NODE_ENV === 'production';

let dataSourceConfig: any;

if (isProduction) {
  // PostgreSQL configuration for Render
  dataSourceConfig = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    entities: [Referee, Game, User, Log, MonitoredUser],
    synchronize: true,
    logging: false,
  };
} else {
  // Local MSSQL configuration
  dataSourceConfig = {
    type: 'mssql',
    host: 'localhost',
    port: 1433,
    username: 'sa',
    password: 'your_password',
    database: 'BasketballRefDB2',
    options: {
      trustServerCertificate: true,
      encrypt: false
    },
    entities: [Referee, Game, User, Log, MonitoredUser],
    synchronize: true,
    logging: false,
  };
}

export const AppDataSource = new DataSource(dataSourceConfig);