# 提案：实现退款与超时处理

## 背景

[[技术实现文档]] 第 3 步对应 `add-refund-and-timeout`。第 2 步已经完成“创建商品 -> 付款托管 -> 卖家标记交付 -> 买家确认收货 -> 卖家提款”的基础闭环，但还缺少两个课堂演示中很容易被追问的关键保护：

1. 买家付款后，卖家如果一直不交付，买家资金会被锁住。
2. 卖家交付后，买家如果长期不确认，卖家资金也会被锁住。

同时，当前核心合约还没有“双方确认退款”这条非纠纷退款路径，无法支持“双方协商取消交易”“卖家无货”“商品有问题且卖家愿意退款”等常见场景。

本 change 的目标是在不引入仲裁员质押、纠纷押金、多签投票和证据哈希的前提下，先补齐：

- 双方确认退款；
- 串行的交付计时与确认计时；
- 必须以“已交付”为前提的超时放款。

## 变更内容

- 扩展 `EscrowMarketplace` 的商品时间字段，显式记录买家付款时间 `paidAt`，并复用现有 `deliveredAt` 作为确认计时起点。
- 为合约增加 `deliveryWindow` 和 `confirmWindow` 配置，用于分别约束：
  - 买家付款后，卖家需要在 `deliveryWindow` 内完成 `markDelivered()`；
  - 卖家标记交付后，买家需要在 `confirmWindow` 内确认收货，否则卖家可超时放款。
- 为商品增加退款请求标记，例如 `refundRequested`、`refundRequestedAt`，表示买家已发起退款但尚未完成结算。
- 新增买家发起退款接口 `requestRefund(uint256 itemId)`：
  - 仅买家可调用；
  - 商品处于 `Locked` 或 `Delivered` 状态时可发起；
  - 该操作只记录退款请求，不直接退款；
  - 一旦退款请求存在，卖家不可再走确认超时放款。
- 新增卖家同意退款接口 `approveRefund(uint256 itemId)`：
  - 仅卖家可调用；
  - 仅在买家已发起退款时可执行；
  - 托管资金记账到买家的可提现余额；
  - 商品状态变为 `Inactive`。
- 新增卖家超时放款接口 `releaseAfterTimeout(uint256 itemId)`：
  - 仅卖家可调用；
  - 仅在商品处于 `Delivered` 状态时可执行；
  - 必须满足 `block.timestamp >= deliveredAt + confirmWindow`；
  - 必须校验不存在待处理退款请求；
  - 必须先更新内部状态，再把金额记账到卖家的可提现余额。
- 按 refund / timeout 场景补充事件和单元测试，保证前端后续能展示完整时间线。

## 影响范围

- 合约：`contracts/EscrowMarketplace.sol`
- 测试：`test/EscrowMarketplace.test.js`
- 文档：`ObsidianVault/02-方案设计/技术实现文档.md`、`ObsidianVault/04-开发记录/开发记录.md`
- 规格：`openspec/changes/add-refund-and-timeout/`

## 非目标

- 不实现发起纠纷 `openDispute`、补交纠纷押金 `respondDispute`、提交证据 `submitEvidence`、仲裁投票 `voteDispute`。
- 不实现 `DisputeDepositPending` 和 `Disputed` 状态下的资金结算。
- 不实现仲裁员质押、仲裁员退出、有效仲裁员计数或当事人回避。
- 不实现败诉方纠纷押金奖励多数票仲裁员。
- 不实现卖家保证金、举报、信誉计数或前端接入。
