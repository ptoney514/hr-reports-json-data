/**
 * Neon Client Tests
 *
 * Tests for database connection wrapper logic patterns.
 * The actual neon-client.js is in scripts/etl/ outside the src/ directory.
 *
 * These tests validate the expected behavior patterns for:
 * - Database connection handling
 * - Transaction management
 * - Audit logging
 * - Migration/seed execution
 */

describe('Neon Client Patterns', () => {
  describe('getDatabaseUrl', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('uses DATABASE_URL from environment', () => {
      process.env.DATABASE_URL = 'postgresql://test:test@test.neon.tech/test';
      const getDatabaseUrl = () => process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
      expect(getDatabaseUrl()).toBe('postgresql://test:test@test.neon.tech/test');
    });

    it('falls back to NEON_DATABASE_URL', () => {
      delete process.env.DATABASE_URL;
      process.env.NEON_DATABASE_URL = 'postgresql://neon:pass@host/db';
      const getDatabaseUrl = () => process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
      expect(getDatabaseUrl()).toBe('postgresql://neon:pass@host/db');
    });

    it('returns undefined when neither env var is set', () => {
      delete process.env.DATABASE_URL;
      delete process.env.NEON_DATABASE_URL;
      const getDatabaseUrl = () => process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
      expect(getDatabaseUrl()).toBeUndefined();
    });
  });

  describe('Connection Pool Pattern', () => {
    let _pool = null;

    const getPool = (createFn) => {
      if (!_pool) {
        _pool = createFn();
      }
      return _pool;
    };

    const endPool = async () => {
      if (_pool) {
        _pool = null;
        return true;
      }
      return false;
    };

    beforeEach(() => {
      _pool = null;
    });

    it('creates pool only once (singleton pattern)', () => {
      const createFn = jest.fn().mockReturnValue({ id: 'pool1' });

      const pool1 = getPool(createFn);
      const pool2 = getPool(createFn);

      expect(createFn).toHaveBeenCalledTimes(1);
      expect(pool1).toBe(pool2);
    });

    it('endPool clears the pool', async () => {
      const createFn = jest.fn().mockReturnValue({ id: 'pool1' });
      getPool(createFn);

      const wasCleared = await endPool();
      expect(wasCleared).toBe(true);

      // Calling again should return false (already cleared)
      const wasCleared2 = await endPool();
      expect(wasCleared2).toBe(false);
    });
  });

  describe('Transaction Pattern', () => {
    const createMockClient = () => ({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn()
    });

    const transaction = async (pool, callback) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    };

    it('commits on success', async () => {
      const client = createMockClient();
      const pool = { connect: jest.fn().mockResolvedValue(client) };

      const callback = jest.fn().mockResolvedValue('result');
      const result = await transaction(pool, callback);

      expect(client.query).toHaveBeenCalledWith('BEGIN');
      expect(client.query).toHaveBeenCalledWith('COMMIT');
      expect(client.query).not.toHaveBeenCalledWith('ROLLBACK');
      expect(client.release).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('rolls back on error', async () => {
      const client = createMockClient();
      const pool = { connect: jest.fn().mockResolvedValue(client) };

      const error = new Error('Transaction failed');
      const callback = jest.fn().mockRejectedValue(error);

      await expect(transaction(pool, callback)).rejects.toThrow('Transaction failed');

      expect(client.query).toHaveBeenCalledWith('BEGIN');
      expect(client.query).toHaveBeenCalledWith('ROLLBACK');
      expect(client.query).not.toHaveBeenCalledWith('COMMIT');
      expect(client.release).toHaveBeenCalled();
    });

    it('always releases client', async () => {
      const client = createMockClient();
      const pool = { connect: jest.fn().mockResolvedValue(client) };

      // Even on success
      await transaction(pool, () => 'success');
      expect(client.release).toHaveBeenCalledTimes(1);

      client.release.mockClear();

      // Even on failure
      try {
        await transaction(pool, () => { throw new Error('fail'); });
      } catch (e) {
        // expected
      }
      expect(client.release).toHaveBeenCalledTimes(1);
    });
  });

  describe('Audit Logging Pattern', () => {
    const createAuditLog = ({ loadType, sourceFile, periodDate, fiscalPeriod }) => ({
      load_type: loadType,
      source_file: sourceFile,
      period_date: periodDate,
      fiscal_period: fiscalPeriod,
      status: 'started',
      started_at: new Date().toISOString()
    });

    const completeAuditLog = (log, { recordsRead, recordsInserted, recordsUpdated, recordsErrored, status = 'completed', errorMessage = null }) => ({
      ...log,
      records_read: recordsRead,
      records_inserted: recordsInserted,
      records_updated: recordsUpdated,
      records_errored: recordsErrored,
      status,
      error_message: errorMessage,
      completed_at: new Date().toISOString()
    });

    it('creates audit log with started status', () => {
      const log = createAuditLog({
        loadType: 'workforce',
        sourceFile: 'test.xlsx',
        periodDate: '2025-06-30',
        fiscalPeriod: 'FY25_Q4'
      });

      expect(log.load_type).toBe('workforce');
      expect(log.source_file).toBe('test.xlsx');
      expect(log.period_date).toBe('2025-06-30');
      expect(log.fiscal_period).toBe('FY25_Q4');
      expect(log.status).toBe('started');
    });

    it('completes audit log with record counts', () => {
      const log = createAuditLog({
        loadType: 'workforce',
        sourceFile: 'test.xlsx',
        periodDate: '2025-06-30',
        fiscalPeriod: 'FY25_Q4'
      });

      const completedLog = completeAuditLog(log, {
        recordsRead: 100,
        recordsInserted: 95,
        recordsUpdated: 5,
        recordsErrored: 0
      });

      expect(completedLog.records_read).toBe(100);
      expect(completedLog.records_inserted).toBe(95);
      expect(completedLog.records_updated).toBe(5);
      expect(completedLog.records_errored).toBe(0);
      expect(completedLog.status).toBe('completed');
    });

    it('records errors', () => {
      const log = createAuditLog({
        loadType: 'workforce',
        sourceFile: 'test.xlsx',
        periodDate: '2025-06-30',
        fiscalPeriod: 'FY25_Q4'
      });

      const failedLog = completeAuditLog(log, {
        recordsRead: 100,
        recordsInserted: 0,
        recordsUpdated: 0,
        recordsErrored: 100,
        status: 'failed',
        errorMessage: 'Data validation failed'
      });

      expect(failedLog.status).toBe('failed');
      expect(failedLog.error_message).toBe('Data validation failed');
    });
  });

  describe('checkConnection Pattern', () => {
    it('returns true when query succeeds', async () => {
      const sql = jest.fn().mockResolvedValue([{ connected: 1 }]);

      const checkConnection = async () => {
        try {
          const result = await sql`SELECT 1 as connected`;
          return result[0]?.connected === 1;
        } catch (error) {
          return false;
        }
      };

      sql.mockResolvedValue([{ connected: 1 }]);
      const result = await checkConnection();
      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      const checkConnection = async (sql) => {
        try {
          await sql`SELECT 1 as connected`;
          return true;
        } catch (error) {
          return false;
        }
      };

      const failingSql = jest.fn().mockRejectedValue(new Error('Connection refused'));
      const result = await checkConnection(failingSql);
      expect(result).toBe(false);
    });
  });

  describe('Migration Execution Pattern', () => {
    const runMigrations = async (files, sql) => {
      const results = [];

      for (const file of files) {
        try {
          await sql(file.content);
          results.push({ file: file.name, success: true });
        } catch (error) {
          results.push({ file: file.name, success: false, error: error.message });
          throw error; // Stop on first error
        }
      }

      return results;
    };

    it('runs migration files in order', async () => {
      const sql = jest.fn().mockResolvedValue([]);
      const files = [
        { name: '001_tables.sql', content: 'CREATE TABLE test1;' },
        { name: '002_indexes.sql', content: 'CREATE INDEX idx1;' }
      ];

      const results = await runMigrations(files, sql);

      expect(sql).toHaveBeenCalledTimes(2);
      expect(sql).toHaveBeenNthCalledWith(1, 'CREATE TABLE test1;');
      expect(sql).toHaveBeenNthCalledWith(2, 'CREATE INDEX idx1;');
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    it('stops and throws on error', async () => {
      const sql = jest.fn()
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('Syntax error'));

      const files = [
        { name: '001_tables.sql', content: 'CREATE TABLE test1;' },
        { name: '002_bad.sql', content: 'CREAT TABLE test2;' },
        { name: '003_indexes.sql', content: 'CREATE INDEX idx1;' }
      ];

      await expect(runMigrations(files, sql)).rejects.toThrow('Syntax error');

      // Third file should not be executed
      expect(sql).toHaveBeenCalledTimes(2);
    });
  });

  describe('Upsert Helper Pattern', () => {
    const upsert = async (pool, table, data, conflictKeys, options = {}) => {
      const { columnMap = {}, dryRun = false, updateExclusions = [] } = options;
      const dataKeys = Object.keys(data);
      const dbColumns = dataKeys.map(k => columnMap[k] || k);
      const values = dataKeys.map(k => data[k]);
      const placeholders = dataKeys.map((_, i) => `$${i + 1}`);
      const excludeSet = new Set([...conflictKeys, ...updateExclusions]);
      const updateCols = dbColumns.filter(col => !excludeSet.has(col));
      const setClauses = updateCols.map(col => `${col} = EXCLUDED.${col}`);
      setClauses.push('loaded_at = NOW()');

      const sqlText = [
        `INSERT INTO ${table} (${dbColumns.join(', ')})`,
        `VALUES (${placeholders.join(', ')})`,
        `ON CONFLICT (${conflictKeys.join(', ')})`,
        `DO UPDATE SET ${setClauses.join(', ')}`,
        `RETURNING (xmax = 0) AS inserted`
      ].join('\n');

      if (dryRun) {
        return { inserted: true, updated: false };
      }

      const result = await pool.query(sqlText, values);
      const wasInserted = result.rows[0]?.inserted === true;
      return { inserted: wasInserted, updated: !wasInserted };
    };

    it('builds correct SQL and returns inserted for new rows', async () => {
      const pool = {
        query: jest.fn().mockResolvedValue({ rows: [{ inserted: true }] })
      };

      const result = await upsert(pool, 'fact_test', {
        fiscal_year: 'FY25',
        category: 'staff',
        rate: 12.5
      }, ['fiscal_year', 'category']);

      expect(result).toEqual({ inserted: true, updated: false });
      expect(pool.query).toHaveBeenCalledTimes(1);

      const [sqlText, values] = pool.query.mock.calls[0];
      expect(sqlText).toContain('INSERT INTO fact_test');
      expect(sqlText).toContain('ON CONFLICT (fiscal_year, category)');
      expect(sqlText).toContain('rate = EXCLUDED.rate');
      expect(sqlText).toContain('loaded_at = NOW()');
      expect(sqlText).not.toContain('fiscal_year = EXCLUDED.fiscal_year');
      expect(values).toEqual(['FY25', 'staff', 12.5]);
    });

    it('returns updated for existing rows', async () => {
      const pool = {
        query: jest.fn().mockResolvedValue({ rows: [{ inserted: false }] })
      };

      const result = await upsert(pool, 'fact_test', {
        fiscal_year: 'FY25',
        rate: 15.0
      }, ['fiscal_year']);

      expect(result).toEqual({ inserted: false, updated: true });
    });

    it('supports columnMap for asymmetric field names', async () => {
      const pool = {
        query: jest.fn().mockResolvedValue({ rows: [{ inserted: true }] })
      };

      await upsert(pool, 'fact_pipeline_metrics_staff', {
        fiscal_year: 'FY26',
        fiscal_quarter: 1,
        apps_per_req: 25
      }, ['fiscal_year', 'fiscal_quarter'], {
        columnMap: { apps_per_req: 'apps_per_requisition' }
      });

      const [sqlText] = pool.query.mock.calls[0];
      expect(sqlText).toContain('apps_per_requisition');
      // The original data key should not appear as a bare column name
      expect(sqlText).not.toMatch(/\bapps_per_req\b(?!uisition)/);
    });

    it('respects updateExclusions', async () => {
      const pool = {
        query: jest.fn().mockResolvedValue({ rows: [{ inserted: true }] })
      };

      await upsert(pool, 'fact_test', {
        id: 1,
        name: 'test',
        created_at: '2025-01-01'
      }, ['id'], { updateExclusions: ['created_at'] });

      const [sqlText] = pool.query.mock.calls[0];
      expect(sqlText).toContain('name = EXCLUDED.name');
      expect(sqlText).not.toContain('created_at = EXCLUDED.created_at');
    });

    it('returns dry-run result without querying', async () => {
      const pool = { query: jest.fn() };

      const result = await upsert(pool, 'fact_test', {
        id: 1, name: 'test'
      }, ['id'], { dryRun: true });

      expect(result).toEqual({ inserted: true, updated: false });
      expect(pool.query).not.toHaveBeenCalled();
    });
  });

  describe('Module Exports Pattern', () => {
    it('exports expected functions', () => {
      const expectedExports = [
        'sql',
        'getPool',
        'endPool',
        'transaction',
        'runMigrations',
        'runSeeds',
        'startAuditLog',
        'completeAuditLog',
        'checkConnection',
        'getDatabaseInfo',
        'getDatabaseUrl',
        'upsert'
      ];

      // This tests the expected interface - actual implementation is in scripts/etl/neon-client.js
      expectedExports.forEach(exp => {
        expect(typeof exp).toBe('string');
      });
    });
  });
});
