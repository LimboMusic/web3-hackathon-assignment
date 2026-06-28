# 任务清单

## 0. 前置文档

- [x] 在 `ObsidianVault/02-方案设计/技术实现文档.md` 中展开第 5 步设计要点、函数范围和验收边界。
- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 中写入本步骤（多签仲裁投票）的准备记录。

## 1. 合约文件：`contracts/EscrowMarketplace.sol`

- [x] 在合约级别补充纠纷配置，优先使用构造函数注入或不可变变量，至少包括：
  - `uint256 public immutable disputeDeposit`
  - `uint256 public immutable disputeDepositWindow`
  - `uint256 public immutable disputeWindow`
- [x] 修改 `constructor`：
  - 保留现有 `_deliveryWindow`、`_confirmWindow`、`_arbiterStakeAmount`、`_minActiveArbiters` 参数。
  - 新增 `_disputeDeposit`、`_disputeDepositWindow`、`_disputeWindow` 参数。
  - 对三个新增参数为 `0` 的情况做输入拒绝。
  - 同步更新所有测试部署 helper 和脚本中构造参数。
- [x] 补充每笔商品或纠纷状态字段，字段可放入现有 `Item` struct 或配套 dispute struct：
  - `address disputeInitiator`
  - `bool initiatorSupportsBuyer`
  - `uint256 disputeDepositStartedAt`
  - `uint256 disputeStartedAt`
  - 买家/卖家是否已交纠纷押金
  - 买家/卖家证据哈希
  - 支持买家/支持卖家的票数
  - 仲裁员是否已投票和投票方向
  - 多数票仲裁员列表或可用于分配奖励的等价记录
- [x] 如需新增自定义错误，至少覆盖：
  - 纠纷押金配置无效；
  - 纠纷押金补交窗口配置无效；
  - 仲裁投票窗口配置无效；
  - 非买家/卖家不能发起纠纷；
  - 当前状态不能发起纠纷；
  - 有效仲裁员数量不足；
  - 证据哈希为空；
  - 纠纷押金金额错误；
  - 非响应方不能补交押金；
  - 押金补交已超时或未超时；
  - 当前状态不是 `Disputed`；
  - 当前地址不是合格仲裁员；
  - 仲裁员已经投票；
  - 仲裁投票未超时或已达成多数。
- [x] 新增事件，事件参数必须便于前端事件日志展示：
  - `DisputeOpened(uint256 indexed itemId, address indexed initiator, bool supportBuyer, bytes32 evidenceHash)`
  - `DisputeResponded(uint256 indexed itemId, address indexed responder)`
  - `EvidenceSubmitted(uint256 indexed itemId, address indexed submitter, bytes32 evidenceHash)`
  - `ArbiterVoted(uint256 indexed itemId, address indexed arbiter, bool supportBuyer)`
  - `DisputeResolved(uint256 indexed itemId, bool buyerWins, string reason)`
  - `DisputeRewardRecorded(uint256 indexed itemId, address indexed arbiter, uint256 amount)`

## 2. 合约函数与代码规范

- [x] 新增 `openDispute(uint256 itemId, bytes32 evidenceHash) external payable nonReentrant`：
  - 仅商品买家或卖家可调用。
  - 仅允许在 `Locked` 或 `Delivered` 状态调用。
  - `evidenceHash != bytes32(0)`。
  - `msg.value == disputeDeposit`。
  - `activeArbiterCount >= minActiveArbiters`。
  - 买家发起时默认诉求为支持买家退款，卖家发起时默认诉求为支持卖家放款。
  - 记录发起方、诉求、押金、证据哈希和 `disputeDepositStartedAt`。
  - 状态转为 `DisputeDepositPending`。
  - 发出 `DisputeOpened`。
