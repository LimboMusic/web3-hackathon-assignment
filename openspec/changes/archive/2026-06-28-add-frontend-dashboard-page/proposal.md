# 搭建前端总览 Dashboard 页面

## 为什么

第 9 步前端演示骨架已经从单页 Demo 调整为五页面课堂演示应用。Dashboard 是老师和评委进入系统后的第一屏，需要快速说明项目不是介绍页，而是可操作的 Web3 控制台：能看钱包、网络、交易状态、当前演示订单、生命周期进度和最近链上事件。

现有设计稿 `ObsidianVault/02-方案设计/UI设计稿/dashboard.html` 已经定义了总览页的信息架构、侧边栏、顶部状态栏、演示交易快照、状态时间线和事件列表。本 change 将其转化为 React + TypeScript + Vite 前端骨架中的 Dashboard 页面。

## 改什么

- 初始化或维护 `frontend/` React + TypeScript + Vite 前端骨架所需的页面、路由和共享布局基础。
- 新增 Dashboard 页面，优先复刻 `dashboard.html` 的导航、顶部状态栏、页面标题、统计卡片、当前课堂演示交易快照、最近事件列表和横向状态时间线。
- 使用静态 mock 数据和模拟交互表现 `Idle / Pending / Success / Failed` 交易状态，不接入真实合约读写。
- 页面动画统一使用 `gsap`，如后续环境提供 GSAP skill，实现前必须先加载该 skill；当前 change 先写明动画边界和预期动效，不手写与 GSAP 冲突的 CSS 动画体系。
- 为后续 `integrate-frontend-contract` 预留数据接口、组件边界和事件日志结构。

## 影响范围

- 影响 `frontend/` 目录下的 React + TypeScript 页面、组件、样式和静态数据。
- 不修改 Solidity 合约、Hardhat 测试、部署脚本或 Sepolia 部署产物。
- 不接入 MetaMask、Ethers.js、ABI 或真实链上事件；这些留给第 10 步。
