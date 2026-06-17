# Flux-SCM 供应链管理平台

Flux-SCM 是一款基于 Electron + React 的桌面端供应链管理平台，面向制造业采购与供应链场景，融合卡拉杰克矩阵、QCDS 供应商绩效评分、ABC-XYZ 物料分类等经典方法论，提供从供应商准入到物料分类管理、采购订单全流程的数字化解决方案。

## 功能特性

- **仪表盘** — 关键 KPI 卡片、成本趋势图、风险预警列表，全局掌控供应链健康度
- **供应商管理** — 供应商全生命周期管理，包含准入、试用、合格、暂停、黑名单等状态流转
- **卡拉杰克矩阵** — 基于利润影响与供应风险双维度，将供应商自动归类为战略型/杠杆型/瓶颈型/非关键型，并给出对应策略建议
- **QCDS 绩效评分** — 质量(Quality)、成本(Cost)、交付(Delivery)、服务(Service) 四维加权评分，自动评定 A/B/C/D 等级
- **资质管理** — 供应商资质证书到期预警，支持有效/即将到期/已过期状态跟踪
- **物料管理** — 物料编码自动生成、规格管理、安全库存与采购提前期设置
- **ABC-XYZ 矩阵** — ABC 按年消耗金额分类，XYZ 按需求变异系数分类，九宫格交叉给出差异化库存策略
- **采购订单** — 订单全生命周期管理，从草稿到关闭，支持部分交付与质检记录
- **风险预警** — 证书到期、交付延迟、质量异常、绩效下降、单一来源、过度集中等多类型预警

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| UI 组件 | Ant Design 5 |
| 图表 | ECharts 5 (echarts-for-react) |
| 路由 | React Router 6 |
| 状态管理 | Zustand 5 |
| 构建 | Vite 5 |
| 桌面端 | Electron 33 |
| 打包 | electron-builder |
| 数据库 | sql.js (SQLite WASM) + Express 5 |
| 测试 | Vitest + Testing Library |

## 开发指南

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 同时启动 Vite 开发服务器和 Electron
npm run dev

# 或分别启动
npm run dev:vite    # 启动 Vite 开发服务器 (端口 5173)
npm run dev:electron  # 等待 Vite 就绪后启动 Electron
```

### 构建打包

```bash
# 仅构建前端 + Electron 主进程
npm run build

# 编译 Electron 主进程
npm run electron:build

# 启动 Electron（需先构建）
npm run electron:start

