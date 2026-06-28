# 任务清单

## 0. 前置文档

- [x] 阅读 `ObsidianVault/02-方案设计/技术实现文档.md` 的步骤 8 小节，确认部署范围。
- [x] 阅读 `ObsidianVault/02-方案设计/项目讨论结果-去中心化二手交易担保托管.md` 中与部署、安全和演示相关的约束。
- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 中记录本步骤准备内容。

## 1. 部署脚本：`scripts/deploy.js`

- [x] 替换或新增正式部署脚本，不继续使用 `scripts/deploy-placeholder.js` 作为 Sepolia 部署入口。
- [x] 使用 Hardhat ethers 获取部署账户，并在部署前打印：
  - 网络名称；
  - `chainId`；
  - 部署账户地址；
  - 部署账户余额；
  - 构造参数摘要。
- [x] 部署 `EscrowMarketplace`，构造参数必须与当前合约构造函数保持一致。
- [x] 构造参数应集中定义为常量或从环境变量读取，至少覆盖：
  - 仲裁员保证金；
  - 卖家保证金；
  - 举报押金；
  - 交付窗口；
  - 确认窗口；
  - 纠纷响应窗口；
  - 仲裁投票窗口。
- [x] 等待部署交易确认后打印：
  - 合约地址；
  - 部署交易哈希；
  - 区块号；
  - 部署者地址；
  - 可复制到前端和报告中的摘要。

## 2. 环境变量与脚本入口

- [x] 检查 `hardhat.config.js` 中 `networks.sepolia` 只从 `SEPOLIA_RPC_URL` 和 `PRIVATE_KEY` 读取配置。
- [x] 检查 `.gitignore` 已忽略 `.env`。
- [x] 更新 `.env.example`，仅保留占位值和注释，不写真实 RPC URL、私钥或助记词。
- [x] 在 `package.json` 中新增或确认脚本：
  - `deploy:sepolia`：运行 `hardhat run scripts/deploy.js --network sepolia`。

## 3. 部署产物

- [x] 生成 Sepolia 部署产物，建议路径为 `deployments/sepolia/EscrowMarketplace.json`。
- [x] 部署产物至少包含：
  - `network`；
  - `chainId`；
  - `contractName`；
  - `address`；
  - `transactionHash`；
  - `deployer`；
  - `deployedAt`；
  - `constructorArgs`；
  - `abi`。
- [x] 产物中的 ABI 应来自 Hardhat artifact，不手写 ABI。
- [x] 若部署失败，不生成误导性的成功产物；应让脚本以非零状态退出。

## 4. 验证

- [x] 运行 `rtk npx hardhat compile`。
- [x] 运行 `rtk npx hardhat test`，确认部署脚本修改没有破坏现有测试。
- [x] 在具备 Sepolia 环境变量和测试 ETH 的情况下运行 `rtk npm run deploy:sepolia`。
- [x] 如未实际部署，必须在开发记录中说明阻塞原因，例如缺少 `SEPOLIA_RPC_URL`、`PRIVATE_KEY` 或测试 ETH。
- [x] 运行 `rtk npx openspec validate deploy-sepolia --strict`。

## 5. 部署记录与交付

- [x] 若部署成功，创建或更新 `ObsidianVault/04-开发记录/部署记录.md`，记录：
  - 部署时间；
  - 合约名称；
  - 合约地址；
  - 部署账户；
  - 网络；
  - 交易哈希；
  - 构造参数；
  - 备注。
- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 中追加本 change 的实现、验证和部署结果。
- [x] 如合约已在区块浏览器可查，记录 Sepolia Etherscan 链接；不强制做源码验证，除非后续单独创建 change。

## 6. 本 change 明确不做

- [x] 不修改 `contracts/EscrowMarketplace.sol` 的业务规则或状态机。
- [x] 不创建 React/Vite 前端页面。
- [x] 不实现前端合约接入。
- [x] 不提交 `.env`、真实私钥、助记词或私密 RPC API Key。
- [x] 不强制完成 Etherscan 源码验证；如需要，后续单独创建 OpenSpec change。
