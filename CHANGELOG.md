# 更新日志

本文件记录 Flux-SCM 项目的所有版本变更。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [0.7.5] - 2026-06-17

### 修复
- **后端种子数据字段名错误**：`material_suppliers` 表 INSERT 语句使用 `moq`/`is_primary`/`lead_time`，但表结构定义的是 `min_order_qty`/`is_preferred`/`lead_time_days`，导致种子数据插入失败、合并建议/MOQ冲突/供应商-物料矩阵等功能在全新数据库下返回空数据
- **积分卡种子数据计算错误**：6 条记录中 4 条 `weighted_total` 错误、3 条 `grade` 错误（精密机械 88.55 应为 B、永泰橡胶 78.30 应为 C、宏达电机 65.95 应为 D）
- **TCO 种子数据总分错误**：第一条 `total_tco` 14.68 应为 14.18（各项相加验证）
- **安全库存计算单位错配**：原逻辑用年消耗金额 × 百分比作为安全库存数量，单位错配；改为基于提前期 × ABC-XYZ 服务水平系数计算"建议安全库存天数"，逻辑闭环
- **前端 API 请求 404（开发环境）**：`vite.config.ts` 未配置 proxy，添加 `/api` 代理到后端 3456 端口
- **Electron file:// 协议下路由失效**：`BrowserRouter` 不兼容，改用 `HashRouter`，并添加 404 兜底路由
- **TCO/ShouldCost 表单备注无法输入**：`<Form.Item name="remark"><div /></Form.Item>` 用空 div 作为控件，改为 `<Input.TextArea>`
- **表单提交失败仍提示成功**：fetch 后未检查 `res.ok`，添加状态检查 + try-catch
- **删除操作无二次确认**：直接调 DELETE，改用 `Modal.confirm` 二次确认
- **积分卡 gradeColor 未覆盖 D 等级**：D 和 F 都返回 'red'，补充 D → 'volcano'
- **表格无分页**：`pagination={false}` → 配置 `pageSize: 10, showSizeChanger, showTotal`

### 新增
- **模块开关状态持久化**：zustand store 添加 `persist` 中间件，模块开关状态刷新后不丢失
- **供应商级联删除**：删除供应商时自动清理关联的资质/联系人/TCO/Should-Cost/积分卡/风险预警/供应商-物料关系/采购订单及订单明细
- **物料级联删除**：删除物料时自动清理关联的 TCO/Should-Cost/供应商-物料关系/订单明细
- **后端统一错误处理**：suppliers/materials/orders/dashboard/riskAlerts 5 个路由添加 try-catch 包装器，避免未捕获异常导致进程崩溃
- **后端参数校验**：POST 请求添加必填字段校验（供应商名称、物料名称和单位、订单编号和供应商）
- **后端 404 处理**：PUT/DELETE 操作前检查记录是否存在，不存在返回 404
- **material_suppliers 种子数据**：新增 11 条供应商-物料关系数据，覆盖主要供应商和物料

### 优化
- **HelpPanel 默认关闭**：Materials/Orders 页面的帮助面板默认收起，减少视觉干扰
- **安全库存策略说明**：新增 `policy` 字段，直观展示每个 ABC-XYZ 组合的缓冲策略（如"高缓冲(高价值高波动)"）
- **安全库存表格列优化**：新增"提前期(天)"列，"建议安全库存"改为"建议库存天数"并带"天"单位标识
- **README 技术栈修正**：`Better-SQLite3 + Drizzle ORM` → `sql.js (SQLite WASM) + Express 5`
- **README 项目结构补充**：新增 server/ 目录完整说明

## [0.7.2] - 2026-06-16

### 新增
- Electron 桌面应用打包配置（electron-builder）
- GitHub Actions 自动构建 Windows/Mac/Linux 三平台安装包
- Express 5 后端 SPA fallback 兼容
- HashRouter 路由方案

## [0.7.1] - 2026-06-15

### 新增
- TCO 总拥有成本分析（10 维度成本分解）
- Should-Cost 应该成本分析（6 维度成本结构反推）
- QCDS 供应商积分卡（加权评分 + A/B/C/D 等级）
- 采购优化模块（合并建议/MOQ冲突/替代物料/安全库存/集中度分析）
- ABC-XYZ 物料分类矩阵
- 卡拉杰克供应商矩阵
- 风险预警系统

## [0.7.0] - 2026-06-14

### 新增
- 项目初始版本
- 供应商/物料/采购订单基础 CRUD
- 仪表盘 KPI 卡片与成本趋势图
