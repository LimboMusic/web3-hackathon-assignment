# 搭建前端部署演示 Deployment 页面

## 为什么

Deployment 页面用于答辩时展示“项目确实部署到了 Sepolia，并且前端知道自己连接的是哪个合约”。它需要集中展示合约地址、部署账户、交易哈希、构造参数、演示账户和端到端演示步骤，方便老师快速核对链上证据。

现有设计稿 `ObsidianVault/02-方案设计/UI设计稿/deployment.html` 已经定义了 Sepolia 部署信息、合约配置参数、演示账户表、状态机演示时间线和操作说明。本 change 将其转化为 React + TypeScript + Vite 静态骨架，并优先读取 `deployments/sepolia/EscrowMarketplace.json` 作为展示数据来源。

## 改什么

- 新增 Deployment 页面和路由入口。
- 展示 Sepolia 合约地址、部署账户、交易哈希、部署时间、构造参数和 ABI/网络摘要。
- 展示演示账户角色表和课堂端到端演示步骤。
- 使用静态读取或导入部署产物的方式填充页面；如构建工具限制 JSON 导入，可先用同步复制的 mock 数据，但必须保留后续接入部署产物的边界。
- 部署状态卡、参数表、演示步骤和复制/打开外链反馈动画统一使用 `gsap`；如后续环境提供 GSAP skill，实现前必须先加载该 skill。

## 影响范围

- 影响 `frontend/` 的部署展示页面、参数表、演示账户表、部署链接组件和样式。
- 读取或引用 `deployments/sepolia/EscrowMarketplace.json` 的公开部署信息。
- 不修改部署脚本、不重新部署合约、不提交真实 `.env`。
