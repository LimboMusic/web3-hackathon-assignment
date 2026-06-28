# 变更提案：卖家保证金、举报与信誉

## Why

当前合约已经具备核心托管、退款超时、仲裁员质押和多签纠纷裁决能力，但担保成本仍不完全对称：买家付款后资金被锁定，仲裁员需要质押保证金，卖家发布或成交虚假商品的直接成本较低。

第 6 步需要补齐卖家保证金、举报约束和链上信誉计数，让课堂 Demo 能说明“信任对称”和“可审计责任记录”。举报机制只做轻量闭环：举报是标记和复核入口，不把主观裁错等同于作恶；链上可自动判断的“不投票”类举报由合约处理，主观作恶类举报由管理员手动复核。

## What

- 新增卖家保证金配置 `sellerStakeAmount`，卖家创建商品时需要随交易支付固定保证金。
- 商品正常结束、退款完成或纠纷兜底结束时，按结局把卖家保证金记入可提现余额或罚没池。
- 仲裁明确支持买家退款时，视为卖家败诉；本步骤只在该场景下罚没卖家保证金，避免把普通退款协商误判为卖家作恶。
- 新增轻量信誉计数：完成次数、纠纷次数、买家胜诉次数、卖家胜诉次数、卖家保证金罚没次数。
- 新增举报押金配置 `reportDeposit` 和举报记录。
- 新增两类举报：
  - `NoVote`：针对仲裁员在已结束纠纷中未投票的链上事实，由合约自动判定。
  - `Misconduct`：针对可证贿赂、串通、违背链上铁证等主观作恶，由 owner 手动复核。
- 举报成立时退还举报人押金；举报不成立时押金补偿被举报仲裁员；所有资金继续使用 `pendingWithdrawals` pull payment。

## Impact

- 修改合约：`contracts/EscrowMarketplace.sol`。
- 修改测试：`test/EscrowMarketplace.test.js`。
- 如测试需要，可修改 `test/contracts/EscrowMarketplaceHarness.sol`。
- 新增 OpenSpec delta：`openspec/changes/add-seller-stake-reputation/specs/escrow-core/spec.md`。
- 更新 Obsidian：`ObsidianVault/02-方案设计/技术实现文档.md`、`ObsidianVault/04-开发记录/开发记录.md`。
- 不创建前端、不部署 Sepolia、不实现稳定币、不实现 DAO 复核陪审团。
