// backend/src/config/database.ts

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Referee }    from '../entities/Referee';
import { Game }       from '../entities/Game';
import { User }       from '../entities/User';
import { Log }        from '../entities/Log';
import { MonitoredUser } from '../entities/MonitoredUser';
import { UserSession } from '../entities/UserSession';
import { LoginAttempt } from '../entities/LoginAttempt';

// Configuration for different environments
const isProduction = process.env.NODE_ENV === 'production';

let dataSourceConfig: any;

if (isProduction) {
  // PostgreSQL configuration for Render
  dataSourceConfig = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    entities: [Referee, Game, User, Log, MonitoredUser, UserSession, LoginAttempt],
    synchronize: true,
    logging: false,
  };
} else {
  // Local MSSQL configuration with Windows Authentication
  // import the ODBC driver entry-point with Windows authentication & named pipes
  const sqlServer = require('mssql/msnodesqlv8');
  
  dataSourceConfig = {
    type: 'mssql',
    
    // tell TypeORM to use the msnodesqlv8 (ODBC) driver
    driver: sqlServer,
    
    // pass the raw ODBC connection options directly to the driver
    extra: {
      connectionString: [
        'Driver={ODBC Driver 17 for SQL Server};',
        'Server=NastyCash\\SQLEXPRESS;',
        'Database=BasketballRefDB;',
        'Trusted_Connection=yes;',
        'TrustServerCertificate=Yes;'
      ].join(''),
      
      // ensure we replace the default Native Client 11 with Driver 17
      beforeConnect: (cfg: any) => {
        cfg.conn_str = cfg.conn_str.replace(
          'SQL Server Native Client 11.0',
          'ODBC Driver 17 for SQL Server'
        );
      }
    },
    
    entities: [Referee, Game, User, Log, MonitoredUser, UserSession, LoginAttempt],
    synchronize: false,   // dezactivăm sincronizarea automată pentru a evita conflicte cu structura existentă
    logging: true,        // activez logging-ul pentru a vedea query-urile
  };
}

export const AppDataSource = new DataSource(dataSourceConfig);