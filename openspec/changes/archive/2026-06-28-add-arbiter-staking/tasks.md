# 任务清单

## 0. 前置文档

- [x] 在 `ObsidianVault/02-方案设计/技术实现文档.md` 中展开第 4 步设计要点、函数范围和验收边界。
- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 中写入本步骤（仲裁员质押与回避）的准备记录。

## 1. 合约文件：`contracts/EscrowMarketplace.sol`

- [x] 在合约级别补充仲裁员配置，优先使用构造函数注入或不可变变量，至少包括：
  - `uint256 public immutable arbiterStakeAmount`
  - `uint256 public immutable minActiveArbiters`
- [x] 修改 `constructor`：
  - 保留现有 `_deliveryWindow`、`_confirmWindow` 参数。
  - 新增 `_arbiterStakeAmount`、`_minActiveArbiters` 参数。
  - 对 `_arbiterStakeAmount == 0`、`_minActiveArbiters == 0` 做输入拒绝。
  - 同步更新所有测试部署调用。
- [x] 补充仲裁员状态变量：
  - `mapping(address => uint256) public arbiterStakes`
  - `mapping(address => bool) public activeArbiters`
  - `uint256 public activeArbiterCount`
  - `mapping(address => uint256) public arbiterLockedDisputeCount` 或等价字段，用于限制仲裁员在未结束纠纷中退出。
- [x] 如需新增自定义错误，至少覆盖：
  - 仲裁员保证金配置无效；
  - 最低仲裁员数量配置无效；
  - 质押金额错误；
  - 已经是有效仲裁员；
  - 不是有效仲裁员；
  - 仲裁员仍被未结束纠纷锁定；
  - 当事人不能担任自己交易的仲裁员。
- [x] 新增事件，事件参数必须包含关键参与方和金额：
  - `ArbiterStaked(address indexed arbiter, uint256 amount)`
  - `ArbiterWithdrawn(address indexed arbiter, uint256 amount)`

## 2. 合约函数与代码规范

- [x] 新增 `stakeAsArbiter() external payable nonReentrant`：
  - 任意地址可调用。
  - `msg.value` 必须等于 `arbiterStakeAmount`。
  - `activeArbiters[msg.sender] == false` 时才允许质押。
  - 成功后设置 `arbiterStakes[msg.sender] = msg.value`。
  - 成功后设置 `activeArbiters[msg.sender] = true`。
  - 成功后 `activeArbiterCount += 1`。
  - 发出 `ArbiterStaked` 事件。
- [x] 新增 `withdrawArbiterStake() external nonReentrant`：
  - 仅 `activeArbiters[msg.sender] == true` 的地址可调用。
  - 必须校验 `arbiterLockedDisputeCount[msg.sender] == 0` 或等价条件，避免未结束纠纷期间退出。
  - 先读取待退保证金金额。
  - 先清零 `arbiterStakes[msg.sender]`、设置 `activeArbiters[msg.sender] = false`、减少 `activeArbiterCount`。
  - 再使用 `call` 向仲裁员退回保证金。
  - 转账失败时 revert，并发出 `TransferFailed` 或复用现有错误。
  - 发出 `ArbiterWithdrawn` 事件。
- [x] 新增 `isEligibleArbiter(uint256 itemId, address arbiter) public view returns (bool)`：
  - 复用 `_getItem(itemId)` 确保商品存在。
  - `activeArbiters[arbiter] == true` 才返回 `true`。
  - `arbiter != item.seller`。
  - `arbiter != item.buyer`。
  - 本函数不修改状态，不检查投票方向，不记录投票。
- [x] 如需为第 5 步预留内部锁定接口，命名建议为：
  - `_lockArbiterForDispute(address arbiter) internal`
  - `_unlockArbiterForDispute(address arbiter) internal`
  - 本 change 不从外部暴露纠纷锁定操作，也不调用投票逻辑。
- [x] 所有新增资金路径必须继续遵守：
  - 先校验权限、状态和金额，再改状态；
  - 先改状态，再进行外部转账；
  - 涉及 ETH 转入/转出的函数使用 `nonReentrant`；
  - 不把仲裁员保证金混入 `pendingWithdrawals`，避免和交易资金提款语义混淆。

## 3. 测试文件：`test/EscrowMarketplace.test.js`

- [x] 更新测试部署 helper：
  - 显式传入 `deliveryWindow`、`confirmWindow`、`arbiterStakeAmount`、`minActiveArbiters`。
  - 读取并断言四个构造配置值。
- [x] 测试构造函数输入：
  - `_arbiterStakeAmount == 0` 时部署失败。
  - `_minActiveArbiters == 0` 时部署失败。
- [x] 测试 `stakeAsArbiter`：
  - 正确金额质押后 `activeArbiters(address) == true`。
  - `arbiterStakes(address)` 等于质押金额。
  - `activeArbiterCount` 增加。
  - 成功时发出 `ArbiterStaked`。
  - 错误金额质押会 revert。
  - 同一地址重复质押会 revert。
- [x] 测试 `withdrawArbiterStake`：
  - 有效仲裁员可退出并取回保证金。
  - 退出后 `activeArbiters(address) == false`。
  - 退出后 `arbiterStakes(address) == 0`。
  - 退出后 `activeArbiterCount` 减少。
  - 成功时发出 `ArbiterWithdrawn`。
  - 未质押地址退出会 revert。
  - 如测试中可通过内部测试合约或临时 helper 模拟锁定，覆盖锁定期间退出失败；否则在第 5 步接入纠纷时补测。
- [x] 测试 `isEligibleArbiter`：
  - 未质押地址返回 `false`。
  - 已质押且不是买卖双方的地址返回 `true`。
  - 商品卖家即使质押也返回 `false`。
  - 商品买家即使质押也返回 `false`。
  - 不存在的 `itemId` 会 revert `ItemNotFound`。
- [x] 测试保持原有主流程不回归：
  - 正常创建、购买、交付、确认收货、提款路径仍全部通过。
  - 退款、卖家同意退款、超时放款测试仍全部通过。

## 4. 文档与范围控制

- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 追加本步骤的实现结果，记录：
  - 新增/修改的配置、状态变量、函数、事件；
  - 通过的测试命令；
  - `arbiterStakeAmount` 和 `minActiveArbiters` 的测试值；
  - 下一步是否进入多签仲裁投票。
- [x] 更新 `ObsidianVault/02-方案设计/技术实现文档.md` 第 4 步状态和结果摘要。
- [x] 本 change 不创建前端文件，不修改 `frontend/`。
- [x] 本 change 不新增 Sepolia 部署脚本。

## 5. 验证

- [x] 运行 `npx hardhat compile`，要求 `EscrowMarketplace` 和占位合约都能编译通过。
- [x] 运行 `npx hardhat test`，要求原有测试与新增仲裁员质押/回避测试全部通过。
- [x] 如安装了 OpenSpec CLI，运行 `openspec validate add-arbiter-staking --strict` 并记录结果。

## 6. 本 change 明确不做

- [x] 不实现 `openDispute`、`respondDispute`、`submitEvidence`、`voteDispute`。
- [x] 不实现 2/3 多数票裁决、投票奖励、败诉方押金分配或仲裁超时兜底。
- [x] 不实现买卖双方纠纷押金支付、补交或超时胜诉。
- [x] 不实现卖家保证金、举报机制和信誉计数。
- [x] 不实现 React/Vite 前端，也不部署 Sepolia。
