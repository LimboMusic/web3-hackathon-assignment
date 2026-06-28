# 任务清单

## 0. 前置文档

- [x] 阅读 `ObsidianVault/02-方案设计/UI设计稿/trade-detail.html`，记录交易摘要、状态机时间线、操作按钮、纠纷押金和事件日志布局。
- [x] 阅读合约规格 `openspec/specs/escrow-core/spec.md` 中交易状态和退款/仲裁相关需求，确保页面状态名称与合约一致。
- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 中记录开始实现 Trade Detail 页面骨架。

## 1. 页面结构

- [x] 在 `frontend/src/pages/TradeDetail.tsx` 新增交易详情页面。
- [x] 为交易详情 mock 数据定义 TypeScript 类型，至少覆盖交易状态、角色、资金项和事件日志项。
- [x] 页面必须展示商品标题、商品 ID、价格、卖家、买家、当前状态、托管金额、卖家保证金和纠纷押金摘要。
- [x] 状态机时间线必须包含 `Created`、`Locked`、`Delivered`、`DisputeDepositPending`、`Disputed`、`Inactive`。
- [x] 页面必须包含链上事件监听区域，至少能展示 mock `ItemPurchased`、`ItemDelivered`、`RefundRequested`、`DisputeOpened`、`DisputeResolved`。

## 2. 角色操作面板

- [x] 建立卖家操作区，按钮至少包括标记交付、同意退款、超时放款。
- [x] 建立买家操作区，按钮至少包括确认收货、申请退款、发起仲裁纠纷。
- [x] 建立纠纷操作区，包含证据哈希或 URI 输入、补交纠纷押金按钮和当前押金状态提示。
- [x] 按钮必须根据 mock 状态禁用或启用，例如未付款不能标记交付，未交付不能确认收货，退款申请后不能确认收货。
- [x] 禁用按钮旁边或 tooltip 中必须有可理解原因，便于课堂演示。

## 3. Mock 状态机

- [x] 建立本页局部 mock 状态机或共享 demo store，支持从 `Created` 到 `Locked`、`Delivered`、`Inactive` 的正常路径。
- [x] 支持从 `Locked` 或 `Delivered` 发起 `RefundRequested` 模拟状态，并通过卖家同意退款结束。
- [x] 支持发起纠纷后进入 `DisputeDepositPending`，补交押金后进入 `Disputed`。
- [x] 支持超时放款模拟，必须体现“已交付后确认窗口超时才可放款”的规则。
- [x] 每次状态变化都追加事件日志，并展示 `Pending -> Success` 或 `Failed` 反馈。

## 4. 资金流向表达

- [x] 资金流向区域必须明确区分主交易金额、卖家保证金、双方纠纷押金和 pending withdrawals。
- [x] 正常确认收货时展示“主交易金额记入卖家可提现余额”。
- [x] 协商退款时展示“主交易金额记入买家可提现余额，卖家保证金退还卖家”。
- [x] 仲裁入口必须提示“裁决结果由仲裁中心页面投票产生”，本页不模拟完整 2/3 投票。

## 5. GSAP 动画约束

- [x] 在实现动画前检查当前 Codex 环境是否提供 GSAP skill；若提供，必须先加载并遵守该 skill。
- [x] 前端依赖中加入 `gsap`，交易详情页面动画通过 GSAP 实现。
- [x] 状态机从 `Created`、`Locked`、`Delivered`、`DisputeDepositPending`、`Disputed`、`Inactive` 切换时，用 GSAP 高亮当前节点和已完成路径。
- [x] 资金流向变化时，用 GSAP 高亮受影响金额和 `pendingWithdrawals` 说明。
- [x] 事件日志新增项使用 GSAP 做短促入场，不改变日志容器稳定高度。
- [x] 动画尊重 `prefers-reduced-motion`，不得遮挡关键操作按钮或证据输入框。

## 6. 验证

- [x] 运行 `rtk npm run build`。
- [x] 手工演示正常交易路径：付款托管 -> 卖家交付 -> 买家确认 -> 结束。
- [x] 手工演示协商退款路径：付款托管 -> 买家申请退款 -> 卖家同意 -> 结束。
- [x] 手工演示纠纷路径入口：发起纠纷 -> 补交押金 -> 进入仲裁中。
- [x] 检查所有长地址、事件日志、按钮文案在桌面和窄屏下不重叠。
- [x] 手工检查 GSAP 状态机动画不会导致时间线错位、资金说明闪烁或按钮延迟可用。
- [x] 运行 `rtk npx openspec validate add-frontend-trade-detail-page --strict`。

## 7. 本 change 明确不做

- [x] 不接入真实合约函数。
- [x] 不实现真实事件监听。
- [x] 不在本页完成仲裁员 2/3 投票；仲裁投票主体留给 `add-frontend-arbitration-page`。
- [x] 不处理真实超时区块时间，只做静态演示状态。
- [x] 不修改合约、测试、部署脚本或部署产物。
