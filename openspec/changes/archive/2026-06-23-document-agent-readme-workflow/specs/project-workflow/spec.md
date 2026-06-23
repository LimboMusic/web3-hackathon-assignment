# 项目工作流规格变更

## MODIFIED Requirements

### Requirement: Obsidian 优先开发

项目 SHALL 在 agent 面向的说明和仓库面向的文档中清楚展示 Obsidian 优先的工作流。

#### Scenario: 后续 agent 开始工作

- **WHEN** 后续 agent 阅读 `AGENTS.md`
- **THEN** 文件开头附近说明 Obsidian 记录、OpenSpec change 和实现的必需顺序
- **AND** 指令明确说明：在 Obsidian 记录和 OpenSpec change 存在前，不得开始实现

#### Scenario: 新读者打开仓库

- **WHEN** 新读者打开 `README.md`
- **THEN** README 说明项目方向
- **AND** README 记录必需开发流程
