# 变更提案：合约测试与覆盖补强

## Why

前 2-6 步已经完成核心托管、退款超时、仲裁员质押、多签裁决、卖家保证金、举报和信誉计数。当前测试数量较多，但第 7 步需要把测试从“随功能增量补充”进一步整理为“可支撑课堂演示和报告说明的回归测试集”。

本 change 的目标是验证合约在核心演示路径和关键边界下稳定可靠，尤其是资金不能重复结算、状态不能越权跳转、仲裁和举报不能被非授权账户滥用。

## What

- 补强四条课堂演示路径的完整流程测试：
  - 正常交易；
  - 协商退款；
  - 恶意退款进入仲裁；
  - 超时兜底。
- 补充资金安全断言，覆盖主交易资金、卖家保证金、纠纷押金、举报押金和 `pendingWithdrawals`。
- 补充权限、状态、金额、重复操作、证据哈希、仲裁员资格、owner 复核等边界测试。
- 如有必要，整理测试 helper 和 harness，但不改变合约业务行为。
- 记录 Hardhat 测试结果，供报告和 PPT 引用。

## Impact

- 主要修改：`test/EscrowMarketplace.test.js`。
- 可能修改：`test/contracts/EscrowMarketplaceHarness.sol`、`hardhat.config.js`、`package.json`（仅当需要覆盖率脚本或测试辅助配置）。
- 新增 OpenSpec delta：`openspec/changes/add-contract-tests/specs/build-tooling/spec.md`。
- 更新 Obsidian：`ObsidianVault/02-方案设计/技术实现文档.md`、`ObsidianVault/04-开发记录/开发记录.md`。
- 不修改合约业务规则、不创建前端、不部署 Sepolia、不提交真实密钥。
