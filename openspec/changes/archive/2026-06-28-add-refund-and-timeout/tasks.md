# 任务清单

## 0. 前置文档

- [x] 在 `ObsidianVault/02-方案设计/技术实现文档.md` 中展开第 3 步设计要点、函数范围和验收边界。
- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 中写入本步骤（退款与超时处理）的准备记录。

## 1. 合约文件：`contracts/EscrowMarketplace.sol`

- [x] 在 `Item` 结构体中补充退款与计时所需字段，至少包括：
  - `uint256 paidAt`
  - `bool refundRequested`
  - `uint256 refundRequestedAt`
- [x] 在合约级别补充时间窗口配置，优先使用构造函数注入或不可变变量，至少包括：
  - `uint256 public deliveryWindow`
  - `uint256 public confirmWindow`
- [x] 保持现有状态枚举不再新增新状态；本 change 继续沿用：
  - `Created`
  - `Locked`
  - `Delivered`
  - `DisputeDepositPending`
  - `Disputed`
  - `Inactive`
- [x] 保持现有 `pendingWithdrawals` 的 pull payment 思路；退款和超时放款都只记账，不在主流程函数里直接外部转账。
- [x] 如需新增自定义错误，至少覆盖：
  - 退款尚未发起；
  - 退款已存在，不能重复发起；
  - 超时未到；
  - 卖家尚未交付；
  - 存在待处理退款，不能超时放款。
- [x] 新增事件，事件参数必须包含 `itemId` 和关键参与方：
  - `RefundRequested(uint256 indexed itemId, address indexed buyer)`
  - `RefundApproved(uint256 indexed itemId, address indexed seller, address indexed buyer, uint256 amount)`
  - `TimeoutReleased(uint256 indexed itemId, address indexed seller, uint256 amount)`

## 2. 合约函数与代码规范

- [x] 修改 `createItem`：
  - 写入文件：`contracts/EscrowMarketplace.sol`。
  - 新建商品时初始化 `paidAt = 0`、`refundRequested = false`、`refundRequestedAt = 0`。
- [x] 修改 `purchaseItem(uint256 itemId) external payable nonReentrant`：
  - 购买成功后记录 `paidAt = block.timestamp`。
  - 保持现有金额校验、卖家不能自购、状态变为 `Locked` 的逻辑不变。
- [x] 保持 `markDelivered(uint256 itemId)` 为卖家交付声明入口，但需要明确：
  - 仅 `Locked` 状态可调用；
  - `deliveredAt = block.timestamp` 作为 `confirmWindow` 的起点；
  - 后续超时放款必须依赖这个时间戳，不能再从 `paidAt` 起算。
- [x] 新增 `requestRefund(uint256 itemId) external`：
  - 仅商品买家可调用。
  - 仅 `Locked` 或 `Delivered` 状态可调用。
  - 不允许重复发起退款。
  - 成功后设置 `refundRequested = true`、`refundRequestedAt = block.timestamp`。
  - 不改变商品状态到 `Inactive`，因为此时尚未真正退款。
  - 发出 `RefundRequested` 事件。
- [x] 新增 `approveRefund(uint256 itemId) external nonReentrant`：
  - 仅商品卖家可调用。
  - 仅在 `refundRequested == true` 时可执行。
  - 仅允许 `Locked` 或 `Delivered` 状态的商品进入退款完成。
  - 先把商品状态改为 `Inactive`，并清除退款请求标记。
  - 再把 `item.price` 记入 `pendingWithdrawals[item.buyer]`。
  - 不直接向买家转账。
  - 发出 `RefundApproved` 事件。
- [x] 新增 `releaseAfterTimeout(uint256 itemId) external nonReentrant`：
  - 仅商品卖家可调用。
  - 仅 `Delivered` 状态可调用。
  - 必须校验 `deliveredAt > 0`。
  - 必须校验 `block.timestamp >= deliveredAt + confirmWindow`。
  - 必须校验 `refundRequested == false`。
  - 成功后先将商品状态改为 `Inactive`。
  - 再把 `item.price` 记入 `pendingWithdrawals[item.seller]`。
  - 发出 `TimeoutReleased` 事件。
