# 任务清单

## 0. 前置文档

- [x] 在 `ObsidianVault/02-方案设计/技术实现文档.md` 中展开第 6 步设计要点、函数范围和验收边界。
- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 中写入本步骤（卖家保证金/举报/信誉）的准备记录。

## 1. 合约配置与结构：`contracts/EscrowMarketplace.sol`

- [x] 新增合约配置：
  - `uint256 public immutable sellerStakeAmount`
  - `uint256 public immutable reportDeposit`
- [x] 修改 `constructor`：
  - 保留已有时间窗口、仲裁员保证金、纠纷押金等参数。
  - 新增 `_sellerStakeAmount` 与 `_reportDeposit` 参数。
  - 对两个新增参数为 `0` 的情况做输入拒绝。
  - 同步更新所有测试部署 helper、harness 和部署脚本中的构造参数。
- [x] 修改商品结构或配套 mapping，至少记录：
  - 每笔商品对应的 `sellerStake` 金额；
  - 卖家保证金是否已结算；
  - 卖家保证金是否被罚没；
  - 纠纷最终是否由买家胜诉或卖家胜诉，便于举报和信誉读取。
- [x] 新增信誉结构或 mappings，建议包含：
  - `completedTradeCount[address]`
  - `disputeCount[address]`
  - `buyerWinCount[address]`
  - `sellerWinCount[address]`
  - `sellerStakeSlashedCount[address]`
- [x] 新增举报结构、枚举和计数器，建议包含：
  - `enum ReportType { NoVote, Misconduct }`
  - `enum ReportStatus { Pending, Upheld, Rejected }`
  - `uint256 public nextReportId`
  - `mapping(uint256 => Report) public reports`

## 2. 卖家保证金流程

- [x] 修改 `createItem(...) external payable`：
  - 要求 `msg.value == sellerStakeAmount`。
  - 成功创建商品时记录该商品的卖家保证金。
  - 发出包含 `itemId`、`seller`、`amount` 的卖家保证金锁定事件。
- [x] 修改商品下架或取消路径：
  - 仅 `Created` 状态允许卖家下架。
  - 下架时将卖家保证金记入卖家 `pendingWithdrawals`。
  - 标记该笔保证金已结算，避免重复退还。
- [x] 修改正常完成路径 `confirmReceived`：
  - 主交易资金继续记入卖家 `pendingWithdrawals`。
  - 卖家保证金同时记入卖家 `pendingWithdrawals`。
  - 买家和卖家的完成次数各增加 1。
- [x] 修改双方确认退款路径 `approveRefund`：
  - 主交易资金退给买家。
  - 卖家保证金退给卖家。
  - 不把协商退款计为卖家作恶。
- [x] 修改卖家超时放款路径 `releaseAfterTimeout`：
  - 主交易资金放给卖家。
  - 卖家保证金退给卖家。
  - 买家和卖家的完成次数各增加 1。
- [x] 修改纠纷结算 helper：
  - 仲裁或押金补交超时支持买家时，主交易资金退给买家，卖家保证金罚没。
  - 仲裁或押金补交超时支持卖家时，主交易资金放给卖家，卖家保证金退给卖家。
  - 仲裁投票超时兜底按现有主资金方向同步处理卖家保证金。
  - 卖家保证金罚没资金优先进入项目级罚没池或明确记录到 `pendingWithdrawals[owner]`，不要直接转账。
- [x] 所有卖家保证金结算必须保证：
  - 只能结算一次；
  - 先更新状态和记账，再允许提款；
  - 不在结算函数中直接外部转账；
  - 事件足够前端展示。

## 3. 举报机制

- [x] 新增 `reportNoVote(uint256 itemId, address arbiter) external payable nonReentrant`：
  - 要求 `msg.value == reportDeposit`。
  - 仅允许在对应纠纷已结束后调用。
  - 要求 `arbiter` 是该笔纠纷期间可投票或已快照的仲裁员范围内的地址；若当前实现无法枚举快照范围，至少要求该地址曾是有效仲裁员且不是交易当事人。
  - 若 `hasVoted[itemId][arbiter] == false`，举报自动成立。
  - 成立时将举报押金记入举报人 `pendingWithdrawals`。
  - 不成立时将举报押金记入被举报仲裁员 `pendingWithdrawals`。
  - 发出举报创建和举报解决事件。
- [x] 新增 `reportMisconduct(uint256 itemId, address arbiter, bytes32 evidenceHash) external payable nonReentrant`：
  - 要求 `msg.value == reportDeposit`。
  - 要求 `evidenceHash != bytes32(0)`。
  - 创建 `Pending` 举报记录，保存举报人、被举报仲裁员、商品、证据哈希和押金。
  - 发出举报创建事件。
