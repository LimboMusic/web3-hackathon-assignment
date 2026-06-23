# 项目工作流规格变更

## ADDED Requirements

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

项目 SHALL 把完成的测试批次、部署信息、重要实现决策和重大问题回写到 Obsidian。

#### Scenario: 工作完成

- **WHEN** 后续 agent 完成一次有意义的实现、测试运行或部署
- **THEN** agent 将结果追加到 `ObsidianVault/04-开发记录/开发记录.md`
- **AND** 如涉及部署，则记录到 `ObsidianVault/04-开发记录/部署记录.md`
