# 任务清单

## 0. 前置文档

- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 中写入本步骤（核心担保托管合约）的准备记录。
- [x] 在 `ObsidianVault/02-方案设计/技术实现文档.md` 中展开第 2 步设计要点和验收范围。

## 1. 合约文件：`contracts/EscrowMarketplace.sol`

- [x] 新增合约 `EscrowMarketplace`，使用 Solidity `^0.8.20`，并优先沿用当前 Hardhat 配置。
- [x] 引入并使用 OpenZeppelin `ReentrancyGuard`；涉及外部转账的函数必须使用 `nonReentrant`。
- [x] 定义状态枚举 `State`，至少包含：
  - `Created`：商品已创建，等待买家付款。
  - `Locked`：买家已付款，资金托管在合约中。
  - `Delivered`：卖家已标记交付，等待买家确认收货。
  - `DisputeDepositPending`：预留给后续纠纷押金流程，本 change 不进入该状态。
  - `Disputed`：预留给后续仲裁流程，本 change 不进入该状态。
  - `Inactive`：交易结束或商品下架。
- [x] 定义 `Item` 结构体，字段至少包括：
  - `uint256 id`
  - `address payable seller`
  - `address buyer`
  - `uint256 price`
  - `string metadataHash`
  - `State state`
  - `uint256 createdAt`
  - `uint256 deliveredAt`
  - `bool delisted`
- [x] 定义存储变量：
  - `uint256 public nextItemId`
  - `mapping(uint256 => Item) public items`
  - `mapping(address => uint256) public pendingWithdrawals`
- [x] 定义自定义错误或清晰 `require` 文案，覆盖：
  - 商品不存在。
  - 非卖家操作。
  - 非买家操作。
  - 状态不匹配。
  - 价格为 `0`。
  - 元数据哈希为空。
  - 付款金额错误。
  - 卖家不能购买自己的商品。
  - 已下架或不可购买。
  - 无可提现余额。
- [x] 定义事件，事件参数必须包含 `itemId` 和关键参与方：
  - `ItemCreated(uint256 indexed itemId, address indexed seller, uint256 price, string metadataHash)`
  - `ItemPriceUpdated(uint256 indexed itemId, uint256 oldPrice, uint256 newPrice)`
  - `ItemMetadataUpdated(uint256 indexed itemId, string oldMetadataHash, string newMetadataHash)`
  - `ItemDelisted(uint256 indexed itemId, address indexed seller)`
  - `ItemPurchased(uint256 indexed itemId, address indexed buyer, uint256 price)`
  - `ItemDelivered(uint256 indexed itemId, address indexed seller)`
  - `ItemReceived(uint256 indexed itemId, address indexed buyer)`
  - `Withdrawal(address indexed seller, uint256 amount)`

## 2. 合约函数与代码规范

- [x] 实现 `createItem(uint256 price, string calldata metadataHash) external returns (uint256 itemId)`：
  - 写入文件：`contracts/EscrowMarketplace.sol`。
  - 校验 `price > 0`。
  - 校验 `bytes(metadataHash).length > 0`。
  - 使用递增 `nextItemId` 分配商品编号。
  - 初始状态必须为 `State.Created`，`buyer` 为空地址，`delisted` 为 `false`。
  - 发出 `ItemCreated` 事件。
- [x] 实现 `updatePrice(uint256 itemId, uint256 newPrice) external`：
  - 仅商品卖家可调用。
  - 仅 `State.Created` 且未下架时可调用。
  - 校验 `newPrice > 0`。
  - 不允许商品进入托管后改价。
  - 发出 `ItemPriceUpdated` 事件。
- [x] 实现 `updateMetadata(uint256 itemId, string calldata newMetadataHash) external`：
  - 仅商品卖家可调用。
  - 仅 `State.Created` 且未下架时可调用。
  - 校验 `bytes(newMetadataHash).length > 0`。
  - 不允许商品进入托管后修改核心元数据。
  - 发出 `ItemMetadataUpdated` 事件。
- [x] 实现 `delistItem(uint256 itemId) external`：
  - 仅商品卖家可调用。
  - 仅 `State.Created` 且未被购买时可调用。
  - 设置 `delisted = true`。
  - 状态变为 `State.Inactive`。
  - 发出 `ItemDelisted` 事件。
- [x] 实现 `purchaseItem(uint256 itemId) external payable nonReentrant`：
  - 仅 `State.Created` 且未下架商品可购买。
  - 卖家不能购买自己的商品。
  - `msg.value` 必须等于 `item.price`。
  - 购买成功后记录 `buyer = msg.sender`。
  - 状态变为 `State.Locked`。
  - 不向卖家直接转账，资金留在合约。
  - 发出 `ItemPurchased` 事件。
- [x] 实现 `markDelivered(uint256 itemId) external`：
  - 仅商品卖家可调用。
  - 仅 `State.Locked` 可调用。
  - 状态变为 `State.Delivered`。
  - 记录 `deliveredAt = block.timestamp`。
  - 发出 `ItemDelivered` 事件。
