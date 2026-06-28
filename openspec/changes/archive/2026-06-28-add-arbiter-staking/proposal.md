# 变更提案：仲裁员质押与回避

## Why

第 5 步多签仲裁投票需要先有可信的仲裁员资格基础。当前合约已经预留 `DisputeDepositPending` 和 `Disputed` 状态，但还没有定义仲裁员如何成为有效参与者、如何退出、有效仲裁员数量如何统计，也没有排除买卖双方参与自己交易仲裁的规则。

如果直接实现投票，会缺少 2/3 多数门槛的分母、仲裁员保证金约束和利益冲突回避机制。因此本 change 先补齐仲裁员质押层，为后续 `add-arbitration-voting` 提供可复用的资格判断。

## What

- 在 `EscrowMarketplace` 中新增仲裁员保证金配置和有效仲裁员状态。
- 允许任意地址按固定金额质押成为有效仲裁员。
- 允许有效仲裁员在未被未结束纠纷锁定时退出并取回保证金。
- 维护 `activeArbiterCount`，供后续纠纷投票计算最低人数和 2/3 多数门槛。
- 提供 `isEligibleArbiter(itemId, arbiter)` 资格判断，排除商品卖家和买家。
- 为质押、退出和资格相关失败场景补充测试。

## Impact

- 修改合约：`contracts/EscrowMarketplace.sol`。
- 修改测试：`test/EscrowMarketplace.test.js`。
- 新增或修改 OpenSpec delta：`openspec/changes/add-arbiter-staking/specs/escrow-core/spec.md`。
- 不修改前端、不部署 Sepolia、不实现投票裁决和纠纷押金奖励。
