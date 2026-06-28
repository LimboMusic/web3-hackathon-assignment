# 任务清单

- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 追加本次流程改进的准备记录，说明用户反馈和调整范围。
- [x] 新增 `openspec/changes/strengthen-openspec-task-detail/proposal.md`，说明为什么要细化 `tasks.md`、改哪些文件、不改哪些实现。
- [x] 新增 `openspec/changes/strengthen-openspec-task-detail/specs/project-workflow/spec.md`，在 `project-workflow` 能力下增加 `MODIFIED Requirements`，规定 `tasks.md` 必须细化到文件名、函数/组件/测试范围、代码规范和验收方式。
- [x] 更新 `openspec/project.md` 的全局约束，补充后续 OpenSpec `tasks.md` 的写作规范：
  - 必须列出目标文件路径，例如 `contracts/EscrowMarketplace.sol`、`test/EscrowMarketplace.test.js`。
  - 必须列出核心函数、组件、脚本或章节，例如 `createItem`、`purchaseItem`、`withdrawProceeds`。
  - 必须列出关键代码规范，例如状态先更新再转账、使用 pull payment、事件必须包含 `itemId`。
  - 必须列出验证方式，例如 `npx hardhat compile`、`npx hardhat test`、人工检查报告章节。
- [x] 更新 `openspec/specs/project-workflow/spec.md`，把详细任务清单写作要求合并到已确认规格中。
- [x] 重写当前 active change `openspec/changes/add-escrow-core-contract/tasks.md`，把合约、测试、文档、验证任务拆到具体文件和具体规范。
- [x] 运行 `openspec validate strengthen-openspec-task-detail --strict`，验证本 change 结构和 spec delta。
- [x] 回写 `ObsidianVault/04-开发记录/开发记录.md`，记录本次流程规则和任务清单细化已完成。
