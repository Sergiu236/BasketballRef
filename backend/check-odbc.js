// check-odbc.js  (Node + TypeScript OK)
const sql = require('mssql/msnodesqlv8');

(async () => {
  try {
    // ── tell node‑mssql to use msnodesqlv8 ──
    const pool = await sql.connect({
      driver: 'msnodesqlv8',
      connectionString: 'DSN=BasketballRefDB2;',
      // node‑mssql builds a default conn_str; tweak it before connect:
      beforeConnect: cfg => {
        cfg.conn_str = cfg.conn_str.replace(
          'SQL Server Native Client 11.0',
          'ODBC Driver 17 for SQL Server'
        );
      }
    });

    // quick sanity query
    const { recordset } = await pool.request()
                                    .query('SELECT DB_NAME() AS CurrentDB');
    console.log('✅ Connected! Current database:', recordset[0].CurrentDB);

    await pool.close();
  } catch (err) {
    console.error('❌ ConnectionError:', err.message);
    if (err.originalError) {
      console.error('   SQLState:', err.originalError.sqlstate);
    }
  } finally {
    sql.close();           // safety‑close even if it failed
  }
})();
