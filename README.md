# Flux-SCM 供应商分析平台

> 面向小批量、多品种采购场景的供应商与供应链管理平台
> 当前版本：**v0.7.2** · 技术栈：React 18 + Express 5 + sql.js

Flux-SCM 是一套面向中小型制造业的供应链管理平台，融合卡拉杰克矩阵、QCDS 绩效评分、ABC-XYZ 物料分类、TCO 总拥有成本、Should-Cost 应该成本分析等经典方法论，覆盖从供应商准入、资质管理、绩效评估，到物料分类、采购订单、成本分析、风险预警的完整闭环。

## 功能特性

### 核心业务模块
- **决策看板** — KPI 卡片、采购成本趋势、风险预警列表，全局掌控供应链健康度
- **供应商管理** — 全生命周期管理（待审核 / 试用 / 合格 / 暂停 / 黑名单），含资质证书、联系人信息
- **卡拉杰克矩阵** — 利润影响 × 供应风险双维度，自动归类战略型 / 杠杆型 / 瓶颈型 / 非关键型，给出差异化策略
- **QCDS 绩效评分** — 质量 + 成本 + 交付 + 服务四维加权评分，自动评定 A/B/C/D 等级
- **物料管理** — 物料编码、规格、安全库存、采购提前期、ABC-XYZ 分类
- **ABC-XYZ 矩阵** — 价值维度 × 波动性维度九宫格，差异化库存策略
- **采购订单** — 完整生命周期（草稿→提交→确认→部分交付→交付→关闭），状态机白名单校验
- **TCO 总拥有成本** — 10 维度成本分解（采购价 + 运费 + 检验 + 仓储 + 质量损失 + 延迟 + 管理 + 退货 + 保修 + 机会成本）
- **Should-Cost 应该成本** — 6 维度成本结构反推合理价格（材料 + 人工 + 间接 + 设备 + 物流 + 利润）
- **供应商积分卡** — QCDS + 创新五维加权评分，按季度周期管理
- **采购优化建议** — 订单合并、MOQ 冲突、替代物料、安全库存建议、集中度分析
- **风险预警** — 证书到期、交付延迟、质量异常、绩效下降、单一来源、过度集中

### 系统特性
- **模块开关** — 订单管理、采购优化可通过设置开关动态启停，状态持久化到 localStorage
- **级联删除** — 删除供应商 / 物料 / 订单时自动清理关联数据，避免孤儿记录
- **状态机校验** — 订单状态流转白名单，防止非法状态变更
- **数据持久化** — SQLite 数据库文件，每次写操作自动落盘
- **种子数据** — 首次启动自动注入 7 家供应商、9 种物料、7 笔订单、5 条预警、5 条 TCO、4 条 Should-Cost、6 张积分卡

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React + TypeScript | 18.3 + 5.6 |
| UI 组件库 | Ant Design | 5.22 |
| 图表 | ECharts (echarts-for-react) | 5.5 |
| 路由 | React Router | 6.28 |
| 状态管理 | Zustand | 5.0 |
| 构建工具 | Vite | 5.4 |
| 后端框架 | Express | 5.2 |
| 数据库 | sql.js (SQLite WASM) | 1.14 |
| 数据校验 | 内置校验 + uuid | 14.0 |
| 开发工具 | tsx + concurrently | 4.19 + 9.1 |
| 测试框架 | Vitest + Testing Library | 2.1 + 16.0 |

> **注**：项目预留了 Electron 桌面端壳子（`electron/` 目录），但当前 `package.json` 未安装 electron 依赖，主要运行模式为 Web 应用（前后端分离）。

## 快速开始

### 环境要求
- Node.js ≥ 18（推荐 20+）
- npm ≥ 9

### 安装与运行

