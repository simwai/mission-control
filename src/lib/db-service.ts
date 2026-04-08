import { getDatabase } from './db';

/**
 * DBService - Provides a Knex-like fluent interface for database operations.
 * This ensures reusability and decouples business logic from raw SQL.
 */
export class DBService {
  static table(name: string) {
    return new QueryBuilder(name);
  }
}

class QueryBuilder {
  private conditions: { col: string; op: string; val: any }[] = [];
  private limitCount: number | null = null;
  private offsetCount: number | null = null;
  private orderByCol: string | null = null;
  private orderDir: 'ASC' | 'DESC' = 'ASC';

  constructor(private tableName: string) {}

  where(col: string, val: any) {
    this.conditions.push({ col, op: '=', val });
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  offset(n: number) {
    this.offsetCount = n;
    return this;
  }

  orderBy(col: string, dir: 'ASC' | 'DESC' = 'ASC') {
    this.orderByCol = col;
    this.orderDir = dir;
    return this;
  }

  async select(): Promise<any[]> {
    const db = getDatabase();
    let sql = \`SELECT * FROM \${this.tableName}\`;
    const params: any[] = [];

    if (this.conditions.length > 0) {
      sql += ' WHERE ' + this.conditions.map(c => \`\${c.col} \${c.op} ?\`).join(' AND ');
      params.push(...this.conditions.map(c => c.val));
    }

    if (this.orderByCol) {
      sql += \` ORDER BY \${this.orderByCol} \${this.orderDir}\`;
    }

    if (this.limitCount !== null) {
      sql += \` LIMIT ?\`;
      params.push(this.limitCount);
    }

    if (this.offsetCount !== null) {
      sql += \` OFFSET ?\`;
      params.push(this.offsetCount);
    }

    return db.prepare(sql).all(...params);
  }

  async count(): Promise<number> {
    const db = getDatabase();
    let sql = \`SELECT COUNT(*) as count FROM \${this.tableName}\`;
    const params: any[] = [];

    if (this.conditions.length > 0) {
      sql += ' WHERE ' + this.conditions.map(c => \`\${c.col} \${c.op} ?\`).join(' AND ');
      params.push(...this.conditions.map(c => c.val));
    }

    const result = db.prepare(sql).get(...params) as { count: number };
    return result.count;
  }
}
