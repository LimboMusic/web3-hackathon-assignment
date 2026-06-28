# 修复纠纷投票门槛快照

## 为什么改

`voteDispute` 与 `resolveDisputeTimeout` 当前用实时 `activeArbiterCount` 计算 2/3 门槛：

```text
threshold = (activeArbiterCount * 2 + 2) / 3
```

纠纷进入 `Disputed` 后，未投票仲裁员未被锁定，可调用 `withdrawArbiterStake()` 退出，使 `activeArbiterCount` 下降。例如 3 名仲裁员时门槛为 2 票，若 2 人退出后仅剩 1 人，门槛会被错误降为 1 票，单票即可裁决，破坏多签语义。

## 改什么

- 在 `Dispute` struct 中新增 `arbiterCountSnapshot` 与 `voteThresholdSnapshot`。
- `respondDispute` 成功进入 `Disputed` 时：
  - 再次校验 `activeArbiterCount >= minActiveArbiters`；
  - 快照当时的有效仲裁员数量与投票门槛。
- `voteDispute` 与 `resolveDisputeTimeout` 使用 `voteThresholdSnapshot`，不再读取实时 `activeArbiterCount`。
- `openDispute` 保留原有 `activeArbiterCount >= minActiveArbiters` 校验。

## 影响范围

- `contracts/EscrowMarketplace.sol`
- `test/EscrowMarketplace.test.js`
- `openspec/specs/escrow-core/spec.md`（通过 delta spec 同步）

## 明确不做

- 不修改仲裁员质押金额、最小仲裁员数或 2/3 计算公式本身。
- 不限制纠纷进行中新增仲裁员投票资格（仍按 `isEligibleArbiter` 实时判断）。
- 不涉及前端或 Sepolia 部署。