```bash
# 1. 安装依赖
npm install

# 2. 开发模式（同时启动后端 + 前端）
npm run dev
#   后端：http://localhost:3456  (Express + sql.js)
#   前端：http://localhost:5173  (Vite Dev Server)

# 3. 生产构建
npm run build              # 输出到 dist/

# 4. 预览生产构建
npm run preview            # http://localhost:4173

# 5. 单独启动后端
npm run server

# 6. 运行单元测试
npm test                   # watch 模式
npm run test:run           # 单次运行
```

### npm scripts 说明

| 命令 | 作用 |
|------|------|
| `dev` | 同时启动后端 (tsx) 和前端 (vite) |
| `dev:server` | 仅启动后端服务 |
| `dev:vite` | 仅启动前端开发服务器 |
| `build` | Vite 生产打包，产物在 `dist/` |
| `preview` | 预览生产构建 |
| `server` | 启动后端服务（等同 dev:server） |
| `test` | Vitest watch 模式 |
| `test:run` | Vitest 单次运行 |

## 项目结构

```
flux-scm/
├── server/                          # 后端服务（Express + sql.js）
│   ├── index.ts                     # 服务入口，路由挂载，自动落盘中间件
│   ├── database.ts                  # 数据库初始化、建表、种子数据
│   ├── dbHelper.ts                  # queryAll / queryOne / run 封装（run 自动 saveDb）
│   └── routes/                      # 14 个业务路由
│       ├── suppliers.ts             # 供应商 CRUD + 级联删除
│       ├── materials.ts             # 物料 CRUD + 级联删除
│       ├── orders.ts                # 订单 CRUD + 状态机校验 + 物料明细联动
│       ├── dashboard.ts             # KPI 统计 + 成本趋势
│       ├── riskAlerts.ts            # 风险预警
│       ├── scorecards.ts            # 供应商积分卡
│       ├── tco.ts                   # TCO 总拥有成本
│       ├── shouldCost.ts            # Should-Cost 应该成本
│       ├── safetyStock.ts           # 安全库存建议（金额→数量单位换算）
│       ├── consolidation.ts         # 订单合并建议
│       ├── moqConflicts.ts          # MOQ 最小起订量冲突
│       ├── alternatives.ts         # 替代物料建议
│       ├── concentration.ts         # 供应商集中度分析
│       ├── procurementStrategy.ts  # 采购策略推荐
│       └── supplierMaterialMatrix.ts # 供应商-物料矩阵
│
├── src/                             # 前端 React 应用
│   ├── components/
│   │   ├── layout/                  # AppLayout / Header / Sidebar
│   │   ├── dashboard/               # KpiCards / CostTrend / RiskAlertList
│   │   ├── supplier/                # 列表 / 表单 / 卡拉杰克视图 / 绩效雷达 / 资质表
│   │   ├── material/                # 列表 / 表单 / ABC-XYZ 视图
│   │   ├── order/                   # 订单列表 / 订单表单（含动态物料明细）
│   │   └── common/                  # HelpPanel 帮助面板
│   ├── pages/                       # 10 个页面
│   │   ├── Dashboard.tsx            # 决策看板
│   │   ├── Suppliers.tsx            # 供应商管理
│   │   ├── Materials.tsx            # 物料管理
│   │   ├── Orders.tsx               # 订单管理（模块开关控制）
│   │   ├── TCO.tsx                  # TCO 分析
│   │   ├── ShouldCost.tsx           # 应该成本分析
│   │   ├── Scorecards.tsx           # 供应商积分卡
│   │   ├── ProcurementOptimization.tsx # 采购优化建议
│   │   ├── ProcurementStrategy.tsx  # 采购策略
│   │   └── Settings.tsx             # 系统设置
│   ├── stores/
│   │   └── moduleStore.ts           # Zustand 模块开关状态
│   ├── types/                       # TypeScript 类型定义
│   │   ├── common.ts                # 卡拉杰克象限、绩效等级、风险等级
│   │   ├── supplier.ts
│   │   ├── material.ts
│   │   └── order.ts                 # 订单状态机类型
│   ├── utils/                       # 业务算法
│   │   ├── kraljic.ts               # 卡拉杰克象限计算
│   │   ├── scoring.ts               # QCDS 评分与等级
│   │   ├── abcxyz.ts                # ABC-XYZ 分类
│   │   └── coding.ts               # 物料编码生成
│   ├── App.tsx                      # 路由配置
│   └── main.tsx                    # React 入口
│
├── electron/                        # Electron 桌面端壳子（预留，未启用）
│   ├── main.ts                     # 主进程：无边框窗口 + IPC
│   └── preload.ts                  # 预加载脚本
│
├── tests/unit/                      # 单元测试
│   ├── kraljic.test.ts              # 卡拉杰克象限测试
│   ├── scoring.test.ts              # QCDS 评分测试
│   ├── abcxyz.test.ts               # ABC-XYZ 分类测试
│   └── coding.test.ts               # 物料编码测试
│
├── data/                            # 运行时生成
│   └── flux-scm.db                  # SQLite 数据库文件（首次运行自动创建）
│
├── vite.config.ts                   # Vite 配置（@ 别名、base 相对路径）
├── vitest.config.ts                 # Vitest 配置（jsdom 环境）
├── tsconfig.json                    # TypeScript 配置
├── electron-builder.yml             # Electron 打包配置（预留）
└── package.json
```

