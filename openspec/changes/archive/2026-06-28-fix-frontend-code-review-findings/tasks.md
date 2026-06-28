# 任务清单

## 1. 仓库 hygiene

- [x] 根目录 `.gitignore` 增加 `.agents/`、`.serena/`、`skills-lock.json`。

## 2. 前端路由

- [x] `App.tsx` 使用 `HashRouter` 替代 `BrowserRouter`。
- [x] 确认五页导航与占位路由仍正常工作。

## 3. Dashboard mock 一致性

- [x] `mockDashboard.ts` 保持 Delivered 状态，待处理纠纷数为 0。
- [x] 最近事件最新一条改为交付/等待确认相关，移除 DisputeOpened。
- [x] `activeStepIndex` 与时间线 active 节点与 Delivered 一致。

## 4. 文档与 lint

- [x] 更新 Obsidian 开发记录与归档 dashboard tasks 中的 OpenSpec 校验命令。
- [x] 拆分 `useDemoUI` 至独立文件并更新所有 import。

## 5. 验证

- [x] `rtk npm --prefix frontend run build`
- [x] `rtk npm --prefix frontend run lint`
- [x] `rtk npx openspec validate frontend-demo --strict`
- [x] `rtk npx openspec validate fix-frontend-code-review-findings --strict`
- [x] 回写 Obsidian 开发记录（修复项、验证结果、剩余风险）