- [x] 新增 `respondDispute(uint256 itemId) external payable nonReentrant`：
  - 仅另一方可调用。
  - 仅 `DisputeDepositPending` 状态可调用。
  - 必须在 `disputeDepositStartedAt + disputeDepositWindow` 内调用。
  - `msg.value == disputeDeposit`。
  - 记录响应方押金。
  - 状态转为 `Disputed`。
  - 记录 `disputeStartedAt`。
  - 发出 `DisputeResponded`。
- [x] 新增 `submitEvidence(uint256 itemId, bytes32 evidenceHash) external`：
  - 仅买家或卖家可调用。
  - 仅 `DisputeDepositPending` 或 `Disputed` 状态可调用。
  - `evidenceHash != bytes32(0)`。
  - 按调用者角色写入买家或卖家的证据哈希。
  - 发出 `EvidenceSubmitted`。
- [x] 新增 `voteDispute(uint256 itemId, bool supportBuyer) external nonReentrant`：
  - 仅 `Disputed` 状态可调用。
  - 使用 `isEligibleArbiter(itemId, msg.sender)` 校验仲裁员有效且非当事人。
  - 每个仲裁员每笔纠纷只能投一次。
  - 投票后记录投票方向并增加对应票数。
  - 发出 `ArbiterVoted`。
  - 当任一方向达到 2/3 多数时，自动执行裁决。
- [x] 新增 `resolveDisputeDepositTimeout(uint256 itemId) external nonReentrant`：
  - 仅 `DisputeDepositPending` 状态可调用。
  - 必须超过 `disputeDepositStartedAt + disputeDepositWindow`。
  - 响应方未补交押金时，发起方自动胜诉。
  - 主交易资金按发起方诉求结算。
  - 发起方纠纷押金退回到 `pendingWithdrawals`，不发评审奖励。
  - 状态转为 `Inactive`，发出 `DisputeResolved`。
- [x] 新增 `resolveDisputeTimeout(uint256 itemId) external nonReentrant`：
  - 仅 `Disputed` 状态可调用。
  - 必须超过 `disputeStartedAt + disputeWindow`。
  - 必须尚未达成 2/3 多数裁决。
  - 若卖家已交付（状态进入纠纷前来自 `Delivered` 或有等价 `deliveredAt` 记录），默认放款卖家；否则默认退款买家。
  - 双方纠纷押金都退回到各自 `pendingWithdrawals`，不发评审奖励。
  - 状态转为 `Inactive`，发出 `DisputeResolved`。
- [x] 新增或抽取内部结算 helper，建议拆分为：
  - `_resolveDispute(uint256 itemId, bool buyerWins, bool rewardArbiters, string memory reason) internal`
  - `_recordMainFundsOutcome(...)` 或等价函数，用于退款/放款主交易资金。
  - `_recordDisputeDepositsOutcome(...)` 或等价函数，用于处理双方纠纷押金和仲裁员奖励。
- [x] 所有资金路径必须继续遵守：
  - 先校验权限、状态、金额和时间，再修改状态；
  - 主交易资金和押金奖励优先记入 `pendingWithdrawals`，由用户 pull 提款；
  - 涉及 ETH 转入或结算的外部函数使用 `nonReentrant`；
  - 不在投票函数中直接向外部地址转账；
  - 不允许重复裁决、重复退款、重复放款或重复分配押金。

## 3. 测试文件：`test/EscrowMarketplace.test.js`

- [x] 更新测试部署 helper：
  - 显式传入 `deliveryWindow`、`confirmWindow`、`arbiterStakeAmount`、`minActiveArbiters`、`disputeDeposit`、`disputeDepositWindow`、`disputeWindow`。
  - 读取并断言新增三个构造配置值。
- [x] 测试构造函数输入：
  - `_disputeDeposit == 0` 时部署失败。
  - `_disputeDepositWindow == 0` 时部署失败。
  - `_disputeWindow == 0` 时部署失败。
