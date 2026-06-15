import { Database } from 'sql.js';
import { getDb, saveDb } from './database';

// 将 sql.js 的 exec 结果转换为对象数组
export function queryAll(sql: string, params?: any[]): any[] {
  const db = getDb();
  if (params && params.length > 0) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }
  const result = db.exec(sql);
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj: any = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// 查询单条
export function queryOne(sql: string, params?: any[]): any | undefined {
  const results = queryAll(sql, params);
  return results[0];
}

// 执行写操作
export function run(sql: string, params?: any[]): void {
  const db = getDb();
  if (params && params.length > 0) {
    db.run(sql, params);
  } else {
    db.run(sql);
  }
  saveDb();
}