- [x] 新增 `resolveReport(uint256 reportId, bool upheld) external onlyOwner nonReentrant`：
  - 仅处理 `Misconduct` 且 `Pending` 的举报。
  - `upheld == true` 时，举报押金退给举报人。
  - `upheld == false` 时，举报押金补偿被举报仲裁员。
  - 更新举报状态并发出举报解决事件。
- [x] 举报机制明确不做：
  - 不因“投少数票”直接惩罚仲裁员。
  - 不自动罚没仲裁员保证金。
  - 不实现复核陪审团或 DAO 投票。

## 4. 信誉计数

- [x] 在正常完成、超时放款、双方确认退款和纠纷结算路径中更新买卖双方信誉计数。
- [x] 当纠纷进入 `Disputed` 或最终解决时，买卖双方纠纷次数各增加 1；必须避免同一纠纷重复计数。
- [x] 买家胜诉时增加买家胜诉计数；卖家胜诉时增加卖家胜诉计数。
- [x] 卖家保证金被罚没时增加卖家罚没计数。
- [x] 新增读取函数或 public mappings，方便前端和报告展示地址信誉。

## 5. 事件与错误

- [x] 新增事件，至少包括：
  - `SellerStakeLocked(uint256 indexed itemId, address indexed seller, uint256 amount)`
  - `SellerStakeReleased(uint256 indexed itemId, address indexed seller, uint256 amount)`
  - `SellerStakeSlashed(uint256 indexed itemId, address indexed seller, uint256 amount)`
  - `ReputationUpdated(address indexed account, uint256 completedTrades, uint256 disputeCount)`
  - `ReportCreated(uint256 indexed reportId, uint256 indexed itemId, address indexed reporter, address reported, ReportType reportType, bytes32 evidenceHash)`
  - `ReportResolved(uint256 indexed reportId, bool upheld)`
- [x] 新增自定义错误，至少覆盖：
  - 卖家保证金配置无效；
  - 举报押金配置无效；
  - 卖家保证金金额错误；
  - 卖家保证金已结算；
  - 举报押金金额错误；
  - 举报对象无效；
  - 举报证据哈希为空；
  - 举报状态无效；
  - 非 owner 不能手动复核。

## 6. 测试：`test/EscrowMarketplace.test.js`

- [x] 更新部署 helper，显式传入 `sellerStakeAmount` 与 `reportDeposit`，并断言配置值。
- [x] 测试构造函数拒绝 `sellerStakeAmount == 0` 和 `reportDeposit == 0`。
- [x] 测试创建商品必须支付卖家保证金，金额错误 revert。
- [x] 测试卖家下架 `Created` 商品后，卖家保证金进入卖家可提现余额，且不能重复退还。
- [x] 测试正常确认收货后，卖家可提现余额包含主交易资金和卖家保证金。
- [x] 测试双方确认退款后，买家拿回主交易资金，卖家拿回卖家保证金。
- [x] 测试卖家超时放款后，卖家拿到主交易资金和卖家保证金。
- [x] 测试仲裁支持买家时，主交易资金退给买家，卖家保证金被罚没，卖家罚没计数增加。
- [x] 测试仲裁支持卖家时，主交易资金和卖家保证金都记入卖家可提现余额。
- [x] 测试信誉计数在正常完成、纠纷、买家胜诉、卖家胜诉路径下按预期更新。
- [x] 测试 `reportNoVote`：
  - 未投票仲裁员被举报时自动成立，举报押金退给举报人。
  - 已投票仲裁员被举报时自动驳回，举报押金补偿被举报仲裁员。
- [x] 测试 `reportMisconduct` 与 `resolveReport`：
  - 可创建待复核举报并保存证据哈希。
  - 非 owner 不能复核。
  - owner 支持举报时押金退给举报人。
  - owner 驳回举报时押金补偿被举报仲裁员。
- [x] 原有 114+ 个核心托管、退款、仲裁员质押和多签仲裁测试保持通过。

## 7. 文档与验证

- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 追加实现结果，记录新增配置、函数、事件、测试命令和下一步。
- [x] 更新 `ObsidianVault/02-方案设计/技术实现文档.md` 第 6 步状态和结果摘要。
- [x] 运行 `rtk npx hardhat compile`。
- [x] 运行 `rtk npx hardhat test`。
- [x] 运行 `rtk npx openspec validate add-seller-stake-reputation --strict`。

## 8. 本 change 明确不做

- [x] 不创建 React/Vite 前端。
- [x] 不部署 Sepolia，不写真实 `.env`。
- [x] 不支持 USDC 或其它 ERC20 稳定币计价。
- [x] 不实现 DAO 仲裁员选举、复核陪审团或女巫攻击防护。
- [x] 不自动罚没仲裁员保证金；仲裁员保证金仍只用于准入和退出约束。
