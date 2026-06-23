# OpenSpec 工作流

> 记录日期：2026-06-23
> 目的：把后续开发固定为“先 Obsidian 记录，再 OpenSpec 变更，再代码实现”。

---

## 1. 为什么加入 OpenSpec

本项目同时需要完成智能合约、前端、报告和课堂展示。为了避免直接写代码导致设计、测试和文档不同步，后续每次开发都先通过 OpenSpec change 描述本次变更。

Obsidian 负责记录讨论、课程交付材料和最终说明；OpenSpec 负责把即将开发的功能拆成可检查的需求、任务和验收标准。

---

## 2. 固定流程

后续所有功能开发、规则调整和重要修复都必须按以下顺序执行：

1. 阅读现有 Obsidian 文档，确认项目方向和上下文。
2. 在 Obsidian 中记录本次需求、设计决策或问题背景。
3. 在 `openspec/changes/` 下创建一个新的 change。
4. 在 change 中写清楚 `proposal.md`、`tasks.md`，必要时补充 `design.md` 和规格变更。
5. 评审 OpenSpec change 是否覆盖业务规则、合约状态、前端交互和测试要求。
6. 再开始修改合约、测试、前端或报告。
7. 完成后把测试结果和关键实现记录回 `[[开发记录]]`。

---

## 3. Change 命名约定

OpenSpec change 使用短横线命名，建议格式：

```text
add-escrow-contract
add-refund-flow
add-arbitration-voting
add-frontend-demo
deploy-sepolia
```

命名应体现动作和范围，避免使用 `update`、`fix` 这类过于笼统的名称。

---

## 4. 当前初始化 Change

本次初始化使用：

```text
openspec/changes/add-openspec-workflow/
```

该 change 用于记录项目加入 OpenSpec 以及后续开发流程调整。
