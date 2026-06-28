# 任务清单

## 0. 前置文档

- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 中写入本修复的准备记录。

## 1. 合约：`contracts/EscrowMarketplace.sol`

- [x] 在 `Dispute` struct 中新增：
  - `uint256 arbiterCountSnapshot`
  - `uint256 voteThresholdSnapshot`
- [x] 新增内部纯函数 `_computeVoteThreshold(uint256 arbiterCount)`，公式为 `(arbiterCount * 2 + 2) / 3`。
- [x] 修改 `respondDispute`：
  - 进入 `Disputed` 前校验 `activeArbiterCount >= minActiveArbiters`；
  - 写入 `arbiterCountSnapshot = activeArbiterCount`；
  - 写入 `voteThresholdSnapshot = _computeVoteThreshold(activeArbiterCount)`。
- [x] 修改 `voteDispute`：使用 `dispute.voteThresholdSnapshot` 判断是否达成多数。
- [x] 修改 `resolveDisputeTimeout`：使用 `dispute.voteThresholdSnapshot` 判断是否未达多数。
- [x] `openDispute` 保持 `activeArbiterCount >= minActiveArbiters` 校验不变。

## 2. 测试：`test/EscrowMarketplace.test.js`

- [x] `respondDispute` 成功后断言快照字段：`arbiterCountSnapshot = 3`，`voteThresholdSnapshot = 2`（默认 3 仲裁员配置）。
- [x] `respondDispute` 在 `openDispute` 后、`respond` 前仲裁员退出至不足 `minActiveArbiters` 时 revert `InsufficientActiveArbiters`。
- [x] 纠纷进入 `Disputed` 后，两名未投票仲裁员退出；剩余 1 名仲裁员单票投票后状态仍为 `Disputed`。
- [x] 在上述场景下，再让另一名新质押仲裁员投同向票，达到快照门槛 2 后正常裁决。
- [x] 原有 2/3 裁决、仲裁超时等测试保持通过。

## 3. 文档

- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 追加实现结果。
- [x] 更新 `ObsidianVault/02-方案设计/技术实现文档.md` 第 5 步中门槛计算说明（改为快照语义）。

## 4. 验证

- [x] `rtk npx hardhat test` 全部通过。
- [x] `rtk npx openspec validate --all --strict` 通过。
