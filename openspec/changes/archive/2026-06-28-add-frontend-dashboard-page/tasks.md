# 任务清单

## 0. 前置文档

- [x] 阅读 `ObsidianVault/02-方案设计/技术实现文档.md` 的步骤 9 小节，确认五页面拆分范围。
- [x] 阅读 `ObsidianVault/02-方案设计/UI设计稿/dashboard.html`，记录页面标题、侧边栏、顶部状态栏、演示交易快照、最近事件和状态时间线结构。
- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 中记录开始实现 Dashboard 页面骨架。

## 1. 前端工程与共享布局

- [x] 若 `frontend/` 尚不存在，使用 React + TypeScript + Vite 建立工程，优先使用 Vite 的 `react-ts` 模板；若已存在，只在现有结构内补充页面。
- [x] 页面和组件文件使用 `.tsx`；共享 mock 数据类型使用 TypeScript `type` 或 `interface`。
- [x] 在 `frontend/src/` 中建立或复用共享布局组件，例如 `AppShell`、`Sidebar`、`TopStatusBar`、`StatusBadge`、`EventLog`。
- [x] 侧边栏必须包含五个页面入口：Dashboard、Marketplace、Trade Detail、Arbitration、Deployment。
- [x] 顶部状态栏必须预留钱包地址、网络、交易状态三块信息，文案应适合课堂演示。
- [x] 样式应优先复刻设计稿的深色控制台风格、卡片密度、状态标签和事件日志表达，不做营销 landing page。

## 2. Dashboard 页面：`frontend/src/pages/Dashboard.*`

- [x] 新增 Dashboard 页面组件（建议 `frontend/src/pages/Dashboard.tsx`），页面标题使用“链上二手交易担保托管平台”语义。
- [x] 展示当前课堂演示交易快照，至少包含商品名、商品 ID、价格、卖家、买家、当前合约状态和资金托管说明。
- [x] 展示关键指标卡片，至少包含合约地址摘要、当前演示订单数、活跃仲裁员数、待处理纠纷数或等价 mock 指标。
- [x] 展示最近链上事件列表，事件类型至少覆盖 `ItemCreated`、`ItemPurchased`、`ItemDelivered`、`TradeFinalized`、`DisputeOpened`。
- [x] 展示订单生命周期状态时间线，状态节点至少包含 `Created`、`Locked`、`Delivered`、`DisputeDepositPending`、`Disputed`、`Inactive`。
- [x] 当前状态、高亮状态、已完成状态和未到达状态必须视觉可区分。

## 3. 模拟交互与状态

- [x] 实现连接钱包按钮的静态模拟：点击后把钱包状态从未连接切换为已连接 mock 地址。
- [x] 实现交易状态模拟：按钮触发后短暂显示 `Pending`，随后变为 `Success`，最后回到 `Idle`。
- [x] 失败状态必须有可见样式和错误提示位置，即使本步只使用 mock 触发。
- [x] 事件日志新增项时不应造成页面布局跳动或文字溢出。

## 4. 验证

- [x] 运行 `rtk npm install` 或项目采用的包管理安装命令（如前端依赖尚未安装）。
- [x] 运行 `rtk npm run dev` 或对应 Vite dev 命令，确认 Dashboard 可访问。
- [x] 运行 `rtk npm run build`，确认静态骨架可构建。
- [x] 手工检查桌面宽度下第一屏就是控制台，不是介绍页。
- [x] 手工检查侧边栏、顶部状态栏、卡片、状态时间线、事件日志在窄屏下不重叠。
- [x] 运行 `rtk npx openspec validate frontend-demo --strict`（dashboard change 已归档，归档后验证最终 spec 使用 `frontend-demo`）。

## 5. 本 change 明确不做

- [x] 不调用真实 MetaMask。
- [x] 不读取 `deployments/sepolia/EscrowMarketplace.json` 中的 ABI 发起链上请求。
- [x] 不实现创建商品、购买、交付、确认收货等真实交易。
- [x] 不修改合约、测试、部署脚本或部署记录。
- [x] 不实现 Marketplace、Trade Detail、Arbitration、Deployment 四个页面的主体内容；只保证导航入口存在。
