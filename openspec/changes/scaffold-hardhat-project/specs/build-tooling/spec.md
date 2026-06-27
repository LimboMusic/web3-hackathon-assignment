# Build Tooling 规格增量

## ADDED Requirements

### Requirement: 工程骨架可编译可测试

项目 SHALL 提供一个 Hardhat 工程骨架，使后续合约开发可以直接编译与运行测试，而无需重复配置开发环境。

#### Scenario: 编译空骨架

- **WHEN** 开发者在初始化后的工程中运行 `npx hardhat compile`
- **THEN** 编译过程成功完成且无报错
- **AND** 使用与 `@openzeppelin/contracts` 兼容的 Solidity 版本（≥ `0.8.20`）

#### Scenario: 运行占位测试

- **WHEN** 开发者运行 `npx hardhat test`
- **THEN** 测试框架成功启动并执行占位测试
- **AND** 测试运行无环境或依赖缺失错误

### Requirement: 网络与密钥配置安全

工程 SHALL 通过环境变量配置 Sepolia 网络与部署密钥，且不得在仓库中提交任何真实密钥。

#### Scenario: 从环境变量读取网络配置

- **WHEN** `hardhat.config` 配置 Sepolia 网络
- **THEN** RPC URL 与部署私钥从环境变量（如 `SEPOLIA_RPC_URL`、`PRIVATE_KEY`）读取
- **AND** 仓库提供 `.env.example` 占位，但不包含真实取值

#### Scenario: 忽略敏感文件

- **WHEN** 工程配置 `.gitignore`
- **THEN** `.env` 与 `node_modules/` 被排除在版本控制之外
- **AND** 不提交私钥、助记词或私密 RPC API Key
