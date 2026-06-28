# Tasks: fix-frontend-mock-marketplace-trade-sync

## 1. Mock 数据层

- [x] 1.1 新建 `mockCatalog.ts`：`CATALOG_SEED_ITEMS`、映射与事件派生函数
- [x] 1.2 `mockMarketplace.ts` re-export catalog 函数
- [x] 1.3 `mockTrade.ts` 委托 catalog，保留 `getFundsForState` / `TRADE_TIMELINE_STATES`

## 2. 共享状态

- [x] 2.1 扩展 `useDemoUI.ts` 类型定义
- [x] 2.2 `DemoUIContext.tsx` 实现 marketplace store 方法

## 3. 页面接线

- [x] 3.1 `Marketplace.tsx` 使用 context 替代本地 items state
- [x] 3.2 `TradeDetail.tsx` 从 context 初始化并在模拟操作后 sync 状态

## 4. 验证

- [x] 4.1 `npm run build:frontend` 通过
- [x] 4.2 `npm --prefix frontend run lint` 通过
- [x] 4.3 `npx openspec validate fix-frontend-mock-marketplace-trade-sync --strict` 通过
- [x] 4.4 回写 Obsidian 开发记录
