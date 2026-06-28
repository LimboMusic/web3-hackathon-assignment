# Sepolia 重部署 EscrowMarketplace

## 为什么改

`fix-review-metamask-arbiter-harness` 已更新合约逻辑（仲裁员资格快照、举报规则），但 Sepolia 链上仍为旧合约地址，需重新部署使链上与本地一致。

## 改什么

- 运行 `npm run deploy:sepolia` 部署新 `EscrowMarketplace`
- 更新 `deployments/sepolia/EscrowMarketplace.json`
- 同步前端 `deployment.ts`、`mockDashboard.ts` 中的展示地址
- 记录 `ObsidianVault/04-开发记录/部署记录.md` 与开发记录

## 明确不做

- Etherscan 源码验证（可选后续）
- 旧合约状态迁移
