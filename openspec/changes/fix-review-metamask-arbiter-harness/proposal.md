# Review 修复：MetaMask 接入 + 仲裁快照 + Harness 隔离

## 为什么改

Code review 发现三项问题：

1. 前端 `connectWallet` 为纯 mock，未使用 MetaMask / Ethers.js 读取 Sepolia 部署合约。
2. 举报目标校验依赖实时 `activeArbiters` / `arbiterStakes`，纠纷结束后已 withdraw 的未投票仲裁员无法被 `reportNoVote`；未投票快照仲裁员纠纷中可 withdraw 逃避责任；`reportMisconduct` 缺少纠纷已解决校验。
3. `hardhat.config.js` 无条件编译 `EscrowMarketplaceHarness`，生产 compile artifact 混入测试合约。

## 改什么

### 前端

- 安装 `ethers`，从 `deployments/sepolia/EscrowMarketplace.json` 读取 address/abi。
- `connectWallet` 使用 `window.ethereum` 请求账号、读取 chainId，Sepolia 上只读 `deliveryWindow`、`confirmWindow`、`nextItemId`、`activeArbiterCount`。
- 保留课堂 mock fallback，`walletMode` UI 明确区分链上钱包与 Mock。

### 合约

- 维护有界 `activeArbiterList`；`respondDispute` 写入 `eligibleArbitersSnapshot` 并锁定快照仲裁员。
- 纠纷期间快照仲裁员不得 `withdrawArbiterStake`；纠纷结束后解锁。
- `reportNoVote` / `reportMisconduct` 使用纠纷快照或实际投票者校验目标；`reportMisconduct` 要求纠纷已创建且已解决。

### Hardhat

- 默认 `hardhat.config.js` 不编译 harness；`hardhat.config.test.js` 供 `npm test` 使用。

## 影响范围

- `contracts/EscrowMarketplace.sol`
- `test/EscrowMarketplace.test.js`
- `hardhat.config.js`、`hardhat.config.test.js`、`package.json`
- `frontend/` 钱包层、服务层、TopStatusBar、Deployment

## 明确不做

- Sepolia 重部署（链上合约需后续单独 change 更新）。
- Marketplace / TradeDetail / Arbitration 写操作全量替换为链上交易（本次仅只读接入）。
