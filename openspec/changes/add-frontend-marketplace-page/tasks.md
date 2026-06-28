# 任务清单

## 0. 前置文档

- [ ] 阅读 `ObsidianVault/02-方案设计/UI设计稿/marketplace.html`，记录商品网格、筛选区、创建商品表单和按钮反馈。
- [ ] 阅读 `ObsidianVault/02-方案设计/技术实现文档.md` 步骤 9，确认本 change 只做静态骨架与模拟交互。
- [ ] 在 `ObsidianVault/04-开发记录/开发记录.md` 中记录开始实现 Marketplace 页面骨架。

## 1. 页面与路由

- [ ] 在 `frontend/src/pages/Marketplace.tsx` 新增交易市场页面。
- [ ] 在侧边栏或路由配置中注册 Marketplace 入口，并保持与 Dashboard、Trade Detail、Arbitration、Deployment 的导航一致。
- [ ] 页面标题使用“交易市场”，副标题说明“买家付款后资金托管于智能合约”。
- [ ] 保持顶部钱包、网络、交易状态栏与其他页面一致。

## 2. 商品列表与筛选

- [ ] 建立 TypeScript mock 商品数据文件或页面内常量，字段至少包含 `id`、`title`、`description`、`priceEth`、`seller`、`state`、`metadataHash`、`createdAt`。
- [ ] 为商品数据定义 `MarketplaceItem` 或等价 TypeScript 类型，`state` 使用字符串联合类型或 enum。
- [ ] 商品卡片必须展示商品 ID、标题、描述摘要、价格、卖家地址摘要、状态标签和主要操作按钮。
- [ ] 状态标签必须覆盖 `Created`、`Locked`、`Delivered`、`Disputed`、`Inactive`，颜色语义与设计稿一致。
- [ ] 搜索输入支持按商品标题、地址或 ID 在 mock 数据中筛选。
- [ ] 状态筛选支持显示全部、可购买、托管中、已结束或等价分类。

## 3. 创建商品表单

- [ ] 新增或复用 `CreateItemForm` 组件，字段至少包含商品标题、商品描述、价格 ETH、metadata hash 或自动生成说明。
- [ ] 表单必须包含基础校验：标题非空、价格大于 0、描述非空。
- [ ] 提交后模拟 `Pending -> Success`，并向页面事件提示追加 `ItemCreated`。
- [ ] 校验失败或模拟失败时显示清楚错误提示，不使用浏览器默认丑陋提示作为唯一反馈。
- [ ] 表单提交成功后可把 mock 商品插入列表顶部，便于课堂演示“发布后可见”。

## 4. 购买模拟

- [ ] `Created` 商品显示购买按钮，其他状态商品按钮禁用或改为查看详情。
- [ ] 点击购买按钮模拟 `Pending -> Success`，并把对应商品状态改为 `Locked`。
- [ ] 成功提示必须说明“资金已进入托管合约”，并追加 `ItemPurchased` 事件提示。
- [ ] 卖家购买自己商品的错误在静态骨架中预留提示位，真实地址判断留给第 10 步。

## 5. 验证

- [ ] 运行 `rtk npm run build`，确认页面可构建。
- [ ] 手工检查商品卡片在桌面和窄屏下不重叠，长标题、长地址有截断或换行策略。
- [ ] 手工检查搜索、筛选、创建商品模拟、购买模拟都有可见反馈。
- [ ] 运行 `rtk npx openspec validate add-frontend-marketplace-page --strict`。

## 6. 本 change 明确不做

- [ ] 不调用真实 `createItem` 或 `purchaseItem`。
- [ ] 不连接 MetaMask，不读取当前账户余额。
- [ ] 不上传图片或证据文件。
- [ ] 不实现 Trade Detail 的完整订单操作，只提供查看详情入口。
- [ ] 不修改 Solidity 合约、Hardhat 测试或部署产物。