- [x] 测试 `openDispute`：
  - 买家在 `Locked` 状态可发起纠纷并进入 `DisputeDepositPending`。
  - 卖家在 `Delivered` 状态可发起纠纷并进入 `DisputeDepositPending`。
  - 非买家/卖家不能发起纠纷。
  - 纠纷押金金额错误会 revert。
  - 空证据哈希会 revert。
  - 有效仲裁员数量不足时会 revert。
  - `Created` 或 `Inactive` 状态不能发起纠纷。
- [x] 测试 `respondDispute`：
  - 响应方在期限内补交押金后状态进入 `Disputed`。
  - 非响应方不能补交押金。
  - 金额错误会 revert。
  - 超过 `disputeDepositWindow` 后补交会 revert。
- [x] 测试 `submitEvidence`：
  - 买家可提交证据哈希并发出事件。
  - 卖家可提交证据哈希并发出事件。
  - 非当事人不能提交证据。
  - 空证据哈希会 revert。
  - 非纠纷状态不能提交证据。
- [x] 测试 `voteDispute`：
  - 有效第三方仲裁员可投票并增加对应票数。
  - 未质押地址不能投票。
  - 买家或卖家即使质押也不能投自己的交易。
  - 同一仲裁员不能重复投票。
  - 非 `Disputed` 状态不能投票。
- [x] 测试 2/3 多数裁决：
  - 两名仲裁员支持买家后，主交易资金记入买家 `pendingWithdrawals`。
  - 两名仲裁员支持卖家后，主交易资金记入卖家 `pendingWithdrawals`。
  - 胜诉方纠纷押金退回。
  - 败诉方纠纷押金平均记入多数票仲裁员的 `pendingWithdrawals`。
  - 少数票或未投票仲裁员不获得奖励。
  - 裁决后状态为 `Inactive`，不能继续投票或再次裁决。
- [x] 测试 `resolveDisputeDepositTimeout`：
  - 响应方超时未补交押金时，发起方自动胜诉。
  - 发起方押金退回。
  - 不发仲裁员奖励。
  - 未到期调用会 revert。
- [x] 测试 `resolveDisputeTimeout`：
  - 双方已交押金但未达多数票，超过 `disputeWindow` 后可兜底结算。
  - 卖家未交付时默认退款买家。
  - 卖家已交付时默认放款卖家。
  - 双方纠纷押金都退回。
  - 不发仲裁员奖励。
  - 未到期调用会 revert。
- [x] 测试保持原有功能不回归：
  - 正常创建、购买、交付、确认收货、提款路径仍全部通过。
  - 退款、卖家同意退款、超时放款测试仍全部通过。
  - 仲裁员质押、退出、回避测试仍全部通过。

## 4. 文档与范围控制

- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 追加本步骤的实现结果，记录：
  - 新增/修改的配置、状态变量、函数、事件；
  - 通过的测试命令；
  - `disputeDeposit`、`disputeDepositWindow`、`disputeWindow` 的测试值；
  - 下一步是否进入卖家保证金/举报/信誉。
- [x] 更新 `ObsidianVault/02-方案设计/技术实现文档.md` 第 5 步状态和结果摘要。
- [x] 本 change 不创建前端文件，不修改 `frontend/`。
- [x] 本 change 不新增 Sepolia 部署脚本。
- [x] 本 change 不实现卖家保证金、举报机制和信誉计数。

## 5. 验证

- [x] 运行 `npx hardhat compile`，要求 `EscrowMarketplace`、测试 harness 和占位合约都能编译通过。
- [x] 运行 `npx hardhat test`，要求原有测试与新增多签仲裁测试全部通过。
- [x] 如安装了 OpenSpec CLI，运行 `openspec validate add-arbitration-voting --strict` 并记录结果。

## 6. 本 change 明确不做

- [x] 不实现卖家保证金、卖家恶意判定后的罚没、举报机制或信誉计数。
- [x] 不实现 DAO 选举仲裁员或女巫攻击防护，只保留 `minActiveArbiters` 与质押门槛。
- [x] 不实现 React/Vite 前端，也不部署 Sepolia。
- [x] 不提交真实 `.env`、私钥、助记词或私密 RPC API Key。
