# 搭建前端交易详情 Trade Detail 页面

## 为什么

Trade Detail 是五页面中最关键的课堂演示页面，需要把单笔交易的完整状态机讲清楚：创建、付款托管、卖家交付、买家确认、申请退款、卖家同意退款、发起纠纷、补交纠纷押金、超时放款。它直接对应合约主流程和报告中的业务流程图。

现有设计稿 `ObsidianVault/02-方案设计/UI设计稿/trade-detail.html` 已经包含交易摘要、状态机时间线、卖家/买家操作、纠纷押金提示、证据哈希输入和链上事件监听区域。本 change 将其转化为 React + TypeScript + Vite 静态骨架。

## 改什么

- 新增 Trade Detail 页面和路由入口。
- 复刻设计稿中的交易摘要、状态标签、资金流向、状态机时间线、角色操作面板和事件日志。
- 用 mock 状态机驱动按钮可用性和页面反馈。
- 状态机节点切换、资金流向高亮、角色操作反馈和事件日志追加动画统一使用 `gsap`；如后续环境提供 GSAP skill，实现前必须先加载该 skill。
- 预留第 10 步接入 `markDelivered`、`confirmReceived`、`requestRefund`、`approveRefund`、`openDispute`、`respondDispute`、`releaseAfterTimeout` 的组件边界。

## 影响范围

- 影响 `frontend/` 的交易详情页面、状态机展示组件、角色操作组件和事件日志组件。
- 不修改合约、测试或部署脚本。
- 不发起真实钱包交易，不读取真实链上订单。
