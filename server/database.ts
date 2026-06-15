import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'flux-scm.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initializeTables(db);
  seedIfNeeded(db);

  return db;
}

function initializeTables(db: Database.Database) {
  db.exec(`
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
    CREATE TABLE IF NOT EXISTS supplier_qualifications (
      id TEXT PRIMARY KEY, supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      cert_type TEXT NOT NULL, cert_number TEXT,
      issue_date TEXT, expiry_date TEXT, file_path TEXT,
      status TEXT NOT NULL DEFAULT 'valid', remark TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS supplier_contacts (
      id TEXT PRIMARY KEY, supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      name TEXT NOT NULL, position TEXT, phone TEXT, email TEXT,
      is_primary INTEGER DEFAULT 0, remark TEXT
    );
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL, specification TEXT, unit TEXT NOT NULL,
      category TEXT, material_type TEXT,
      safety_stock REAL DEFAULT 0, lead_time INTEGER DEFAULT 0,
      drawing_no TEXT, abc_class TEXT, xyz_class TEXT,
      annual_consumption_value REAL DEFAULT 0, coefficient_of_variation REAL DEFAULT 0,
      remark TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS material_suppliers (
      id TEXT PRIMARY KEY, material_id TEXT NOT NULL REFERENCES materials(id),
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      unit_price REAL, min_order_qty INTEGER DEFAULT 1,
      lead_time_days INTEGER, is_preferred INTEGER DEFAULT 0,
      last_quote_date TEXT, remark TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY, order_no TEXT NOT NULL UNIQUE,
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      title TEXT, status TEXT NOT NULL DEFAULT 'draft',
      total_amount REAL DEFAULT 0, order_date TEXT,
      expected_date TEXT, payment_term TEXT,
      remark TEXT, created_by TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES purchase_orders(id),
      material_id TEXT NOT NULL REFERENCES materials(id),
      quantity REAL NOT NULL, unit_price REAL NOT NULL,
      amount REAL NOT NULL, delivered_qty REAL DEFAULT 0,
      qualified_qty REAL DEFAULT 0, expected_date TEXT, remark TEXT
    );
    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES purchase_orders(id),
      order_item_id TEXT NOT NULL REFERENCES order_items(id),
      delivery_date TEXT NOT NULL, quantity REAL NOT NULL,
      qualified_qty REAL DEFAULT 0, inspection_result TEXT,
      inspection_remark TEXT, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS risk_alerts (
      id TEXT PRIMARY KEY, supplier_id TEXT REFERENCES suppliers(id),
      alert_type TEXT NOT NULL, level TEXT NOT NULL,
      title TEXT NOT NULL, description TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      resolved_at TEXT, created_at TEXT NOT NULL
    );
  `);
}

function genId(): string { return crypto.randomUUID(); }
function now(): string { return new Date().toISOString(); }