## 后端 API 一览

所有 API 前缀 `/api`，后端默认端口 `3456`。

### 供应商
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/suppliers` | 列表（支持 search/quadrant/grade/status 筛选） |
| GET | `/api/suppliers/kraljic` | 卡拉杰克矩阵数据 |
| GET | `/api/suppliers/:id` | 详情（含资质 + 联系人） |
| POST | `/api/suppliers` | 新建 |
| PUT | `/api/suppliers/:id` | 编辑 |
| DELETE | `/api/suppliers/:id` | 删除（级联清理资质 + 联系人） |

### 物料
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/materials` | 列表（支持 search/abcClass/xyzClass） |
| GET | `/api/materials/abcxyz` | ABC-XYZ 矩阵数据 |
| GET | `/api/materials/:id` | 详情 |
| POST | `/api/materials` | 新建 |
| PUT | `/api/materials/:id` | 编辑 |
| DELETE | `/api/materials/:id` | 删除（级联清理交付 + 订单明细 + 物料供应商关系） |

### 采购订单
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/orders` | 列表（支持 status 筛选） |
| GET | `/api/orders/:id` | 详情（含物料明细） |
| POST | `/api/orders` | 新建（自动创建明细并重算总额） |
| PUT | `/api/orders/:id` | 编辑 / 状态变更（状态机白名单校验） |
| DELETE | `/api/orders/:id` | 删除（级联清理交付 + 明细） |

### 其他业务接口
| 路径 | 说明 |
|------|------|
| `/api/dashboard/stats` | KPI 统计 |
| `/api/dashboard/cost-trend` | 采购成本趋势 |
| `/api/risk-alerts` | 风险预警 |
| `/api/scorecards` | 供应商积分卡 |
| `/api/tco` | TCO 总拥有成本 |
| `/api/should-cost` | Should-Cost 应该成本 |
| `/api/safety-stock` | 安全库存建议（金额→数量换算） |
| `/api/consolidation` | 订单合并建议 |
| `/api/moq-conflicts` | MOQ 冲突检测 |
| `/api/alternatives` | 替代物料建议 |
| `/api/concentration` | 供应商集中度分析 |
| `/api/procurement-strategy` | 采购策略推荐 |
| `/api/supplier-material-matrix` | 供应商-物料矩阵 |
| `/api/health` | 健康检查（含版本号） |

## 数据库设计

使用 sql.js（SQLite WASM），共 12 张表，数据库文件存于 `data/flux-scm.db`：

| 表名 | 说明 | 主要字段 |
|------|------|---------|
| `suppliers` | 供应商主表 | name / category / kraljic_quadrant / performance_grade / 4 维评分 |
| `supplier_qualifications` | 资质证书 | cert_type / expiry_date / status |
| `supplier_contacts` | 联系人 | name / phone / is_primary |
| `materials` | 物料主表 | code / abc_class / xyz_class / annual_consumption_value / coefficient_of_variation |
| `material_suppliers` | 物料-供应商关系 | unit_price / min_order_qty / is_preferred |
| `purchase_orders` | 采购订单 | order_no / status / total_amount / payment_term |
| `order_items` | 订单明细 | quantity / unit_price / amount / delivered_qty |
| `deliveries` | 交付记录 | delivery_date / qualified_qty / inspection_result |
| `risk_alerts` | 风险预警 | alert_type / level / status |
| `tco_analyses` | TCO 分析 | 10 维成本 + total_tco |
| `should_cost_analyses` | Should-Cost | 6 维成本 + should_cost_total + variance_pct |
| `supplier_scorecards` | 供应商积分卡 | 5 维评分 + 加权 + grade + period |

## 核心方法论

### 1. 卡拉杰克矩阵 (Kraljic Matrix)

由彼得·卡拉杰克于 1983 年提出，从**利润影响**与**供应风险**双维度对采购品项分类：

| 象限 | 利润影响 | 供应风险 | 策略建议 |
|------|---------|---------|---------|
| **战略型 (Strategic)** | 高 | 高 | 深度合作，建立战略联盟 |
| **杠杆型 (Leverage)** | 高 | 低 | 竞争性招标，充分利用买方地位 |
| **瓶颈型 (Bottleneck)** | 低 | 高 | 保障供应，建立安全库存 |
| **非关键型 (Non-critical)** | 低 | 低 | 简化流程，最小化管理成本 |

### 2. QCDS 绩效评分

四维加权评分模型：

| 维度 | 默认权重 | 数据来源 |
|------|---------|---------|
| Quality 质量 | 30% | 来料合格率 |
| Cost 成本 | 25% | 价格竞争力 |
| Delivery 交付 | 30% | 准时交付率 |
| Service 服务 | 15% | 服务响应评价 |

综合评分对应等级：**A (≥90) · B (≥80) · C (≥70) · D (<70)**

权重可在「系统设置 → 评分权重」中调整，校验总和必须为 100%。

### 3. ABC-XYZ 矩阵

**ABC 分类**（按价值）：
- **A 类** — 累计金额占比前 80% 的高价值物料
- **B 类** — 累计金额占比 80%-95% 的中价值物料
- **C 类** — 累计金额占比 95%-100% 的低价值物料

**XYZ 分类**（按需求波动性，变异系数 CV）：
- **X 类** — CV < 0.5，需求稳定
- **Y 类** — 0.5 ≤ CV < 1.0，需求波动
- **Z 类** — CV ≥ 1.0，需求不规律

九宫格交叉形成差异化的安全库存与补货策略。

### 4. 安全库存算法

基于 ABC-XYZ 分类 + 采购提前期 + 日均需求量：

```
suggested_qty = ROUND(daily_demand_qty × suggested_days)
daily_demand_qty = 年消耗金额 / 250工作日 / 平均单价
suggested_days = ROUND(lead_time × buffer_factor)
```

**单位换算要点**：`annual_consumption_value` 是金额（元），`safety_stock` 是数量（件），必须通过 `material_suppliers.unit_price` 的平均值换算，否则单位混淆。

九宫格缓冲系数 `buffer_factor`：

| | X (稳定) | Y (波动) | Z (不规律) |
|---|---|---|---|
| **A (高价值)** | 1.0 标准缓冲 | 1.5 较高缓冲 | 2.5 高缓冲 |
| **B (中价值)** | 1.2 低缓冲 | 1.8 标准缓冲 | 2.2 较高缓冲 |
| **C (低价值)** | 1.5 极低缓冲 | 2.0 低缓冲 | 3.0 标准缓冲 |

### 5. TCO 总拥有成本

10 维度成本分解：

```
TCO = 采购价 + 运费 + 检验费 + 仓储费 + 质量损失 + 延迟成本
     + 管理成本 + 退货成本 + 保修成本 + 机会成本
