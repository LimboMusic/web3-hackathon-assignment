# 修复 Marketplace / TradeDetail Mock 数据不一致

## 为什么

Marketplace 与 TradeDetail 使用两套独立 mock 种子，导致同一商品 id 在列表与详情页展示不同 title、price、seller、state、metadataHash。Marketplace 购买后状态仅保存在页面本地，TradeDetail 无法读取 Locked。`mockTrade.ts` 对 id=2 硬编码 Disputed 且初始事件含 DisputeResolved，与 Marketplace 的 Delivered 状态语义冲突。

## 改什么

- 新建 `frontend/src/data/mockCatalog.ts`：单一种子目录，含 marketplace 字段与 trade 附加字段；提供 `marketplaceItemToTradeDetail`、`getInitialTradeEventsFromTrade`。
- `mockMarketplace.ts` / `mockTrade.ts` 改为委托 catalog，移除 id 硬编码与默认键盘 fallback。
- 扩展 `DemoUIProvider`：共享 `marketplaceItems` 及 add/purchase/sync/get 方法。
- `Marketplace.tsx`、`TradeDetail.tsx` 从 context 读取并回写商品状态。
- Disputed 种子订单初始事件不含 DisputeResolved；仅 Inactive 且已裁决场景可含。

## 影响范围

- `frontend/src/data/mockCatalog.ts`（新建）
- `frontend/src/data/mockMarketplace.ts`、`frontend/src/data/mockTrade.ts`
- `frontend/src/context/DemoUIContext.tsx`、`frontend/src/context/useDemoUI.ts`
- `frontend/src/pages/Marketplace.tsx`、`frontend/src/pages/TradeDetail.tsx`
- 不修改 HashRouter、合约、Dashboard/Arbitration mock。
