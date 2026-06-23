# 加入 OpenSpec 工作流

## 为什么

项目已经使用 Obsidian 记录设计决策和课程交付物。随着后续实现合约、测试、前端、部署记录、报告和 PPT，项目需要更严格的开发前规格流程，确保每次变更都可追踪。

## 改什么

- 在仓库中新增 `openspec/` 目录。
- 在 `openspec/project.md` 中定义项目级 OpenSpec 上下文。
- 新增项目工作流规格，要求后续所有开发任务都先记录到 Obsidian，再创建 OpenSpec change。
- 更新 Obsidian 和 `AGENTS.md`，让后续 agent 遵守同样的顺序。

## 影响

- 后续开发从 Obsidian 文档记录开始。
- 每个重要功能、行为变化、测试批次、部署或架构决策都有独立的 OpenSpec change。
- 实现工作可以根据明确需求和任务进行检查。
