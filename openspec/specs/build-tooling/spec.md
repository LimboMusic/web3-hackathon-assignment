# Build Tooling 规格

## Purpose

定义 Hardhat 工程骨架的编译、测试与网络配置要求，使后续合约开发可以直接编译与运行测试，而无需重复配置开发环境。

## Requirements

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

### Requirement: 合约回归测试集覆盖核心演示路径

项目 SHALL 提供可重复运行的 Hardhat 合约回归测试集，覆盖课堂 Demo 的核心演示路径和关键边界条件。

#### Scenario: 正常交易路径被测试覆盖

- **WHEN** 开发者运行 `npx hardhat test`
- **THEN** 测试集覆盖创建商品、买家付款、卖家交付、买家确认收货和卖家提款
- **AND** 测试断言卖家可提现余额包含主交易资金和卖家保证金

#### Scenario: 协商退款路径被测试覆盖

- **WHEN** 开发者运行 `npx hardhat test`
- **THEN** 测试集覆盖买家申请退款和卖家同意退款
- **AND** 测试断言主交易资金退给买家
- **AND** 测试断言卖家保证金退给卖家

#### Scenario: 仲裁裁决路径被测试覆盖

- **WHEN** 开发者运行 `npx hardhat test`
- **THEN** 测试集覆盖纠纷发起、纠纷押金补交、证据哈希提交、仲裁员投票和 2/3 多数裁决
- **AND** 测试断言支持买家与支持卖家的两种结算方向
- **AND** 测试断言纠纷押金奖励和卖家保证金结算方向正确

#### Scenario: 超时兜底路径被测试覆盖

- **WHEN** 开发者运行 `npx hardhat test`
- **THEN** 测试集覆盖交付超时、确认超时、纠纷押金响应超时和仲裁投票超时
- **AND** 测试断言超时路径不会导致主交易资金或押金永久锁死

### Requirement: 合约回归测试集覆盖关键边界

项目 SHALL 在 Hardhat 测试中覆盖权限、状态、金额、重复操作和资金结算边界。

#### Scenario: 非授权调用被测试覆盖

- **WHEN** 开发者运行 `npx hardhat test`
- **THEN** 测试集覆盖非卖家、非买家、非当事人、未质押仲裁员、交易当事人仲裁员和非 owner 调用受限函数的失败场景

#### Scenario: 错误输入被测试覆盖

- **WHEN** 开发者运行 `npx hardhat test`
- **THEN** 测试集覆盖错误商品价格、错误卖家保证金、错误仲裁员保证金、错误纠纷押金、错误举报押金、空元数据哈希和空证据哈希的失败场景

#### Scenario: 重复结算被测试覆盖

- **WHEN** 开发者运行 `npx hardhat test`
- **THEN** 测试集覆盖重复购买、重复确认、重复退款、重复裁决、重复提款和卖家保证金重复结算的失败场景
- **AND** 测试断言已结束交易不能再次进入资金结算路径

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
