# 项目工作流规格变更

## MODIFIED Requirements

### Requirement: 完成结果回写 Obsidian

项目 SHALL 把完成的测试批次、部署信息、重要实现决策、重大问题和仓库同步结果回写到 Obsidian。

#### Scenario: 推送远程仓库完成

- **WHEN** agent 完成一次 git commit 和 push
- **THEN** agent 将提交信息、目标分支和推送结果追加到 `ObsidianVault/04-开发记录/开发记录.md`
