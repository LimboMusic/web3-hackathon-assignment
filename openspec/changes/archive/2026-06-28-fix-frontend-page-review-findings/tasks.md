# 任务清单

## 0. 前置

- [x] 在 `ObsidianVault/04-开发记录/开发记录.md` 记录开始修复 code review findings。
- [x] 更新本 change 的 proposal 与 spec delta。

## 1. Trade Detail ABI 对齐

- [x] `TradeDetail.tsx`：「同意退款」按钮改为 `approveRefund()`。
- [x] `TradeDetail.tsx`：「补交纠纷押金」按钮改为 `respondDispute()`。
- [x] 保持中文说明自然，事件类型与状态迁移逻辑不变。

## 2. Marketplace 自购演示

- [x] `DemoUIContext` / `useDemoUI`：暴露 `walletAddressFull`（mock 连接后为 `DEMO_BUYER_FULL`）。
- [x] `Marketplace.tsx`：新建商品 seller 使用当前连接钱包地址，不再固定 `DEMO_SELLER`。
- [x] 连接钱包后自购商品显示「不可自购/不能购买自己的商品」，购买按钮禁用。
- [x] `mockMarketplace.ts`：保留其他卖家 Created 商品（如 id=4 机械键盘）。

## 3. walletMatchesAddress 修复

- [x] `walletMatch.ts`：集中定义 `DEMO_BUYER_FULL`、`DEMO_BUYER_SHORT`、`DEMO_SELLER_FULL`、`DEMO_SELLER_SHORT`。
- [x] 移除 `slice(0,5)` 前缀猜测；仅完整地址（大小写无关）或 shortAddress 精确匹配。
- [x] 消除 Marketplace、DemoUIContext、mockMarketplace 中散落的重复地址常量。

## 4. 验证

- [x] `rtk npm --prefix frontend run build`
- [x] `rtk npm --prefix frontend run lint`
- [x] `rtk npx openspec validate fix-frontend-page-review-findings --strict`
- [x] `rtk npx openspec validate frontend-demo --strict`

## 5. 回写

- [x] 在 Obsidian 开发记录追加完成项、验证命令与结果。
