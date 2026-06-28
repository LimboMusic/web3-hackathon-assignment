# 变更提案：多签仲裁投票

## Why

当前合约已经完成核心托管、双方确认退款、交付/确认超时、仲裁员质押与当事人回避，但纠纷还无法进入链上仲裁。买家申请退款后，如果卖家不同意，或者卖家认为买家恶意拖延，就缺少可审计的裁决路径，托管资金可能长期卡住。

第 5 步需要把“纠纷押金 + 证据哈希 + 3 人多签投票 + 超时兜底”串成完整闭环。这样前端和课堂演示才能展示项目区别于普通托管 Demo 的关键 Web3/区块链能力：规则公开、资金锁定、证据固定、投票可追踪、裁决自动执行。

## What

- 新增纠纷配置：`disputeDeposit`、`disputeDepositWindow`、`disputeWindow`。
- 买家或卖家可调用 `openDispute(itemId, evidenceHash)` 发起纠纷并支付纠纷押金。
- 另一方可调用 `respondDispute(itemId)` 在期限内补交同额纠纷押金，使状态进入 `Disputed`。
- 买卖双方可调用 `submitEvidence(itemId, evidenceHash)` 固定各自证据哈希。
- 有效仲裁员可调用 `voteDispute(itemId, supportBuyer)` 投票，买卖双方不能投自己的交易，每个仲裁员每笔纠纷只能投一次。
- 达到 2/3 多数票后自动执行裁决：支持买家则退款，支持卖家则放款。
- 正常裁决时，胜诉方纠纷押金退回，败诉方押金平均奖励给投多数票的仲裁员。
- 对方未补交押金时，发起方可通过超时函数自动胜诉，发起方押金退回，不发评审奖励。
- 仲裁超时未达多数票时，按卖家是否已交付决定主资金兜底方向，双方纠纷押金都退回，不发评审奖励。

## Impact

- 修改合约：`contracts/EscrowMarketplace.sol`。
- 修改测试：`test/EscrowMarketplace.test.js`。
- 如测试需要，可修改或新增 `contracts/test/EscrowMarketplaceHarness.sol`。
- 新增 OpenSpec delta：`openspec/changes/add-arbitration-voting/specs/escrow-core/spec.md`。
- 更新 Obsidian：`ObsidianVault/02-方案设计/技术实现文档.md`、`ObsidianVault/04-开发记录/开发记录.md`。
- 不修改前端、不部署 Sepolia、不实现卖家保证金、举报机制和信誉计数。
