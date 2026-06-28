# fix-ui-eval-demo-ux

## 为什么改

内置浏览器 UI 验收发现三处影响课堂演示的问题：侧边栏交易详情指向错误商品、顶栏遮挡演示控制台、React 控制台警告。

## 改什么

- 侧边栏交易详情链接改为 `CLASSROOM_TRADE_ID`（#4）
- 顶栏与演示控制台布局：顶栏可换行、控制台 z-index
- `DemoTradeProvider` 市场同步改为 `queueMicrotask` 延迟，避免 render 中更新父 Context
- 仲裁日志 id 加随机后缀，避免 duplicate key

## 影响范围

- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/DemoControlPanel.tsx`
- `frontend/src/styles/layout.css`
- `frontend/src/context/DemoTradeContext.tsx`
- `frontend/src/pages/Arbitration.tsx`
