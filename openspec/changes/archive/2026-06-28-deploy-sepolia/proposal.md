# 变更提案：部署到 Sepolia

## Why

前 2-7 步已经完成核心合约、退款超时、仲裁、卖家保证金、举报信誉以及回归测试补强。课程 Demo 下一步需要把合约部署到 Sepolia 测试网，产出可在报告、PPT 和后续前端接入中引用的合约地址、部署参数、ABI 与部署记录。

本 change 的目标是把部署流程做成可重复执行、可审计、不会泄露密钥的工程步骤，而不是只手动运行一次命令。

## What

- 编写或替换 `scripts/deploy.js`，部署 `EscrowMarketplace` 并显式打印部署网络、部署账户、合约地址、部署交易哈希和构造参数。
- 使用环境变量读取 Sepolia RPC 与部署私钥，必要时补充 `.env.example`，但不得提交真实 `.env`、私钥、助记词或私密 API Key。
- 明确部署构造参数来源，包括仲裁员保证金、卖家保证金、举报押金、默认交付窗口、确认窗口、纠纷响应窗口和投票窗口。
- 生成或更新前端后续可读取的部署产物，例如 ABI、合约地址、网络 chain id 与部署时间；若前端目录尚未存在，可先放在 `deployments/sepolia/` 或 `scripts/` 输出目录。
- 部署完成后，把 Sepolia 部署结果写入 `ObsidianVault/04-开发记录/部署记录.md`，并在开发记录中追加验证摘要。

## Impact

- 主要修改：`scripts/deploy.js`、`.env.example`、部署产物目录、`ObsidianVault/04-开发记录/部署记录.md`。
- 可能修改：`package.json`（新增 `deploy:sepolia` 脚本）、`hardhat.config.js`（仅在现有 Sepolia 配置不足时维护）。
- 新增 OpenSpec delta：`openspec/changes/deploy-sepolia/specs/build-tooling/spec.md`。
- 不修改合约业务规则，不新增前端页面，不提交真实密钥，不把测试网私密配置写入仓库。
