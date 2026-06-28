# 提案：细化 OpenSpec 任务清单写法

## 背景

当前部分 OpenSpec `tasks.md` 任务粒度偏粗，例如只写“实现合约”“编写测试”“回写文档”。这种写法无法明确告诉后续 agent 应该编辑哪些文件、遵守哪些代码规范、如何验证完成，容易导致实现范围漂移、遗漏测试或重复理解需求。

本项目后续会持续增加合约、测试、前端、部署、报告和 PPT 内容。为了让每个 change 都能被稳定接手，需要把 `tasks.md` 统一成“文件级任务 + 代码规范 + 验收命令”的格式。

## 变更内容

- 在项目工作流规格中新增 OpenSpec `tasks.md` 详细度要求。
- 要求后续每个重要 change 的 `tasks.md` 至少写明：
  - 目标文件或目录；
  - 具体函数、组件、脚本、测试文件或文档章节；
  - 关键代码规范、安全规范或文档规范；
  - 对应的验证命令、测试场景或人工检查点；
  - 不做什么，避免范围膨胀。
- 同步细化当前 active change `add-escrow-core-contract/tasks.md`，作为后续合约类 change 的参考模板。

## 影响范围

- `openspec/project.md`
- `openspec/specs/project-workflow/spec.md`
- `openspec/changes/add-escrow-core-contract/tasks.md`
- `ObsidianVault/04-开发记录/开发记录.md`
- `openspec/changes/strengthen-openspec-task-detail/`

## 非目标

- 不修改 Solidity 合约实现。
- 不新增 Hardhat 测试代码。
- 不归档已有 change。
- 不强制重写已经完成并归档的历史 `tasks.md`。
