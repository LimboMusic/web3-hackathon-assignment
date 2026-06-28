## ADDED Requirements

### Requirement: Sepolia 部署流程可重复且不泄露密钥

项目 SHALL 提供可重复执行的 Sepolia 部署脚本，通过环境变量读取网络与部署账户配置，并产出可供前端、报告和 PPT 引用的部署记录。

#### Scenario: 使用环境变量部署到 Sepolia

- **WHEN** 开发者配置 `SEPOLIA_RPC_URL`、`PRIVATE_KEY` 并运行 `npm run deploy:sepolia`
- **THEN** 部署脚本连接 Sepolia 网络并部署 `EscrowMarketplace`
- **AND** 部署脚本在控制台输出网络、`chainId`、部署账户、合约地址、部署交易哈希和构造参数摘要
- **AND** 仓库不提交真实 `.env`、私钥、助记词或私密 RPC API Key

#### Scenario: 生成前端可用部署产物

- **WHEN** Sepolia 部署成功
- **THEN** 项目生成包含合约地址、网络、`chainId`、部署交易哈希、部署账户、构造参数、部署时间和 ABI 的部署产物
- **AND** ABI 来自 Hardhat artifact
- **AND** 后续前端接入可以直接读取该产物或复制其中的地址与 ABI

#### Scenario: 记录部署结果

- **WHEN** Sepolia 部署完成
- **THEN** 开发者在 `ObsidianVault/04-开发记录/部署记录.md` 记录部署时间、合约名称、合约地址、部署账户、网络、交易哈希、构造参数和备注
- **AND** 在 `ObsidianVault/04-开发记录/开发记录.md` 追加本步骤的验证结果

#### Scenario: 缺少部署条件时明确失败

- **WHEN** 缺少 `SEPOLIA_RPC_URL`、`PRIVATE_KEY` 或测试 ETH
- **THEN** 部署不得生成成功部署产物
- **AND** 开发记录 SHALL 说明未部署原因和下一步需要补齐的条件