- [x] 如本步引入通用提款函数命名调整（例如未来把 `withdrawProceeds` 泛化为买卖双方都能提取），必须保持对卖家和买家可提现余额的统一支持，并同步更新测试与文档。
- [x] 所有新增逻辑必须继续遵守：
  - 先校验权限、状态和时间，再改状态；
  - 先改状态和余额，再进行任何外部转账；
  - 涉及资金归属变化的路径继续使用 `nonReentrant`。

## 3. 测试文件：`test/EscrowMarketplace.test.js`

- [x] 为时间窗口新增部署断言：
  - 合约部署后可读取 `deliveryWindow` 和 `confirmWindow`。
  - 若通过构造函数传值，测试中应显式传入短窗口值便于 `evm_increaseTime`。
- [x] 测试 `requestRefund`：
  - 买家在 `Locked` 状态可发起退款。
  - 买家在 `Delivered` 状态可发起退款。
  - 非买家不能发起退款。
  - `Created` 或 `Inactive` 状态不能发起退款。
  - 重复发起退款会 revert。
  - 成功时 `refundRequested == true` 且发出 `RefundRequested`。
- [x] 测试 `approveRefund`：
  - 卖家在退款已发起后可同意退款。
  - 状态变为 `Inactive`。
  - `pendingWithdrawals(buyer)` 增加商品价格。
  - 买家可随后调用提款函数取回资金。
  - 非卖家不能同意退款。
  - 未发起退款时不能同意退款。
  - 已退款完成后不能重复操作。
- [x] 测试 `releaseAfterTimeout`：
  - 卖家在 `Delivered` 后、超过 `confirmWindow` 时可超时放款。
  - 状态变为 `Inactive`。
  - `pendingWithdrawals(seller)` 增加商品价格。
  - 成功时发出 `TimeoutReleased`。
  - 未到超时时间不能放款。
  - 未 `markDelivered` 时不能放款。
  - 商品仍处于 `Locked` 时不能放款。
  - 已发起退款后不能放款。
- [x] 测试计时器串行：
  - 买家付款后，即使 `paidAt + confirmWindow` 已经过期，只要卖家还未 `markDelivered`，也不能走 `releaseAfterTimeout`。
  - `confirmWindow` 必须以 `deliveredAt` 为起点，而不是以 `paidAt` 为起点。
- [x] 测试退款与超时互斥：
  - 买家发起退款后，卖家不能通过等待确认超时来拿钱。
  - 卖家已超时放款后，买家不能再发起退款。
- [x] 测试保持原有主流程不回归：
  - 正常购买、交付、确认收货、卖家提款路径仍全部通过。
  - 新增字段不会破坏现有 `createItem`、`purchaseItem`、`markDelivered`、`confirmReceived`、`withdrawProceeds` 测试。

## 4. 文档与范围控制

- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 追加本步骤的实现结果，记录：
  - 新增/修改的字段、函数、事件；
  - 通过的测试命令；
  - 时间窗口的实际默认值；
  - 下一步是否进入仲裁员质押与多签仲裁。
- [x] 更新 `ObsidianVault/02-方案设计/技术实现文档.md` 第 3 步状态和结果摘要。
- [x] 本 change 不创建前端文件，不修改 `frontend/`。
- [x] 本 change 不新增 Sepolia 部署脚本。

## 5. 验证

- [x] 运行 `npx hardhat compile`，要求 `EscrowMarketplace` 和占位合约都能编译通过。
- [x] 运行 `npx hardhat test`，要求原有测试与新增 refund / timeout 测试全部通过。
- [x] 如安装了 OpenSpec CLI，运行 `openspec validate add-refund-and-timeout --strict` 并记录结果。

## 6. 本 change 明确不做

- [x] 不实现 `openDispute`、`respondDispute`、`resolveDisputeDepositTimeout`、`resolveDisputeTimeout`。
- [x] 不实现仲裁员保证金、仲裁员退出、有效仲裁员数量和当事人回避。
- [x] 不实现证据哈希提交、投票、多数票裁决或败诉方押金奖励。
- [x] 不实现卖家保证金、举报机制和信誉计数。
- [x] 不实现 React/Vite 前端，也不部署 Sepolia。
