# 修复前端 Page Review Findings（第二轮）

## 为什么

Code review 发现 Trade Detail 操作按钮函数名与真实合约 ABI 不一致；Marketplace 新建商品固定使用 `DEMO_SELLER` 导致无法演示「卖家不能购买自己商品」；`walletMatchesAddress` 使用地址前缀猜测存在误判风险。

## 改什么

- Trade Detail：`agreeRefund()` → `approveRefund()`，`payDisputeDeposit()` → `respondDispute()`；事件与状态逻辑不变。
- Marketplace：新建商品 seller 使用当前 mock 连接钱包的完整地址与短地址；自购商品禁用购买按钮并显示提示；保留至少一个其他卖家 Created 商品。
- `walletMatch.ts`：集中定义 mock 地址常量；`walletMatchesAddress` 仅支持完整地址大小写无关匹配或标准 shortAddress 精确匹配。
- `DemoUIContext`：向消费方暴露 `walletAddressFull`，供 Marketplace 创建商品与地址比对使用。

## 影响范围

- `frontend/src/pages/TradeDetail.tsx`、`frontend/src/pages/Marketplace.tsx`
- `frontend/src/utils/walletMatch.ts`、`frontend/src/context/DemoUIContext.tsx`、`frontend/src/context/useDemoUI.ts`
- `frontend/src/data/mockMarketplace.ts`、`frontend/src/animations/useTxStatusAnimation.ts`
- 不修改合约、不接入真实钱包。
