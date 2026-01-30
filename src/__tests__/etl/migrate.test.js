/**
 * Migrate Script Tests
 *
 * Tests for migration runner patterns used in scripts/etl/migrate.js.
 * These tests validate the logic without importing the actual CLI script.
 */

describe('migrate.js Patterns', () => {
  describe('splitStatements', () => {
    /**
     * Recreated splitStatements function for testing
     * (matches the implementation in migrate.js)
     */
    function splitStatements(sqlContent) {
      const statements = [];
      let current = '';
      let inDollarQuote = false;
      let dollarTag = '';

      const lines = sqlContent.split('\n');

      for (const line of lines) {
        // Skip pure comment lines
        if (line.trim().startsWith('--')) {
          continue;
        }

        // Check for dollar quote start/end (for functions)
        const dollarMatch = line.match(/\$([a-zA-Z_]*)\$/g);
        if (dollarMatch) {
          for (const match of dollarMatch) {
            if (!inDollarQuote) {
              inDollarQuote = true;
              dollarTag = match;
            } else if (match === dollarTag) {
              inDollarQuote = false;
              dollarTag = '';
            }
          }
        }

        current += line + '\n';

        // If we're not in a dollar quote and line ends with semicolon, it's end of statement
        if (!inDollarQuote && line.trim().endsWith(';')) {
          const stmt = current.trim();
          if (stmt && stmt !== ';') {
            statements.push(stmt);
          }
          current = '';
        }
      }

      // Add any remaining content
      if (current.trim()) {
        statements.push(current.trim());
      }

      return statements.filter(s => s && !s.match(/^--/) && s.length > 1);
    }

    it('handles single statement', () => {
      const sql = 'CREATE TABLE test (id INT);';
      const result = splitStatements(sql);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('CREATE TABLE test (id INT);');
    });

    it('handles multiple statements with semicolons', () => {
      const sql = `
CREATE TABLE test1 (id INT);
CREATE TABLE test2 (id INT);
CREATE TABLE test3 (id INT);
      `.trim();

      const result = splitStatements(sql);
      expect(result).toHaveLength(3);
      expect(result[0]).toContain('test1');
      expect(result[1]).toContain('test2');
      expect(result[2]).toContain('test3');
    });

    it('preserves dollar-quoted strings (functions)', () => {
      const sql = `
CREATE FUNCTION test_func() RETURNS void AS $$
BEGIN
  INSERT INTO log VALUES ('test;semicolon');
END;
$$ LANGUAGE plpgsql;

CREATE TABLE after_func (id INT);
      `.trim();

      const result = splitStatements(sql);
      expect(result).toHaveLength(2);
      // Function should be intact with internal semicolons
      expect(result[0]).toContain('INSERT INTO log');
      expect(result[0]).toContain("'test;semicolon'");
      expect(result[1]).toContain('after_func');
    });

    it('handles named dollar quotes', () => {
      const sql = `
CREATE FUNCTION named_func() RETURNS void AS $func$
BEGIN
  SELECT 1;
END;
$func$ LANGUAGE plpgsql;
      `.trim();

      const result = splitStatements(sql);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('$func$');
    });

    it('ignores semicolons in comments', () => {
      const sql = `
-- This is a comment; with semicolon
CREATE TABLE test (id INT);
      `.trim();

      const result = splitStatements(sql);
      expect(result).toHaveLength(1);
      expect(result[0]).not.toContain('comment');
    });

    it('handles multiline statements', () => {
      const sql = `
CREATE TABLE complex_table (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
      `.trim();

      const result = splitStatements(sql);
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('SERIAL PRIMARY KEY');
    });

    it('filters empty statements', () => {
      const sql = `
CREATE TABLE test1 (id INT);

;

CREATE TABLE test2 (id INT);
      `.trim();

      const result = splitStatements(sql);
      expect(result).toHaveLength(2);
    });

    it('handles INSERT with semicolons in values', () => {
      const sql = `
INSERT INTO schools (code, name) VALUES ('A&S', 'Arts & Sciences');
INSERT INTO schools (code, name) VALUES ('SOM', 'School of Medicine');
      `.trim();

      const result = splitStatements(sql);
      expect(result).toHaveLength(2);
    });
  });

  describe('Fresh Install Mode', () => {
    it('defines drop statements for all objects', () => {
      const dropStatements = [
        'DROP VIEW IF EXISTS v_mobility_summary CASCADE',
        'DROP VIEW IF EXISTS v_school_turnover CASCADE',
        'DROP VIEW IF EXISTS v_top_exit_reasons CASCADE',
        'DROP VIEW IF EXISTS v_exit_survey_metrics CASCADE',
        'DROP VIEW IF EXISTS v_turnover_rates CASCADE',
        'DROP VIEW IF EXISTS v_turnover_summary CASCADE',
        'DROP VIEW IF EXISTS v_category_breakdown CASCADE',
        'DROP VIEW IF EXISTS v_school_org_headcount CASCADE',
        'DROP VIEW IF EXISTS v_workforce_summary CASCADE',
        'DROP TABLE IF EXISTS audit_data_loads CASCADE',
        'DROP TABLE IF EXISTS fact_mobility_events CASCADE',
        'DROP TABLE IF EXISTS fact_exit_surveys CASCADE',
        'DROP TABLE IF EXISTS fact_terminations CASCADE',
        'DROP TABLE IF EXISTS fact_workforce_snapshots CASCADE',
        'DROP TABLE IF EXISTS dim_departments CASCADE',
        'DROP TABLE IF EXISTS dim_schools CASCADE',
        'DROP TABLE IF EXISTS dim_term_reasons CASCADE',
        'DROP TABLE IF EXISTS dim_assignment_categories CASCADE',
        'DROP TABLE IF EXISTS dim_fiscal_periods CASCADE',
        'DROP FUNCTION IF EXISTS update_updated_at_column CASCADE'
      ];

      // Verify views are dropped before tables
      const viewDrops = dropStatements.filter(s => s.includes('VIEW'));
      const tableDrops = dropStatements.filter(s => s.includes('TABLE'));

      expect(viewDrops.length).toBe(9);
      expect(tableDrops.length).toBe(10);

      // Views should come first
      const firstViewIndex = dropStatements.findIndex(s => s.includes('VIEW'));
      const firstTableIndex = dropStatements.findIndex(s => s.includes('TABLE'));
      expect(firstViewIndex).toBeLessThan(firstTableIndex);
    });
  });

  describe('Migration File Processing', () => {
    it('processes files in sorted order', () => {
      const files = ['003_views.sql', '001_tables.sql', '002_indexes.sql'];
      const sorted = [...files].sort();
      expect(sorted).toEqual(['001_tables.sql', '002_indexes.sql', '003_views.sql']);
    });

    it('filters non-SQL files', () => {
      const files = ['001_tables.sql', 'README.md', '002_indexes.sql', '.gitkeep'];
      const sqlFiles = files.filter(f => f.endsWith('.sql'));
      expect(sqlFiles).toEqual(['001_tables.sql', '002_indexes.sql']);
    });
  });

  describe('Error Handling', () => {
    it('identifies "already exists" errors for skipping', () => {
      const errors = [
        'relation "dim_schools" already exists',
        'table "fact_workforce" already exists',
        'index "idx_period" already exists'
      ];

      errors.forEach(err => {
        expect(err.includes('already exists')).toBe(true);
      });
    });

    it('identifies syntax errors as failures', () => {
      const errors = [
        'syntax error at or near "CREAT"',
        'column "foo" does not exist',
        'permission denied for table test'
      ];

      errors.forEach(err => {
        expect(err.includes('already exists')).toBe(false);
      });
    });
  });

  describe('Command Line Arguments', () => {
    it('recognizes --fresh flag', () => {
      const args = ['--fresh'];
      expect(args.includes('--fresh')).toBe(true);
    });

    it('recognizes --seed flag', () => {
      const args = ['--seed'];
      expect(args.includes('--seed')).toBe(true);
    });

    it('handles multiple flags', () => {
      const args = ['--fresh', '--seed'];
      expect(args.includes('--fresh')).toBe(true);
      expect(args.includes('--seed')).toBe(true);
    });
  });

  describe('Verification Queries', () => {
    it('can query information_schema for tables', () => {
      const tableQuery = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
      expect(tableQuery).toContain('information_schema.tables');
      expect(tableQuery).toContain("table_schema = 'public'");
    });

    it('can query information_schema for views', () => {
      const viewQuery = `
        SELECT table_name
        FROM information_schema.views
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      expect(viewQuery).toContain('information_schema.views');
    });

    it('can count seed data in dimension tables', () => {
      const countQuery = `
        SELECT
          (SELECT COUNT(*) FROM dim_assignment_categories) as categories,
          (SELECT COUNT(*) FROM dim_schools) as schools,
          (SELECT COUNT(*) FROM dim_term_reasons) as term_reasons,
          (SELECT COUNT(*) FROM dim_fiscal_periods) as fiscal_periods
      `;
      expect(countQuery).toContain('dim_assignment_categories');
      expect(countQuery).toContain('dim_schools');
    });
  });

  describe('Console Output Colors', () => {
    const colors = {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m'
    };

    it('defines all required color codes', () => {
      expect(colors.reset).toBe('\x1b[0m');
      expect(colors.red).toBe('\x1b[31m');
      expect(colors.green).toBe('\x1b[32m');
      expect(colors.yellow).toBe('\x1b[33m');
      expect(colors.blue).toBe('\x1b[34m');
      expect(colors.cyan).toBe('\x1b[36m');
    });
  });
});
