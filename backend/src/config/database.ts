// backend/src/config/database.ts

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Referee }    from '../entities/Referee';
import { Game }       from '../entities/Game';
import { User }       from '../entities/User';
import { Log }        from '../entities/Log';
import { MonitoredUser } from '../entities/MonitoredUser';

// import the ODBC driver entry-point with Windows authentication & named pipes
import sqlServer from 'mssql/msnodesqlv8';

export const AppDataSource = new DataSource({
  type: 'mssql',

  // tell TypeORM to use the msnodesqlv8 (ODBC) driver
  driver: sqlServer as any,

  // pass the raw ODBC connection options directly to the driver
  extra: {
    connectionString: [
      'DSN=BasketballRefDB2;',
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

  entities: [Referee, Game, User, Log, MonitoredUser],
  synchronize: true,   // dev only: auto-sync schema
  logging: false,
});