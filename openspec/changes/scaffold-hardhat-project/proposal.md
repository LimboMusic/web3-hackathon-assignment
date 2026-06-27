# 提案：初始化 Hardhat 工程骨架

## 背景

方案设计已经定稿（见 [[项目讨论结果-去中心化二手交易担保托管]]），并在 [[技术实现文档]] 中按时间顺序拆成 11 个实现步骤。本 change 是第 1 步，负责为后续所有合约、测试、部署工作搭建一个可编译、可测试的 Hardhat 工程骨架。

此步骤不实现任何业务逻辑，只确保开发地基就绪：依赖安装、编译配置、网络配置、目录结构和密钥占位约定。

## 变更内容

- 初始化 npm 工程与 Hardhat 依赖：Hardhat、`@nomicfoundation/hardhat-toolbox`、ethers v6、`@openzeppelin/contracts`。
- 配置 `hardhat.config`：Solidity 版本（与 OpenZeppelin 兼容，如 `0.8.20` 以上）、编译优化、Sepolia 网络（RPC URL 与部署私钥从环境变量读取）。
- 建立目录骨架 `contracts/`、`scripts/`、`test/`，放置最小占位合约与占位测试，保证 `compile` 与 `test` 可跑通。
- 新增 `.env.example`，约定 `SEPOLIA_RPC_URL`、`PRIVATE_KEY` 等变量名；将 `.env` 与 `node_modules/` 等加入 `.gitignore`，不提交真实密钥。
- 回写 [[开发记录]]，记录骨架初始化的准备与完成结果，并在 [[技术实现文档]] 总览表中更新第 1 步状态。

## 影响范围

- 新增：`package.json`、`hardhat.config.*`、`.env.example`、`.gitignore`
- 新增：`contracts/`、`scripts/`、`test/` 目录与占位文件
- 文档：`ObsidianVault/02-方案设计/技术实现文档.md`、`ObsidianVault/04-开发记录/开发记录.md`
- 规格：`openspec/changes/scaffold-hardhat-project/`

## 非目标

- 不实现担保托管、退款、仲裁、保证金等任何业务合约逻辑（留给第 2 步及之后）。
- 不编写部署脚本的实际部署逻辑、不实际部署到 Sepolia（留给第 8 步 `deploy-sepolia`）。
- 不创建前端工程（留给第 9 步 `add-frontend-demo`）。
- 不提交私钥、助记词、真实 `.env` 或私密 RPC API Key。