- [x] 实现 `confirmReceived(uint256 itemId) external nonReentrant`：
  - 仅商品买家可调用。
  - 仅 `State.Delivered` 可调用。
  - 先把状态改为 `State.Inactive`。
  - 再把 `item.price` 记入 `pendingWithdrawals[item.seller]`。
  - 不在本函数中直接向卖家转账。
  - 发出 `ItemReceived` 事件。
- [x] 实现 `withdrawProceeds() external nonReentrant`：
  - 读取 `pendingWithdrawals[msg.sender]`。
  - 余额为 `0` 时拒绝。
  - 必须先把 `pendingWithdrawals[msg.sender]` 清零，再使用 `call` 转账。
  - 转账失败时必须 revert，不能吞掉失败。
  - 发出 `Withdrawal` 事件。

## 3. 测试文件：`test/EscrowMarketplace.test.js`

- [x] 新增测试文件 `test/EscrowMarketplace.test.js`，使用当前 Hardhat + Chai + ethers v6 写法。
- [x] 测试部署：
  - 部署 `EscrowMarketplace`。
  - 准备 `seller`、`buyer`、`other` 三类账户。
- [x] 测试 `createItem`：
  - 有效价格和元数据哈希时创建成功。
  - `items(itemId)` 中 seller、price、metadataHash、state 正确。
  - 发出 `ItemCreated`。
  - 价格为 `0` 时 revert。
  - 空元数据哈希时 revert。
- [x] 测试 `updatePrice` 和 `updateMetadata`：
  - 卖家在 `Created` 状态可修改。
  - 非卖家不能修改。
  - 进入 `Locked` 后不能修改。
  - 新价格为 `0`、新元数据为空时 revert。
  - 成功时发出对应事件。
- [x] 测试 `delistItem`：
  - 卖家在未购买前可下架。
  - 下架后状态为 `Inactive`，`delisted` 为 `true`。
  - 下架后不能购买。
  - 非卖家不能下架。
  - 已购买后不能下架。
- [x] 测试 `purchaseItem`：
  - 买家支付准确金额后状态变为 `Locked`。
  - 合约余额增加商品价格。
  - 记录 buyer 地址。
  - 发出 `ItemPurchased`。
  - 付款金额不足或过多时 revert。
  - 卖家自购时 revert。
  - 重复购买同一商品时 revert。
- [x] 测试 `markDelivered`：
  - 卖家在 `Locked` 状态可标记交付。
  - 状态变为 `Delivered`。
  - `deliveredAt` 大于 `0`。
  - 发出 `ItemDelivered`。
  - 非卖家不能标记交付。
  - 未购买商品不能标记交付。
- [x] 测试 `confirmReceived`：
  - 买家在 `Delivered` 状态可确认收货。
  - 状态变为 `Inactive`。
  - `pendingWithdrawals(seller)` 增加商品价格。
  - 发出 `ItemReceived`。
  - 非买家不能确认收货。
  - 未交付时不能确认收货。
  - 已确认后不能重复确认。
- [x] 测试 `withdrawProceeds`：
  - 卖家可提取 `pendingWithdrawals` 中的余额。
  - 提款后 `pendingWithdrawals(seller)` 变为 `0`。
  - 卖家 ETH 余额变化要扣除 gas 后合理断言，可用 `changeEtherBalances` 或 BigInt 手动计算。
  - 无余额提款时 revert。
  - 非卖家但无余额账户提款时 revert。

## 4. 现有文件处理

- [x] 保留 `contracts/Placeholder.sol`、`test/Placeholder.test.js` 和 `scripts/deploy-placeholder.js`，除非后续单独 change 明确要求删除。
- [x] 不修改 `hardhat.config.js`，除非编译新合约必须调整；若调整，必须在本任务清单和开发记录中说明原因。
- [x] 不引入前端文件，不创建 `frontend/`。
- [x] 不新增 Sepolia 部署脚本。

## 5. 验证与记录

- [x] 运行 `npx hardhat compile`，要求 `EscrowMarketplace` 与占位合约均能编译。
- [x] 运行 `npx hardhat test`，要求 `Placeholder` 测试和 `EscrowMarketplace` 测试全部通过。
- [x] 如本地缺少 Hardhat 可执行入口，先运行 `npm install` 修复依赖，再重新执行编译和测试；不要提交 `node_modules/`。
- [x] 回写 `ObsidianVault/04-开发记录/开发记录.md`，记录：
  - 新增/修改的文件。
  - 通过的测试命令。
  - 发现的问题和解决方案。
  - 下一步是否进入退款、超时或仲裁 change。
- [x] 更新 `ObsidianVault/02-方案设计/技术实现文档.md` 第 2 步状态和结果摘要。

## 6. 本 change 明确不做

- [x] 不实现买家申请退款、卖家同意退款或双方确认退款。
- [x] 不实现超时放款、超时退款或自动裁决。
- [x] 不实现仲裁员质押、退出、投票、多签裁决或奖励分配。
- [x] 不实现纠纷押金、证据哈希、卖家保证金、举报或信誉计数。
- [x] 不实现 React/Vite 前端。
- [x] 不部署 Sepolia，不记录合约地址或交易哈希。
