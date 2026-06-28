# 项目工作流规格变更

## MODIFIED Requirements

### Requirement: 实现前必须创建 OpenSpec change

项目 SHALL 要求重要功能、业务规则变化、合约状态机变化、部署工作或重要修复在实现前创建新的 OpenSpec change，并且 `tasks.md` 必须细化到后续 agent 可以直接执行的程度。

#### Scenario: 需要开始实现

- **WHEN** 一次变更需要编辑合约、测试、前端、部署脚本、报告或展示材料
- **THEN** agent 在 `openspec/changes/` 下创建新的目录
- **AND** 至少包含 `proposal.md` 和 `tasks.md`
- **AND** 行为或需求变化时补充 spec delta
- **AND** `tasks.md` 必须列出本次预计编辑的文件路径、核心函数/组件/脚本/章节、关键代码规范或文档规范、验证命令或人工检查点
- **AND** `tasks.md` 必须写明本次不做的范围，避免后续实现范围膨胀
- **AND** 只在 OpenSpec change 创建完成后开始实现

#### Scenario: 编写合约类 change 的任务清单

- **WHEN** agent 创建或修改合约相关 change 的 `tasks.md`
- **THEN** 任务必须明确合约文件名、合约名、核心状态变量、外部函数、事件、错误处理、安全约束和测试文件名
- **AND** 安全约束至少说明权限检查、状态检查、金额检查、状态更新与外部转账顺序、是否需要重入保护
- **AND** 测试任务必须列出要覆盖的主流程、失败场景和重复操作场景

#### Scenario: 编写前端或文档类 change 的任务清单

- **WHEN** agent 创建或修改前端、报告、PPT 或部署相关 change 的 `tasks.md`
- **THEN** 任务必须明确页面/组件/脚本/文档文件名、用户可见行为、输入输出、错误提示、演示检查点或部署记录字段
- **AND** 前端任务必须写明钱包、网络、合约读取、交易提交和事件展示的处理范围