```

### 6. Should-Cost 应该成本

6 维度成本结构反推合理价格：

```
应该成本 = 材料成本 + 人工成本 + 间接成本 + 设备成本 + 物流成本 + 合理利润
差异率 = (报价 - 应该成本) / 应该成本 × 100%
```

### 7. 订单状态机

采购订单生命周期状态流转白名单：

```
draft ──→ submitted ──→ confirmed ──→ partial_delivered ──→ delivered ──→ closed
  │           │             │                │
  └──→ cancelled ←─┴─────────┴────────────────┘
```

非法状态变更（如 delivered → draft）会被后端拒绝并返回 400。

## 模块开关机制

通过 Zustand 管理两个可选模块的开关状态，持久化到 localStorage：

| 模块 | 默认 | 控制范围 |
|------|------|---------|
| `orderManagement` | 关闭 | 订单管理菜单与页面 |
| `procurementOptimization` | 开启 | 采购优化菜单与页面 |

在「系统设置 → 模块管理」中切换。

## 种子数据

首次启动且数据库为空时自动注入演示数据：

- **7 家供应商**：精密机械、华通电子、恒力弹簧、诚信办公、东方磁材、永泰橡胶、宏达电机
- **9 种物料**：覆盖 ABC-XYZ 各分类，含螺栓、电阻、弹簧、磁钢、密封圈、电机、外壳、电容、纸箱
- **7 笔订单**：覆盖 delivered / confirmed / submitted / draft 各状态
- **5 条风险预警**：证书到期、交付延迟、单一来源、绩效下降、集中度
- **5 条 TCO 分析** + **4 条 Should-Cost 分析** + **6 张积分卡**

## 单元测试

覆盖核心业务算法：

```bash
npm run test:run
```

| 测试文件 | 覆盖范围 |
|---------|---------|
| `kraljic.test.ts` | 卡拉杰克象限归类逻辑 |
| `scoring.test.ts` | QCDS 评分计算与等级划分 |
| `abcxyz.test.ts` | ABC-XYZ 分类阈值 |
| `coding.test.ts` | 物料编码生成规则 |

## 已知问题与优化方向

### 已修复（v0.7.2 本轮）
- ✅ **评分权重校验逻辑错误** — 滑块输入是百分比 (0-100)，但校验逻辑用 `total-1.0`，导致永远失败无法保存
- ✅ **安全库存单位混淆** — 把金额（元）当数量（件）算安全库存，已改为通过平均单价正确换算
- ✅ **物料级联删除不完整** — 删物料时漏删 deliveries 和 order_items，留下孤儿数据

### 待优化
- ⚠️ **Vite 未配置 dev proxy** — 开发模式下前端 `fetch('/api/...')` 会打到 5173 端口而非 3456 后端，需要在 `vite.config.ts` 添加 `server.proxy['/api']` 配置
- ⚠️ **路由使用 BrowserRouter** — 若未来启用 Electron file:// 协议，需改为 HashRouter
- ⚠️ **Dashboard / Materials 仍用 mock 数据** — 尚未接入真实 API
- ⚠️ **TCO / ShouldCost / Scorecards 路由缺少 asyncHandler** — 错误处理不统一，缺少必填校验和 404 检查
- ⚠️ **bundle 体积偏大** — 生产构建 2.3MB，建议做代码分割（动态 import / manualChunks）

## 版本记录

- **v0.7.2**（当前）— 修复评分权重校验、安全库存单位、物料级联删除三个严重 Bug
- 后续迭代规划：补齐 dev proxy、统一路由错误处理、Dashboard/Materials 接入真实 API

## License

私有项目，未授权不得商用。
