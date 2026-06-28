# 项目上下文

## 项目目标

构建一个课程 Demo：去中心化二手交易担保托管平台。项目聚焦校园二手交易场景，通过智能合约实现透明托管、退款处理、超时放款、多签仲裁和仲裁员保证金。

## 必须遵守的开发流程

后续所有工作都必须按以下顺序执行：

1. 阅读 `ObsidianVault/` 中的相关 Obsidian 文档。
2. 先在 Obsidian 中记录需求、设计决策、问题背景、测试结果或部署结果。
3. 在 `openspec/changes/` 下创建新的 OpenSpec change。
4. 在 OpenSpec change 中写清楚 proposal、tasks、需求和验收标准。
5. 只有在 Obsidian 记录和 OpenSpec change 都存在后，才能实现合约、测试、前端、报告或 PPT。
6. 完成测试、部署或重要实现后，把结果回写到 Obsidian。

## OpenSpec 任务清单粒度

后续每个 `openspec/changes/<change-name>/tasks.md` 都必须写到后续 agent 可以直接执行的粒度，不能只写泛泛的“实现功能”“编写测试”。

`tasks.md` 至少应包含：

- 目标文件或目录，例如 `contracts/EscrowMarketplace.sol`、`test/EscrowMarketplace.test.js`、`frontend/src/App.jsx`。
- 具体函数、组件、脚本或文档章节，例如 `createItem`、`purchaseItem`、`withdrawProceeds`、`SellerPanel`。
- 关键代码规范或文档规范，例如先更新状态再转账、使用 pull payment、事件必须包含 `itemId`、错误提示必须可被课堂演示理解。
- 验证方式，例如 `npx hardhat compile`、`npx hardhat test`、前端人工检查点、部署记录字段。
- 本次不做的范围，避免把退款、仲裁、前端、部署等后续步骤混入当前 change。

合约类任务必须额外写清楚权限检查、状态检查、金额检查、事件、错误处理、重入保护和测试场景。前端类任务必须额外写清楚钱包连接、网络展示、合约读取、交易提交、错误提示和事件日志的处理范围。

## OpenSpec 语言约定

- OpenSpec 文档正文优先使用中文。
- 工具要求的结构关键词可以保留英文，例如 `Requirement`、`Scenario`、`ADDED Requirements`、`MODIFIED Requirements`。
- 命令、目录名、文件名、代码标识、技术名词可以保留英文，例如 `openspec validate`、`proposal.md`、`tasks.md`、`Solidity`。

## 技术栈

- Solidity 智能合约
- Hardhat 或 Remix IDE
- MetaMask
- Ethers.js
- React + TypeScript + Vite 前端
- Sepolia 测试网
- Obsidian 文档库
- OpenSpec 变更规格

## 关键目录

- `ObsidianVault/`：项目讨论、设计文档、报告、PPT 大纲和开发记录
- `openspec/`：OpenSpec 项目上下文、进行中的变更和已确认规格
- `contracts/`：Solidity 合约
- `scripts/`：部署脚本
- `test/`：Hardhat 测试
- `frontend/`：React + TypeScript + Vite Demo 前端

## 全局约束

- 创建新的 OpenSpec change 前，不能跳过 Obsidian 记录。
- 开始实现前，必须先创建新的 OpenSpec change。
- OpenSpec `tasks.md` 必须细化到文件名、函数/组件/脚本/章节、代码规范和验证方式。
- 不覆盖用户已有 Obsidian 内容，除非用户明确要求。
- 不提交私钥、助记词、真实 `.env` 文件或私密 RPC API Key。
- Demo 必须围绕课程要求和核心担保托管流程展开。
