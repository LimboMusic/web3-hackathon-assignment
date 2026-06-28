# 修复前端 Code Review 发现项

## 为什么

Dashboard 页面实现与仓库 hygiene 在 code review 中暴露出五类问题：本地 agent 目录可能被误提交、静态部署下 BrowserRouter 刷新 404、Dashboard mock 状态自相矛盾、OpenSpec 校验命令不可复现、以及 React Fast Refresh lint 警告。这些问题会影响演示稳定性、文档可信度和后续开发体验。

## 改什么

- 根目录 `.gitignore` 增加 `.agents/`、`.serena/`、`skills-lock.json`。
- `frontend/src/App.tsx` 将 `BrowserRouter` 改为 `HashRouter`，保持五页导航不变。
- `frontend/src/data/mockDashboard.ts` 统一为 Delivered 演示态：待处理纠纷数 0、时间线 active 在 Delivered、最近事件不含 DisputeOpened。
- 修正 `ObsidianVault/04-开发记录/开发记录.md` 与归档 change tasks 中的 OpenSpec 校验命令为 `rtk npx openspec validate frontend-demo --strict`。
- 将 `useDemoUI` 拆至 `frontend/src/context/useDemoUI.ts`，`DemoUIContext.tsx` 仅导出 Provider 组件。

## 影响范围

- 影响根目录 `.gitignore`、`frontend/` 路由与 context 结构、Dashboard mock 数据、Obsidian 开发记录与归档 tasks 文档。
- 不修改合约、测试、部署脚本；不删除用户本地 `.agents/`、`.serena/` 文件。