# 完整打包为安装程序
npm run pack
```

### 运行测试

```bash
npm test
```

## 项目结构

```
flux-scm/
├── electron/                  # Electron 主进程
│   ├── main.ts               # 主进程入口，窗口创建与 IPC
│   ├── preload.ts            # 预加载脚本，安全暴露 API
│   └── tsconfig.json         # Electron TypeScript 配置
├── server/                    # 后端服务 (Express 5 + sql.js)
│   ├── index.ts              # 服务入口，路由注册与 SPA fallback
│   ├── database.ts           # 数据库初始化、建表与种子数据
│   ├── dbHelper.ts           # SQL 查询封装 (queryAll/queryOne/run)
│   └── routes/               # API 路由模块
│       ├── suppliers.ts      # 供应商 CRUD + 级联删除
│       ├── materials.ts      # 物料 CRUD + 级联删除
│       ├── orders.ts         # 采购订单 CRUD
│       ├── dashboard.ts      # 仪表盘统计
│       ├── tco.ts            # TCO 总拥有成本分析
│       ├── shouldCost.ts     # Should-Cost 应该成本分析
│       ├── scorecards.ts     # QCDS 供应商积分卡
│       ├── riskAlerts.ts     # 风险预警
│       ├── safetyStock.ts    # 安全库存建议 (ABC-XYZ + 提前期)
│       ├── consolidation.ts  # 采购合并建议
│       ├── moqConflicts.ts   # MOQ 冲突检测
│       ├── alternatives.ts   # 替代物料建议
│       ├── concentration.ts  # 供应商集中度 (HHI/CR3/CR5)
│       └── supplierMaterialMatrix.ts  # 供应商-物料矩阵
├── src/
│   ├── components/           # React 组件
│   │   ├── dashboard/        # 仪表盘组件 (KPI卡片、趋势图、预警)
│   │   ├── layout/           # 布局组件 (Header、Sidebar、AppLayout)
│   │   ├── material/         # 物料组件 (列表、表单、ABC-XYZ视图)
│   │   ├── order/            # 订单组件 (订单列表)
│   │   └── supplier/         # 供应商组件 (列表、表单、卡拉杰克视图、绩效雷达、资质表)
│   ├── pages/                # 页面组件
│   │   ├── Dashboard.tsx
│   │   ├── Suppliers.tsx
│   │   ├── Materials.tsx
│   │   ├── Orders.tsx
│   │   └── Settings.tsx
│   ├── types/                # TypeScript 类型定义
│   │   ├── common.ts         # 通用类型 (卡拉杰克象限、绩效等级、风险等级等)
│   │   ├── supplier.ts       # 供应商相关类型
│   │   ├── material.ts       # 物料相关类型
│   │   └── order.ts          # 订单相关类型
│   ├── utils/                # 工具函数
│   │   ├── kraljic.ts        # 卡拉杰克矩阵计算
│   │   ├── scoring.ts        # QCDS 绩效评分
│   │   ├── abcxyz.ts         # ABC-XYZ 分类
│   │   └── coding.ts         # 物料编码生成
│   ├── styles/               # 全局样式
│   ├── App.tsx               # 应用根组件
│   ├── main.tsx              # React 入口
│   └── vite-env.d.ts         # Vite 类型声明
├── tests/
│   └── unit/                 # 单元测试
│       ├── kraljic.test.ts
│       ├── scoring.test.ts
│       ├── abcxyz.test.ts
│       └── coding.test.ts
├── electron-builder.yml      # Electron 打包配置
├── vite.config.ts            # Vite 配置
├── vitest.config.ts          # Vitest 配置
├── tsconfig.json             # 前端 TypeScript 配置
├── index.html                # HTML 入口
└── package.json
```

## 核心方法论

### 卡拉杰克矩阵 (Kraljic Matrix)

由彼得·卡拉杰克于1983年提出，从**利润影响**和**供应风险**两个维度将采购品项分为四类：

| 象限 | 利润影响 | 供应风险 | 策略 |
|------|---------|---------|------|
| **战略型** | 高 | 高 | 深度合作，建立战略联盟 |
| **杠杆型** | 高 | 低 | 竞争性招标，充分利用买方地位 |
| **瓶颈型** | 低 | 高 | 保障供应，建立安全库存 |
| **非关键型** | 低 | 低 | 简化流程，最小化管理成本 |

利润影响基于年采购额占比计算，供应风险综合评估替代供应商数量、转换成本、替换提前期和产品复杂度。

### QCDS 绩效评分

从四个维度对供应商进行加权评分：

- **Q (Quality 质量)** — 权重 30%，基于来料合格率
- **C (Cost 成本)** — 权重 25%，基于价格竞争力
- **D (Delivery 交付)** — 权重 30%，基于准时交付率
- **S (Service 服务)** — 权重 15%，基于服务响应评价

综合评分对应等级：A (≥90)、B (≥80)、C (≥70)、D (<70)

### ABC-XYZ 矩阵

**ABC 分类**按年消耗金额占比将物料分为：
- **A类** — 累计金额占比前80%的高价值物料
- **B类** — 累计金额占比80%-95%的中价值物料
- **C类** — 累计金额占比95%-100%的低价值物料

**XYZ 分类**按需求变异系数(CV)将物料分为：
- **X类** — CV < 0.5，需求稳定
- **Y类** — 0.5 ≤ CV < 1.0，需求波动
- **Z类** — CV ≥ 1.0，需求不规律

两者交叉形成九宫格，每个组合对应差异化的安全库存策略、补货策略和监控级别。例如 AX（高价值+需求稳定）适合 JIT 高频小批量补货，而 CZ（低价值+需求不规律）则应严控库存风险、按需零星采购。
