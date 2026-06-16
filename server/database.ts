import initSqlJs, { Database } from 'sql.js';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'flux-scm.db');

let db: Database;
let initialized = false;

export async function initDb(): Promise<Database> {
  if (initialized && db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const SQL = await initSqlJs();

  // 如果数据库文件存在，加载它
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  initializeTables(db);
  seedIfNeeded(db);
  saveDb();

  initialized = true;
  return db;
}

export function getDb(): Database {
  if (!initialized || !db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

// 保存数据库到文件
export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function initializeTables(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT,
      unified_code TEXT, category TEXT, kraljic_quadrant TEXT,
      profit_impact_score REAL DEFAULT 0, supply_risk_score REAL DEFAULT 0,
      performance_grade TEXT, overall_score REAL DEFAULT 0,
      quality_score REAL DEFAULT 0, cost_score REAL DEFAULT 0,
      delivery_score REAL DEFAULT 0, service_score REAL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      address TEXT, contact_person TEXT, contact_phone TEXT, contact_email TEXT,
      bank_name TEXT, bank_account TEXT, remark TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS supplier_qualifications (
      id TEXT PRIMARY KEY, supplier_id TEXT NOT NULL,
      cert_type TEXT NOT NULL, cert_number TEXT,
      issue_date TEXT, expiry_date TEXT, file_path TEXT,
      status TEXT NOT NULL DEFAULT 'valid', remark TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS supplier_contacts (
      id TEXT PRIMARY KEY, supplier_id TEXT NOT NULL,
      name TEXT NOT NULL, position TEXT, phone TEXT, email TEXT,
      is_primary INTEGER DEFAULT 0, remark TEXT
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL, specification TEXT, unit TEXT NOT NULL,
      category TEXT, material_type TEXT,
      safety_stock REAL DEFAULT 0, lead_time INTEGER DEFAULT 0,
      drawing_no TEXT, abc_class TEXT, xyz_class TEXT,
      annual_consumption_value REAL DEFAULT 0, coefficient_of_variation REAL DEFAULT 0,
      remark TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS material_suppliers (
      id TEXT PRIMARY KEY, material_id TEXT NOT NULL,
      supplier_id TEXT NOT NULL,
      unit_price REAL, min_order_qty INTEGER DEFAULT 1,
      lead_time_days INTEGER, is_preferred INTEGER DEFAULT 0,
      last_quote_date TEXT, remark TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY, order_no TEXT NOT NULL UNIQUE,
      supplier_id TEXT NOT NULL,
      title TEXT, status TEXT NOT NULL DEFAULT 'draft',
      total_amount REAL DEFAULT 0, order_date TEXT,
      expected_date TEXT, payment_term TEXT,
      remark TEXT, created_by TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL,
      material_id TEXT NOT NULL,
      quantity REAL NOT NULL, unit_price REAL NOT NULL,
      amount REAL NOT NULL, delivered_qty REAL DEFAULT 0,
      qualified_qty REAL DEFAULT 0, expected_date TEXT, remark TEXT
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL,
      order_item_id TEXT NOT NULL,
      delivery_date TEXT NOT NULL, quantity REAL NOT NULL,
      qualified_qty REAL DEFAULT 0, inspection_result TEXT,
      inspection_remark TEXT, created_at TEXT NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS risk_alerts (
      id TEXT PRIMARY KEY, supplier_id TEXT,
      alert_type TEXT NOT NULL, level TEXT NOT NULL,
      title TEXT NOT NULL, description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      resolved_at TEXT, created_at TEXT NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS tco_analyses (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL, material_id TEXT NOT NULL,
      purchase_price REAL DEFAULT 0,
      freight_cost REAL DEFAULT 0, inspection_cost REAL DEFAULT 0,
      storage_cost REAL DEFAULT 0, quality_loss_cost REAL DEFAULT 0,
      delay_cost REAL DEFAULT 0, admin_cost REAL DEFAULT 0,
      return_cost REAL DEFAULT 0, warranty_cost REAL DEFAULT 0,
      opportunity_cost REAL DEFAULT 0, total_tco REAL DEFAULT 0,
      remark TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS should_cost_analyses (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL, material_id TEXT NOT NULL,
      material_cost REAL DEFAULT 0, labor_cost REAL DEFAULT 0,
      overhead_cost REAL DEFAULT 0, equipment_cost REAL DEFAULT 0,
      logistics_cost REAL DEFAULT 0, profit_margin REAL DEFAULT 0,
      should_cost_total REAL DEFAULT 0,
      quoted_price REAL DEFAULT 0, variance_pct REAL DEFAULT 0,
      remark TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS supplier_scorecards (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL,
      quality_score REAL DEFAULT 0, quality_weight REAL DEFAULT 0.30,
      cost_score REAL DEFAULT 0, cost_weight REAL DEFAULT 0.25,
      delivery_score REAL DEFAULT 0, delivery_weight REAL DEFAULT 0.25,
      service_score REAL DEFAULT 0, service_weight REAL DEFAULT 0.10,
      innovation_score REAL DEFAULT 0, innovation_weight REAL DEFAULT 0.10,
      weighted_total REAL DEFAULT 0,
      grade TEXT, period TEXT,
      remark TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
  `);
}

function genId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

function seedIfNeeded(db: Database) {
  const result = db.exec('SELECT COUNT(*) as c FROM suppliers');
  const count = result[0]?.values[0]?.[0] as number || 0;
  if (count > 0) return;

  const suppliers = [
    [genId(), '精密机械制造有限公司', '精密机械', '机加类', 'strategic', 85, 80, 'A', 88.5, 90, 85, 92, 85, 'active', '张经理', '021-55551001', now(), now()],
    [genId(), '华通电子科技有限公司', '华通电子', '元件类', 'leverage', 75, 30, 'B', 82.0, 85, 80, 82, 78, 'active', '李总', '010-66662002', now(), now()],
    [genId(), '恒力弹簧厂', '恒力弹簧', '弹簧类', 'bottleneck', 25, 85, 'C', 72.5, 75, 70, 72, 68, 'active', '王工', '0571-77773003', now(), now()],
    [genId(), '诚信办公用品商行', '诚信办公', '办公用品', 'non_critical', 15, 10, 'B', 81.0, 88, 78, 80, 75, 'active', '赵经理', '0755-88884004', now(), now()],
    [genId(), '东方磁材科技有限公司', '东方磁材', '磁钢类', 'strategic', 78, 72, 'A', 91.2, 95, 88, 90, 90, 'active', '陈总', '0571-88881234', now(), now()],
    [genId(), '永泰橡胶制品厂', '永泰橡胶', '橡胶类', 'leverage', 60, 25, 'B', 79.5, 82, 76, 80, 77, 'active', '刘经理', '0755-66667890', now(), now()],
    [genId(), '宏达电机有限公司', '宏达电机', '电机类', 'bottleneck', 35, 78, 'C', 68.0, 70, 65, 68, 62, 'trial', '周工', '010-99995555', now(), now()],
  ];

  for (const s of suppliers) {
    db.run(`INSERT INTO suppliers (id, name, short_name, category, kraljic_quadrant, profit_impact_score, supply_risk_score,
      performance_grade, overall_score, quality_score, cost_score, delivery_score, service_score,
      status, contact_person, contact_phone, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, s);
  }

  const materials = [
    [genId(), 'JJ-SS-M8-JM-001', '不锈钢六角螺栓', 'M8x50', '个', '机加类', '不锈钢', 500, 7, 'A', 'X', 85000, 0.12, '', now(), now()],
    [genId(), 'YJ-CU-R10-HT-001', '铜制电阻元件', 'R10', '只', '元件类', '铜', 200, 14, 'A', 'Y', 62000, 0.65, '', now(), now()],
    [genId(), 'TH-SS-C20-HL-001', '压缩弹簧', 'C20x35', '件', '弹簧类', '不锈钢', 100, 21, 'B', 'Z', 35000, 1.2, '', now(), now()],
    [genId(), 'CG-NF-N35-DF-001', '钕铁硼磁钢', 'N35-D20x5', '片', '磁钢类', '磁材', 300, 30, 'A', 'X', 120000, 0.08, '', now(), now()],
    [genId(), 'XJ-NR-D10-YT-001', 'O型密封圈', 'D10x2', '个', '橡胶类', '橡胶', 1000, 5, 'C', 'X', 8000, 0.15, '', now(), now()],
    [genId(), 'DJ-BL-57-YT-002', '步进电机', '57BYG', '台', '电机类', '碳钢', 20, 45, 'B', 'Y', 48000, 0.72, '', now(), now()],
    [genId(), 'JJ-AL-CNC-JM-002', '铝合金外壳', 'CNC-200', '件', '机加类', '铝合金', 50, 14, 'A', 'Y', 95000, 0.55, '', now(), now()],
    [genId(), 'YJ-PC-0805-HT-002', '贴片电容', '0805-100nF', '只', '元件类', '塑料', 5000, 3, 'C', 'X', 5000, 0.1, '', now(), now()],
    [genId(), 'BZ-PP-400-CX-001', '包装纸箱', '400x300x200', '个', '包装箱', '塑料', 200, 7, 'C', 'Z', 3000, 1.5, '', now(), now()],
  ];

  for (const m of materials) {
    db.run(`INSERT INTO materials (id, code, name, specification, unit, category, material_type,
      safety_stock, lead_time, abc_class, xyz_class, annual_consumption_value, coefficient_of_variation,
      remark, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, m);
  }

  // 获取供应商ID用于订单
  const supplierResult = db.exec('SELECT id FROM suppliers');
  const supplierIds = supplierResult[0]?.values.map(r => r[0] as string) || [];

  const orders = [
    [genId(), 'PO-2026-0001', supplierIds[0] || '', '精密机械-齿轮组件采购', 'delivered', 128000, '2026-05-15', '2026-06-15', now(), now()],
    [genId(), 'PO-2026-0002', supplierIds[1] || '', '华通电子-电阻元件采购', 'confirmed', 45000, '2026-06-01', '2026-06-25', now(), now()],
    [genId(), 'PO-2026-0003', supplierIds[2] || '', '恒力弹簧-压缩弹簧采购', 'submitted', 18000, '2026-06-10', '2026-07-01', now(), now()],
    [genId(), 'PO-2026-0004', supplierIds[4] || '', '东方磁材-钕铁硼磁钢采购', 'delivered', 96000, '2026-04-20', '2026-05-20', now(), now()],
    [genId(), 'PO-2026-0005', supplierIds[0] || '', '精密机械-铝合金外壳采购', 'confirmed', 85000, '2026-06-05', '2026-06-30', now(), now()],
    [genId(), 'PO-2026-0006', supplierIds[5] || '', '永泰橡胶-O型圈采购', 'draft', 12000, '2026-06-12', '2026-07-05', now(), now()],
    [genId(), 'PO-2026-0007', supplierIds[6] || '', '宏达电机-步进电机采购', 'submitted', 56000, '2026-06-08', '2026-07-15', now(), now()],
  ];

  for (const o of orders) {
    db.run(`INSERT INTO purchase_orders (id, order_no, supplier_id, title, status, total_amount, order_date, expected_date, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`, o);
  }

  const alerts = [
    [genId(), supplierIds[2] || null, 'cert_expiry', 'high', '恒力弹簧-ISO9001证书即将过期', '证书将于30天后过期', 'active', now()],
    [genId(), supplierIds[2] || null, 'delivery_delay', 'medium', '恒力弹簧-连续2次延迟交付', '最近2次交付均延迟3天以上', 'active', now()],
    [genId(), null, 'single_source', 'high', '弹簧类物料仅有1家供应商', '压缩弹簧仅恒力弹簧1家供应', 'active', now()],
    [genId(), supplierIds[6] || null, 'performance_drop', 'medium', '宏达电机-绩效评级下降', '从B级降至C级', 'active', now()],
    [genId(), null, 'concentration', 'medium', '精密机械采购金额占比超过40%', '建议开发备选供应商', 'active', now()],
  ];

  for (const a of alerts) {
    db.run(`INSERT INTO risk_alerts (id, supplier_id, alert_type, level, title, description, status, created_at) VALUES (?,?,?,?,?,?,?,?)`, a);
  }

  // TCO 种子数据
  const materialResult = db.exec('SELECT id FROM materials');
  const materialIds = materialResult[0]?.values.map(r => r[0] as string) || [];

  const tcoData = [
    [genId(), supplierIds[0] || '', materialIds[0] || '', 12.5, 0.8, 0.3, 0.15, 0.2, 0.1, 0.05, 0.02, 0.01, 0.05, 14.68, '不锈钢螺栓TCO分析', now(), now()],
    [genId(), supplierIds[1] || '', materialIds[1] || '', 8.0, 0.5, 0.2, 0.1, 0.15, 0.08, 0.04, 0.01, 0.01, 0.03, 9.12, '铜制电阻TCO分析', now(), now()],
    [genId(), supplierIds[4] || '', materialIds[3] || '', 25.0, 1.2, 0.5, 0.3, 0.4, 0.15, 0.08, 0.03, 0.02, 0.08, 27.76, '钕铁硼磁钢TCO分析', now(), now()],
    [genId(), supplierIds[2] || '', materialIds[2] || '', 6.0, 0.6, 0.15, 0.08, 0.3, 0.2, 0.06, 0.02, 0.01, 0.04, 7.46, '压缩弹簧TCO分析-高延迟成本', now(), now()],
    [genId(), supplierIds[5] || '', materialIds[4] || '', 1.2, 0.1, 0.05, 0.02, 0.03, 0.01, 0.01, 0.005, 0.002, 0.01, 1.437, 'O型密封圈TCO分析', now(), now()],
  ];

  for (const t of tcoData) {
    db.run(`INSERT INTO tco_analyses (id, supplier_id, material_id, purchase_price, freight_cost, inspection_cost, storage_cost, quality_loss_cost, delay_cost, admin_cost, return_cost, warranty_cost, opportunity_cost, total_tco, remark, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, t);
  }

  // Should-Cost 种子数据
  const shouldCostData = [
    [genId(), supplierIds[0] || '', materialIds[0] || '', 8.0, 1.5, 0.8, 0.5, 0.3, 1.2, 12.3, 12.5, 1.6, '不锈钢螺栓应该成本分析', now(), now()],
    [genId(), supplierIds[1] || '', materialIds[1] || '', 5.5, 0.8, 0.5, 0.3, 0.2, 0.7, 8.0, 8.0, 0.0, '铜制电阻应该成本-合理', now(), now()],
    [genId(), supplierIds[4] || '', materialIds[3] || '', 18.0, 2.5, 1.5, 1.0, 0.8, 2.0, 25.8, 25.0, -3.2, '钕铁硼磁钢应该成本分析', now(), now()],
    [genId(), supplierIds[2] || '', materialIds[2] || '', 4.0, 0.5, 0.3, 0.2, 0.15, 0.5, 5.65, 6.0, 6.2, '压缩弹簧应该成本-偏高', now(), now()],
  ];

  for (const s of shouldCostData) {
    db.run(`INSERT INTO should_cost_analyses (id, supplier_id, material_id, material_cost, labor_cost, overhead_cost, equipment_cost, logistics_cost, profit_margin, should_cost_total, quoted_price, variance_pct, remark, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, s);
  }

  // 供应商积分卡种子数据
  const scorecardData = [
    [genId(), supplierIds[0] || '', 90, 0.30, 85, 0.25, 92, 0.25, 85, 0.10, 88, 0.10, 88.55, 'A', '2026-Q2', '精密机械-Q2评分', now(), now()],
    [genId(), supplierIds[1] || '', 85, 0.30, 80, 0.25, 82, 0.25, 78, 0.10, 75, 0.10, 81.5, 'B', '2026-Q2', '华通电子-Q2评分', now(), now()],
    [genId(), supplierIds[2] || '', 75, 0.30, 70, 0.25, 72, 0.25, 68, 0.10, 60, 0.10, 71.5, 'C', '2026-Q2', '恒力弹簧-Q2评分', now(), now()],
    [genId(), supplierIds[4] || '', 95, 0.30, 88, 0.25, 90, 0.25, 90, 0.10, 92, 0.10, 91.2, 'A', '2026-Q2', '东方磁材-Q2评分', now(), now()],
    [genId(), supplierIds[5] || '', 82, 0.30, 76, 0.25, 80, 0.25, 77, 0.10, 70, 0.10, 78.1, 'B', '2026-Q2', '永泰橡胶-Q2评分', now(), now()],
    [genId(), supplierIds[6] || '', 70, 0.30, 65, 0.25, 68, 0.25, 62, 0.10, 55, 0.10, 65.5, 'C', '2026-Q2', '宏达电机-Q2评分', now(), now()],
  ];

  for (const sc of scorecardData) {
    db.run(`INSERT INTO supplier_scorecards (id, supplier_id, quality_score, quality_weight, cost_score, cost_weight, delivery_score, delivery_weight, service_score, service_weight, innovation_score, innovation_weight, weighted_total, grade, period, remark, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, sc);
  }
}
