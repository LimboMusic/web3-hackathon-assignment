# Tasks: fix-review-metamask-arbiter-harness

## 1. 合约仲裁快照与举报规则

- [x] 1.1 `activeArbiterList` 在 stake/withdraw 维护
- [x] 1.2 `Dispute` 新增 `eligibleArbitersSnapshot`；`respondDispute` 写入并锁定
- [x] 1.3 `voteDispute` 移除重复 lock；解决时 `_unlockSnapshotArbiters`
- [x] 1.4 `_isValidDisputeReportTarget` + `reportMisconduct` 前置条件
- [x] 1.5 新增 `isDisputeEligibleArbiter` view

## 2. 合约测试

- [x] 2.1 纠纷中未投票快照仲裁员 withdraw 失败
- [x] 2.2 纠纷结束后 withdraw 仍可 `reportNoVote`
- [x] 2.3 无纠纷商品 `reportMisconduct` 失败
- [x] 2.4 改写门槛快照相关 withdraw 用例
- [x] 2.5 E2E 投票仲裁员纠纷中 withdraw 失败
- [x] 2.6 `rtk npm test` 通过

## 3. Harness 隔离

- [x] 3.1 从 `hardhat.config.js` 移除 harness subtask
- [x] 3.2 新建 `hardhat.config.test.js`
- [x] 3.3 `package.json` test script 使用 test config
- [x] 3.4 `rtk npm run compile` 无 harness artifact

## 4. 前端 MetaMask / Ethers 只读

- [x] 4.1 `rtk npm install ethers --prefix frontend`
- [x] 4.2 `escrowDeployment.ts`、`ethereum.ts`、`escrowContract.ts`、`wallet.ts`
- [x] 4.3 `DemoUIContext` / `useDemoUI` 扩展 walletMode、chainId、contractBasics
- [x] 4.4 `TopStatusBar`、`Deployment` 展示真实钱包/链上只读
- [x] 4.5 `rtk npm run build:frontend` 通过

## 5. 文档

- [x] 5.1 回写 `ObsidianVault/04-开发记录/开发记录.md`