function seedIfNeeded(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as c FROM suppliers').get() as { c: number };
  if (count.c > 0) return;

  const insertSupplier = db.prepare(`
    INSERT INTO suppliers (id, name, short_name, category, kraljic_quadrant, profit_impact_score, supply_risk_score,
      performance_grade, overall_score, quality_score, cost_score, delivery_score, service_score,
      status, contact_person, contact_phone, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const suppliers = [
    [genId(), '精密机械制造有限公司', '精密机械', '机加类', 'strategic', 85, 80, 'A', 88.5, 90, 85, 92, 85, 'active', '张经理', '021-55551001', now(), now()],
    [genId(), '华通电子科技有限公司', '华通电子', '元件类', 'leverage', 75, 30, 'B', 82.0, 85, 80, 82, 78, 'active', '李总', '010-66662002', now(), now()],
    [genId(), '恒力弹簧厂', '恒力弹簧', '弹簧类', 'bottleneck', 25, 85, 'C', 72.5, 75, 70, 72, 68, 'active', '王工', '0571-77773003', now(), now()],
    [genId(), '诚信办公用品商行', '诚信办公', '办公用品', 'non_critical', 15, 10, 'B', 81.0, 88, 78, 80, 75, 'active', '赵经理', '0755-88884004', now(), now()],
    [genId(), '东方磁材科技有限公司', '东方磁材', '磁钢类', 'strategic', 78, 72, 'A', 91.2, 95, 88, 90, 90, 'active', '陈总', '0571-88881234', now(), now()],
    [genId(), '永泰橡胶制品厂', '永泰橡胶', '橡胶类', 'leverage', 60, 25, 'B', 79.5, 82, 76, 80, 77, 'active', '刘经理', '0755-66667890', now(), now()],
    [genId(), '宏达电机有限公司', '宏达电机', '电机类', 'bottleneck', 35, 78, 'C', 68.0, 70, 65, 68, 62, 'trial', '周工', '010-99995555', now(), now()],
  ];

  const insertMany = db.transaction((rows: any[][]) => {
    for (const row of rows) insertSupplier.run(...row);
  });
  insertMany(suppliers);

  // 种子物料数据
  const insertMaterial = db.prepare(`
    INSERT INTO materials (id, code, name, specification, unit, category, material_type,
      safety_stock, lead_time, abc_class, xyz_class, annual_consumption_value, coefficient_of_variation,
      remark, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

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

  const insertMaterials = db.transaction((rows: any[][]) => {
    for (const row of rows) insertMaterial.run(...row);
  });
  insertMaterials(materials);

  // 种子订单数据
  const insertOrder = db.prepare(`
    INSERT INTO purchase_orders (id, order_no, supplier_id, title, status, total_amount, order_date, expected_date, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const supplierIds = suppliers.map(s => s[0]);
  const orders = [
    [genId(), 'PO-2026-0001', supplierIds[0], '精密机械-齿轮组件采购', 'delivered', 128000, '2026-05-15', '2026-06-15', now(), now()],
    [genId(), 'PO-2026-0002', supplierIds[1], '华通电子-电阻元件采购', 'confirmed', 45000, '2026-06-01', '2026-06-25', now(), now()],
    [genId(), 'PO-2026-0003', supplierIds[2], '恒力弹簧-压缩弹簧采购', 'submitted', 18000, '2026-06-10', '2026-07-01', now(), now()],
    [genId(), 'PO-2026-0004', supplierIds[4], '东方磁材-钕铁硼磁钢采购', 'delivered', 96000, '2026-04-20', '2026-05-20', now(), now()],
    [genId(), 'PO-2026-0005', supplierIds[0], '精密机械-铝合金外壳采购', 'confirmed', 85000, '2026-06-05', '2026-06-30', now(), now()],
    [genId(), 'PO-2026-0006', supplierIds[5], '永泰橡胶-O型圈采购', 'draft', 12000, '2026-06-12', '2026-07-05', now(), now()],
    [genId(), 'PO-2026-0007', supplierIds[6], '宏达电机-步进电机采购', 'submitted', 56000, '2026-06-08', '2026-07-15', now(), now()],
  ];

  const insertOrders = db.transaction((rows: any[][]) => {
    for (const row of rows) insertOrder.run(...row);
  });
  insertOrders(orders);

  // 种子风险预警数据
  const insertAlert = db.prepare(`
    INSERT INTO risk_alerts (id, supplier_id, alert_type, level, title, description, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const alerts = [
    [genId(), supplierIds[2], 'cert_expiry', 'high', '恒力弹簧-ISO9001证书即将过期', '证书将于30天后过期', 'active', now()],
    [genId(), supplierIds[2], 'delivery_delay', 'medium', '恒力弹簧-连续2次延迟交付', '最近2次交付均延迟3天以上', 'active', now()],
    [genId(), null, 'single_source', 'high', '弹簧类物料仅有1家供应商', '压缩弹簧仅恒力弹簧1家供应', 'active', now()],
    [genId(), supplierIds[6], 'performance_drop', 'medium', '宏达电机-绩效评级下降', '从B级降至C级', 'active', now()],
    [genId(), null, 'concentration', 'medium', '精密机械采购金额占比超过40%', '建议开发备选供应商', 'active', now()],
  ];

  const insertAlerts = db.transaction((rows: any[][]) => {
    for (const row of rows) insertAlert.run(...row);
  });
  insertAlerts(alerts);
}
