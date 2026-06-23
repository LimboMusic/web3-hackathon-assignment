# 项目工作流规格

## Purpose

定义本项目后续开发、文档、OpenSpec change、测试和部署记录的固定协作流程，确保所有重要工作都先有 Obsidian 记录，再有 OpenSpec 规格，最后进入实现并回写结果。

## Requirements

### Requirement: Obsidian 优先开发

项目 SHALL 在创建 OpenSpec change 之前，先把所有重要后续开发工作记录到 Obsidian。

#### Scenario: 收到新功能请求

- **WHEN** 后续 agent 被要求实现新的合约、前端、部署、报告或 PPT 功能
- **THEN** agent 先阅读 `ObsidianVault/` 中的相关文件
- **AND** 在创建 OpenSpec change 前，先把需求或设计决策记录到 Obsidian

### Requirement: 实现前必须创建 OpenSpec change

项目 SHALL 要求重要功能、业务规则变化、合约状态机变化、部署工作或重要修复在实现前创建新的 OpenSpec change。

#### Scenario: 需要开始实现

- **WHEN** 一次变更需要编辑合约、测试、前端、部署脚本、报告或展示材料
- **THEN** agent 在 `openspec/changes/` 下创建新的目录
- **AND** 至少包含 `proposal.md` 和 `tasks.md`
- **AND** 行为或需求变化时补充 spec delta
- **AND** 只在 OpenSpec change 创建完成后开始实现

### Requirement: 完成结果回写 Obsidian

项目 SHALL 把完成的测试批次、部署信息、重要实现决策、重大问题和仓库同步结果回写到 Obsidian。

#### Scenario: 工作完成

- **WHEN** 后续 agent 完成一次有意义的实现、测试运行或部署
- **THEN** agent 将结果追加到 `ObsidianVault/04-开发记录/开发记录.md`
- **AND** 如涉及部署，则记录到 `ObsidianVault/04-开发记录/部署记录.md`

#### Scenario: 推送远程仓库完成

- **WHEN** agent 完成一次 git commit 和 push
- **THEN** agent 将提交信息、目标分支和推送结果追加到 `ObsidianVault/04-开发记录/开发记录.md`

### Requirement: OpenSpec 内容优先中文

项目 SHALL 优先使用中文编写 OpenSpec 文档，便于课程项目阅读、汇报和后续维护。

#### Scenario: 创建或修改 OpenSpec 文档

- **WHEN** agent 创建或修改 `openspec/` 下的文档
- **THEN** 正文、任务描述、需求说明和影响说明尽量使用中文
- **AND** 工具要求的结构关键词、命令、目录名、文件名、代码标识和专有名词可以保留英文
