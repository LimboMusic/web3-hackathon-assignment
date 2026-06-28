# 搭建前端交易市场 Marketplace 页面

## 为什么

Marketplace 是课堂演示中说明“卖家如何发布商品、买家如何选择并进入托管交易”的入口页面。它需要把商品列表、状态标签、价格、卖家信息、购买入口和创建商品表单放在同一套清晰的交易界面中。

现有设计稿 `ObsidianVault/02-方案设计/UI设计稿/marketplace.html` 已经定义了商品网格、搜索筛选、状态标签和右侧创建商品表单。本 change 将其转化为 React + TypeScript + Vite 静态骨架，并为后续真实 `createItem` / `purchaseItem` 接入预留组件边界。

## 改什么

- 新增 Marketplace 页面和路由入口。
- 复刻设计稿中的商品列表、搜索栏、状态筛选、商品卡片和创建商品表单。
- 使用 mock 商品数据呈现 `Created`、`Locked`、`Delivered`、`Inactive` 等状态。
- 创建商品和购买按钮仅做静态模拟，展示 pending/success/failed 和事件提示，不发起链上交易。
- 商品卡片入场、筛选结果变化、创建成功和购买反馈动画统一使用 `gsap`；如后续环境提供 GSAP skill，实现前必须先加载该 skill。

## 影响范围

- 影响 `frontend/` 的页面、商品卡片组件、创建商品表单组件和样式。
- 依赖第 9 步共享布局；如共享布局尚未完成，可在本 change 中补齐最小布局。
- 不修改合约、测试、部署脚本，不读取真实 ABI 或发起钱包交易。
